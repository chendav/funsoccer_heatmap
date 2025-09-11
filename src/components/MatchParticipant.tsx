import React, { useState, useEffect } from 'react';
import api, { Match, Participant } from '@/services/api';

interface MatchParticipantProps {
  onSessionStart?: (sessionId: string) => void;
}

export default function MatchParticipant({ onSessionStart }: MatchParticipantProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 加入比赛表单
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');
  const [team, setTeam] = useState('');

  // 加载附近的比赛
  useEffect(() => {
    loadNearbyMatches();
  }, []);

  const loadNearbyMatches = async () => {
    try {
      setLoading(true);
      // TODO: 添加基于位置的查询
      const response = await api.match.list({ page: 1, page_size: 10 });
      setMatches(response.matches || []);
    } catch (err) {
      console.error('Failed to load matches:', err);
      setError('加载附近比赛失败');
    } finally {
      setLoading(false);
    }
  };

  // 加入比赛
  const handleJoinMatch = async () => {
    if (!joinCode) {
      setError('请输入比赛码');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const participant = await api.participant.joinMatch({
        join_code: joinCode,
        jersey_number: jerseyNumber ? parseInt(jerseyNumber) : undefined,
        position: position || undefined,
        team: team || undefined,
      });
      
      setCurrentParticipant(participant);
      setShowJoinForm(false);
      
      // 清空表单
      setJoinCode('');
      setJerseyNumber('');
      setPosition('');
      setTeam('');
    } catch (err) {
      console.error('Failed to join match:', err);
      setError('加入比赛失败，请检查比赛码是否正确');
    } finally {
      setLoading(false);
    }
  };

  // 开始运动
  const handleStartSports = async () => {
    if (!currentParticipant) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await api.participant.startPersonalSession(currentParticipant.id);
      
      // 更新参与者状态
      setCurrentParticipant({
        ...currentParticipant,
        is_active: true,
        session_id: result.session_id,
      });
      
      onSessionStart?.(result.session_id);
    } catch (err) {
      console.error('Failed to start sports:', err);
      setError('开始运动失败');
    } finally {
      setLoading(false);
    }
  };

  // 结束运动
  const handleStopSports = async () => {
    if (!currentParticipant) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await api.participant.stopPersonalSession(currentParticipant.id);
      
      // 更新参与者状态
      setCurrentParticipant({
        ...currentParticipant,
        is_active: false,
      });
      
      // 显示运动时长
      if (result.duration_seconds) {
        const minutes = Math.floor(result.duration_seconds / 60);
        const seconds = result.duration_seconds % 60;
        alert(`运动结束！时长：${minutes}分${seconds}秒`);
      }
    } catch (err) {
      console.error('Failed to stop sports:', err);
      setError('结束运动失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 第一步：查看附近比赛或输入比赛码 */}
      {!currentParticipant && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">加入比赛</h2>
          
          {/* 附近的比赛列表 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">附近的比赛</h3>
            {matches.length > 0 ? (
              <div className="space-y-2">
                {matches.map(match => (
                  <div key={match.id} className="p-3 border rounded hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{match.field_name}</p>
                        <p className="text-sm text-gray-600">
                          {match.match_type} - {new Date(match.created_at).toLocaleDateString()}
                        </p>
                        {match.team_a_name && match.team_b_name && (
                          <p className="text-sm text-gray-600">
                            {match.team_a_name} vs {match.team_b_name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setJoinCode(match.id); // 使用match ID作为join code
                          setShowJoinForm(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        加入
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">暂无附近的比赛</p>
            )}
          </div>

          {/* 手动输入比赛码 */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowJoinForm(true)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              输入比赛码加入
            </button>
          </div>

          {/* 加入比赛表单 */}
          {showJoinForm && (
            <div className="mt-4 p-4 border rounded bg-gray-50">
              <h3 className="font-semibold mb-3">加入比赛信息</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="比赛码"
                  className="w-full p-2 border rounded"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="球衣号码（可选）"
                  className="w-full p-2 border rounded"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="位置（可选）"
                  className="w-full p-2 border rounded"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
                <select
                  className="w-full p-2 border rounded"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                >
                  <option value="">选择队伍（可选）</option>
                  <option value="A">A队</option>
                  <option value="B">B队</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleJoinMatch}
                    disabled={!joinCode || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    确认加入
                  </button>
                  <button
                    onClick={() => {
                      setShowJoinForm(false);
                      setJoinCode('');
                    }}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 第二步：已加入比赛，控制运动 */}
      {currentParticipant && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">运动控制</h2>
          
          <div className="mb-4 p-4 bg-blue-50 rounded">
            <p className="font-semibold">已加入比赛</p>
            <p className="text-sm text-gray-600">比赛ID: {currentParticipant.match_id}</p>
            {currentParticipant.jersey_number && (
              <p className="text-sm text-gray-600">球衣号码: {currentParticipant.jersey_number}</p>
            )}
            {currentParticipant.position && (
              <p className="text-sm text-gray-600">位置: {currentParticipant.position}</p>
            )}
            {currentParticipant.team && (
              <p className="text-sm text-gray-600">队伍: {currentParticipant.team}</p>
            )}
          </div>

          {/* 运动控制按钮 */}
          <div className="flex justify-center">
            {!currentParticipant.is_active ? (
              <button
                onClick={handleStartSports}
                disabled={loading}
                className="px-8 py-4 bg-green-600 text-white text-lg rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                开始运动
              </button>
            ) : (
              <button
                onClick={handleStopSports}
                disabled={loading}
                className="px-8 py-4 bg-red-600 text-white text-lg rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                结束运动
              </button>
            )}
          </div>

          {currentParticipant.is_active && (
            <div className="mt-4 text-center">
              <p className="text-green-600 font-semibold animate-pulse">
                运动记录中...
              </p>
              <p className="text-sm text-gray-600 mt-2">
                系统正在记录您的运动数据
              </p>
            </div>
          )}
        </div>
      )}

      {/* 加载指示器 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">处理中...</p>
          </div>
        </div>
      )}
    </div>
  );
}