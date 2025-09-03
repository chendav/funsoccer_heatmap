"use client";

import { useState, useEffect } from "react";

interface MatchStats {
  total_distance_km: number | null;
  max_speed_kmh: number | null;
  avg_speed_kmh: number | null;
  active_time_minutes: number | null;
  position_category: string | null;
}

interface MatchRecord {
  match_id: string;
  global_id: number | null;
  confidence: number | null;
  session_start: string | null;
  session_end: string | null;
  city: string | null;
  is_private: boolean;
  allow_leaderboard: boolean;
  stats: MatchStats | null;
}

interface MatchHistoryProps {
  accessToken: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function MatchHistory({ accessToken }: MatchHistoryProps) {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (accessToken) {
      fetchMatches();
    }
  }, [accessToken, currentPage]);

  const fetchMatches = async () => {
    if (!accessToken) {
      setError("未找到访问令牌");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_BASE}/api/identity/matches?limit=${pageSize}&offset=${currentPage * pageSize}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setMatches(data.data.matches);
        setTotalCount(data.data.total_count);
        setError(null);
      } else {
        throw new Error('API返回错误状态');
      }
    } catch (err) {
      console.error('获取比赛历史失败:', err);
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未知时间";
    
    try {
      return new Date(dateString).toLocaleString("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "无效时间";
    }
  };

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start) return "未知";
    if (!end) return "进行中";
    
    try {
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      const durationMs = endTime - startTime;
      const minutes = Math.floor(durationMs / (1000 * 60));
      return `${minutes} 分钟`;
    } catch {
      return "无效";
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && matches.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">⚠️ 加载失败</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchMatches}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          重试
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">⚽</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          暂无比赛记录
        </h3>
        <p className="text-gray-500">
          参与比赛后，您的比赛历史将显示在这里
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计摘要 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">比赛统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{totalCount}</div>
            <div className="text-gray-500">总比赛数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {matches.filter(m => m.stats?.total_distance_km).length}
            </div>
            <div className="text-gray-500">有数据记录</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {matches.filter(m => m.allow_leaderboard).length}
            </div>
            <div className="text-gray-500">参与排行榜</div>
          </div>
        </div>
      </div>

      {/* 比赛列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">比赛历史</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {matches.map((match) => (
            <div key={match.match_id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">
                          {match.global_id || '?'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          比赛 {match.match_id.slice(-6)}
                        </h4>
                        {match.city && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            📍 {match.city}
                          </span>
                        )}
                        {match.stats?.position_category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {match.stats.position_category}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>开始: {formatDate(match.session_start)}</span>
                        <span>时长: {formatDuration(match.session_start, match.session_end)}</span>
                        {match.confidence && (
                          <span>置信度: {(match.confidence * 100).toFixed(1)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 比赛统计 */}
                  {match.stats && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">跑动距离</span>
                        <div className="font-medium">
                          {match.stats.total_distance_km 
                            ? `${match.stats.total_distance_km.toFixed(2)} km` 
                            : '-- km'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">平均速度</span>
                        <div className="font-medium">
                          {match.stats.avg_speed_kmh 
                            ? `${match.stats.avg_speed_kmh.toFixed(1)} km/h` 
                            : '-- km/h'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">最高速度</span>
                        <div className="font-medium">
                          {match.stats.max_speed_kmh 
                            ? `${match.stats.max_speed_kmh.toFixed(1)} km/h` 
                            : '-- km/h'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">活跃时间</span>
                        <div className="font-medium">
                          {match.stats.active_time_minutes 
                            ? `${match.stats.active_time_minutes} 分钟` 
                            : '-- 分钟'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 隐私状态 */}
                <div className="flex flex-col items-end space-y-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    match.is_private 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {match.is_private ? '🔒 私有' : '🔓 公开'}
                  </span>
                  {match.allow_leaderboard && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      🏆 排行榜
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow">
          <div className="text-sm text-gray-700">
            显示 {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalCount)} 条，
            共 {totalCount} 条记录
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              第 {currentPage + 1} / {totalPages} 页
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}