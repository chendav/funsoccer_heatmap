'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { matchAPI, Match } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function MatchesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    fetchMatches();
  }, [page, isAuthenticated]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await matchAPI.list({ page, page_size: 10 });
      setMatches(response.data || []);
      setTotalPages(response.pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取比赛列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getMatchTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      friendly: '友谊赛',
      tournament: '锦标赛',
      training: '训练赛',
      test: '测试'
    };
    return labels[type] || type;
  };

  const getMatchTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      friendly: 'bg-green-100 text-green-800',
      tournament: 'bg-blue-100 text-blue-800',
      training: 'bg-yellow-100 text-yellow-800',
      test: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && matches.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载比赛列表...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">比赛管理</h1>
          <p className="mt-2 text-gray-600">查看和管理所有比赛记录</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 比赛列表 */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {matches.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">暂无比赛</h3>
              <p className="mt-1 text-sm text-gray-500">开始创建您的第一场比赛</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/matches/${match.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {match.field_name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMatchTypeColor(match.match_type)}`}>
                          {getMatchTypeLabel(match.match_type)}
                        </span>
                      </div>
                      
                      {(match.team_a_name || match.team_b_name) && (
                        <p className="mt-1 text-sm text-gray-600">
                          {match.team_a_name || '主队'} vs {match.team_b_name || '客队'}
                        </p>
                      )}
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>创建时间: {formatDate(match.created_at)}</span>
                        {match.scheduled_at && (
                          <span>计划时间: {formatDate(match.scheduled_at)}</span>
                        )}
                        <span className="flex items-center">
                          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {match.sessions_count || 0} 个会话
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              上一页
            </button>
            
            <span className="text-sm text-gray-700">
              第 {page} 页，共 {totalPages} 页
            </span>
            
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}