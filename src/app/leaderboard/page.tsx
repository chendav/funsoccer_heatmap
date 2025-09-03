"use client";

import { useState, useEffect } from "react";
import LeaderboardTabs from "@/components/leaderboard/LeaderboardTabs";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import LeaderboardFilters from "@/components/leaderboard/LeaderboardFilters";
import LoadingSpinner from "@/components/dashboard/LoadingSpinner";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalDistance: number;
  averageSpeed: number;
  maxSpeed: number;
  matchCount: number;
  totalActiveTime: number;
  isAnonymous: boolean;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  totalParticipants: number;
  lastUpdated: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState<"distance" | "speed" | "activity">("distance");
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "season">("month");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, [activeCategory, timeFilter]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/leaderboard?category=${activeCategory}&period=${timeFilter}&limit=50`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`获取排行榜数据失败: ${response.status}`);
      }

      const data: LeaderboardData = await response.json();
      setLeaderboardData(data);
    } catch (err) {
      console.error('获取排行榜数据失败:', err);
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ 加载失败</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchLeaderboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  城市足球排行榜
                </h1>
                <p className="mt-2 text-gray-600">
                  查看本城市球员的运动表现排名
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  返回
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <LeaderboardFilters
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
          />
          
          <LeaderboardTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Statistics Summary */}
        {leaderboardData && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {leaderboardData.totalParticipants}
                </div>
                <div className="text-sm text-gray-600">参与排行榜的球员</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {leaderboardData.currentUserRank || '--'}
                </div>
                <div className="text-sm text-gray-600">您的当前排名</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">最后更新</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(leaderboardData.lastUpdated).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {leaderboardData && (
          <LeaderboardTable
            entries={leaderboardData.entries}
            category={activeCategory}
            currentUserRank={leaderboardData.currentUserRank}
          />
        )}

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-blue-600 text-xl">🔒</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                隐私保护说明
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• 排行榜仅显示同意参与的用户数据</p>
                <p>• 所有数据均经过匿名化处理，保护个人隐私</p>
                <p>• 您可以随时在个人设置中调整隐私级别</p>
                <p>• 完全私有模式的用户不会出现在排行榜中</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}