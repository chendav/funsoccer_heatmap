import React, { useState, useEffect } from 'react';
import api, { Match, Session, ProcessingTask } from '@/services/api';

interface SessionManagerProps {
  onSessionSelect?: (sessionId: string) => void;
}

export default function SessionManager({ onSessionSelect }: SessionManagerProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [processingTask, setProcessingTask] = useState<ProcessingTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 创建新比赛的表单状态
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [matchForm, setMatchForm] = useState({
    field_name: '',
    match_type: 'training' as const,
    team_a_name: '',
    team_b_name: ''
  });

  // 加载比赛列表
  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await api.match.list({ page: 1, page_size: 10 });
      setMatches(response.matches || []);
    } catch (err) {
      console.error('Failed to load matches:', err);
      setError('加载比赛列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建新比赛
  const handleCreateMatch = async () => {
    try {
      setLoading(true);
      setError(null);
      const match = await api.match.create(matchForm);
      setCurrentMatch(match);
      setShowCreateMatch(false);
      await loadMatches(); // 刷新列表
      
      // 重置表单
      setMatchForm({
        field_name: '',
        match_type: 'training',
        team_a_name: '',
        team_b_name: ''
      });
    } catch (err) {
      console.error('Failed to create match:', err);
      setError('创建比赛失败');
    } finally {
      setLoading(false);
    }
  };

  // 开始新会话
  const handleStartSession = async () => {
    if (!currentMatch) return;

    try {
      setLoading(true);
      setError(null);
      
      // 1. 创建会话
      const session = await api.session.start({
        match_id: currentMatch.id,
        player_count: 22,
        position_number: 1
      });
      
      setCurrentSession(session);
      
      // 2. 自动激活会话 - 这会触发边缘设备开始工作
      if (session.status === 'preparing') {
        const activatedSession = await api.session.activate(session.id);
        setCurrentSession(activatedSession);
        console.log('Session activated, edge devices will start capturing');
      }
      
      onSessionSelect?.(session.id);
    } catch (err) {
      console.error('Failed to start session:', err);
      setError('开始会话失败');
    } finally {
      setLoading(false);
    }
  };

  // 停止会话
  const handleStopSession = async () => {
    if (!currentSession) return;

    try {
      setLoading(true);
      setError(null);
      
      const session = await api.session.stop(currentSession.id);
      setCurrentSession(session);
      
      // 自动触发数据处理
      await handleProcessData();
    } catch (err) {
      console.error('Failed to stop session:', err);
      setError('停止会话失败');
    } finally {
      setLoading(false);
    }
  };

  // 激活会话
  const handleActivateSession = async () => {
    if (!currentSession) return;

    try {
      setLoading(true);
      setError(null);
      
      const session = await api.session.activate(currentSession.id);
      setCurrentSession(session);
    } catch (err) {
      console.error('Failed to activate session:', err);
      setError('激活会话失败');
    } finally {
      setLoading(false);
    }
  };

  // 触发数据处理
  const handleProcessData = async () => {
    if (!currentSession) return;

    try {
      setLoading(true);
      setError(null);
      
      const task = await api.processing.trigger(currentSession.id);
      setProcessingTask(task);
      
      // 轮询任务状态
      pollTaskStatus(task.id);
    } catch (err) {
      console.error('Failed to trigger processing:', err);
      setError('触发数据处理失败');
    } finally {
      setLoading(false);
    }
  };

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const task = await api.processing.getStatus(taskId);
        setProcessingTask(task);
        
        if (task.status === 'completed' || task.status === 'failed') {
          clearInterval(interval);
          
          if (task.status === 'completed') {
            // 处理完成，可以加载结果
            console.log('Processing completed');
          } else {
            setError('数据处理失败: ' + task.error_message);
          }
        }
      } catch (err) {
        console.error('Failed to poll task status:', err);
        clearInterval(interval);
      }
    }, 2000); // 每2秒轮询一次
  };

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 比赛选择/创建 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">比赛管理</h2>
        
        <div className="flex gap-4 mb-4">
          <select 
            className="flex-1 p-2 border rounded"
            value={currentMatch?.id || ''}
            onChange={(e) => {
              const match = matches.find(m => m.id === e.target.value);
              setCurrentMatch(match || null);
            }}
          >
            <option value="">选择比赛</option>
            {matches.map(match => (
              <option key={match.id} value={match.id}>
                {match.field_name} - {match.match_type} ({new Date(match.created_at).toLocaleDateString()})
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setShowCreateMatch(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            新建比赛
          </button>
        </div>

        {/* 创建比赛表单 */}
        {showCreateMatch && (
          <div className="border p-4 rounded bg-gray-50">
            <h3 className="font-semibold mb-3">创建新比赛</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="场地名称"
                className="w-full p-2 border rounded"
                value={matchForm.field_name}
                onChange={(e) => setMatchForm({...matchForm, field_name: e.target.value})}
              />
              <select
                className="w-full p-2 border rounded"
                value={matchForm.match_type}
                onChange={(e) => setMatchForm({...matchForm, match_type: e.target.value as any})}
              >
                <option value="training">训练</option>
                <option value="friendly">友谊赛</option>
                <option value="tournament">锦标赛</option>
                <option value="test">测试</option>
              </select>
              <input
                type="text"
                placeholder="A队名称（可选）"
                className="w-full p-2 border rounded"
                value={matchForm.team_a_name}
                onChange={(e) => setMatchForm({...matchForm, team_a_name: e.target.value})}
              />
              <input
                type="text"
                placeholder="B队名称（可选）"
                className="w-full p-2 border rounded"
                value={matchForm.team_b_name}
                onChange={(e) => setMatchForm({...matchForm, team_b_name: e.target.value})}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateMatch}
                  disabled={!matchForm.field_name || loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  创建
                </button>
                <button
                  onClick={() => setShowCreateMatch(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 会话控制 */}
      {currentMatch && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">会话控制</h2>
          
          {!currentSession ? (
            <button
              onClick={handleStartSession}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              开始新会话
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">会话ID: {currentSession.id}</p>
                  <p className="text-sm text-gray-600">
                    状态: <span className="font-medium">{currentSession.status}</span>
                  </p>
                  {currentSession.start_time && (
                    <p className="text-sm text-gray-600">
                      开始时间: {new Date(currentSession.start_time).toLocaleString()}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {currentSession.status === 'preparing' && (
                    <button
                      onClick={handleActivateSession}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      激活
                    </button>
                  )}
                  
                  {(currentSession.status === 'active' || currentSession.status === 'preparing') && (
                    <button
                      onClick={handleStopSession}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      停止
                    </button>
                  )}
                  
                  {currentSession.status === 'stopped' && !processingTask && (
                    <button
                      onClick={handleProcessData}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                      处理数据
                    </button>
                  )}
                </div>
              </div>

              {/* 处理任务状态 */}
              {processingTask && (
                <div className="p-4 bg-blue-50 rounded">
                  <h3 className="font-semibold mb-2">数据处理状态</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      状态: <span className="font-medium">{processingTask.status}</span>
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${processingTask.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">{processingTask.progress}% 完成</p>
                    {processingTask.error_message && (
                      <p className="text-sm text-red-600">{processingTask.error_message}</p>
                    )}
                  </div>
                </div>
              )}
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