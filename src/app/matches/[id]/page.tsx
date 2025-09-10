'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { matchAPI, sessionAPI, Match, Session } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import HeatmapNew from '@/components/HeatmapNew';
import StatisticsDisplay from '@/components/StatisticsDisplay';

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const matchId = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'heatmap' | 'statistics'>('sessions');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    if (matchId) {
      fetchMatchDetails();
      fetchSessions();
    }
  }, [matchId, isAuthenticated]);

  const fetchMatchDetails = async () => {
    try {
      const data = await matchAPI.get(matchId);
      setMatch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取比赛详情失败');
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionAPI.list({ match_id: matchId });
      setSessions(response.data || []);
      if (response.data?.length > 0 && !selectedSessionId) {
        setSelectedSessionId(response.data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取会话列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      preparing: '准备中',
      active: '进行中',
      paused: '已暂停',
      stopped: '已停止',
      completed: '已完成',
      cancelled: '已取消'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      preparing: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-orange-100 text-orange-800',
      stopped: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}时${minutes}分${secs}秒`;
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  if (loading && !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载比赛详情...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => router.push('/matches')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回比赛列表
        </button>

        {/* 比赛信息头部 */}
        {match && (
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{match.field_name}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                match.match_type === 'friendly' ? 'bg-green-100 text-green-800' :
                match.match_type === 'tournament' ? 'bg-blue-100 text-blue-800' :
                match.match_type === 'training' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {match.match_type === 'friendly' ? '友谊赛' :
                 match.match_type === 'tournament' ? '锦标赛' :
                 match.match_type === 'training' ? '训练赛' : '测试'}
              </span>
            </div>
            
            {(match.team_a_name || match.team_b_name) && (
              <div className="mb-4">
                <p className="text-lg text-gray-700">
                  <span className="font-medium">{match.team_a_name || '主队'}</span>
                  <span className="mx-3 text-gray-500">VS</span>
                  <span className="font-medium">{match.team_b_name || '客队'}</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">创建时间</p>
                <p className="text-gray-900">{formatDate(match.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">计划时间</p>
                <p className="text-gray-900">{formatDate(match.scheduled_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">会话数量</p>
                <p className="text-gray-900">{match.sessions_count || 0} 个</p>
              </div>
              <div>
                <p className="text-gray-500">设备ID</p>
                <p className="text-gray-900">{match.device_id || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 标签页 */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sessions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                会话管理
              </button>
              <button
                onClick={() => setActiveTab('heatmap')}
                disabled={!selectedSessionId}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'heatmap'
                    ? 'border-blue-500 text-blue-600'
                    : selectedSessionId
                    ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    : 'border-transparent text-gray-300 cursor-not-allowed'
                }`}
              >
                热力图
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                disabled={!selectedSessionId}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'statistics'
                    ? 'border-blue-500 text-blue-600'
                    : selectedSessionId
                    ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    : 'border-transparent text-gray-300 cursor-not-allowed'
                }`}
              >
                数据统计
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* 会话列表 */}
            {activeTab === 'sessions' && (
              <div>
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">暂无会话</h3>
                    <p className="mt-1 text-sm text-gray-500">等待创建或开始新的会话</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedSessionId === session.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSessionId(session.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-lg font-medium text-gray-900">
                                会话 #{session.position_number || '-'}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                                {getStatusLabel(session.status)}
                              </span>
                            </div>
                            
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                              <div>
                                <span className="font-medium">开始时间:</span> {formatDate(session.start_time)}
                              </div>
                              <div>
                                <span className="font-medium">结束时间:</span> {formatDate(session.end_time)}
                              </div>
                              <div>
                                <span className="font-medium">持续时间:</span> {formatDuration(session.duration_seconds)}
                              </div>
                              <div>
                                <span className="font-medium">球员数:</span> {session.player_count || '-'}
                              </div>
                            </div>
                          </div>
                          
                          {selectedSessionId === session.id && (
                            <div className="flex-shrink-0 ml-4">
                              <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 热力图 */}
            {activeTab === 'heatmap' && selectedSessionId && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">球员位置热力图</h3>
                  <p className="text-sm text-gray-500">显示球员在场地上的活动热度分布</p>
                </div>
                <HeatmapNew 
                  sessionId={selectedSessionId}
                  resolution="high"
                />
              </div>
            )}

            {/* 统计数据 */}
            {activeTab === 'statistics' && selectedSessionId && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">比赛统计数据</h3>
                  <p className="text-sm text-gray-500">详细的比赛数据分析</p>
                </div>
                <StatisticsDisplay sessionId={selectedSessionId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}