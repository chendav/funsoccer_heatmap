"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import StatsCard from "@/components/dashboard/StatsCard";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import MatchHistory from "@/components/dashboard/MatchHistory";
import PrivacySettings from "@/components/dashboard/PrivacySettings";
import LoadingSpinner from "@/components/dashboard/LoadingSpinner";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UserStats {
  totalDistance: number;
  averageSpeed: number;
  maxSpeed: number;
  matchCount: number;
  bestPosition: string;
  totalCalories: number;
  totalActiveTime: number;
  positionBreakdown: Record<string, number>;
}

interface UserPrivacy {
  isPrivate: boolean;
  allowLeaderboard: boolean;
  dataLevel: string;
}

interface WeeklyData {
  week: string;
  distance: number;
  matches: number;
  avgSpeed: number;
}

interface UserDashboardData {
  userId: string;
  stats: UserStats;
  privacy: UserPrivacy;
  weeklyData: WeeklyData[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function Dashboard() {
  const { user, isAuthenticated, accessToken } = useAuth();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "privacy">("overview");

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/");
      return;
    }
    
    fetchUserStats();
  }, [isAuthenticated, user, router]);

  const fetchUserStats = async () => {
    if (!accessToken) {
      setError("未找到访问令牌");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE}/api/user/stats?days=30`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data: UserDashboardData = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('获取用户统计数据失败:', err);
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async (settings: Partial<UserPrivacy>) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/api/user/privacy`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('更新隐私设置失败');
      }

      // 刷新数据
      await fetchUserStats();
    } catch (err) {
      console.error('更新隐私设置失败:', err);
      setError(err instanceof Error ? err.message : '更新失败');
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
            onClick={fetchUserStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>暂无数据</p>
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
                  个人数据仪表板
                </h1>
                <p className="mt-2 text-gray-600">
                  欢迎回来，{user?.nickname || user?.username || "球员"}！
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push("/")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              数据概览
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              比赛历史
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "privacy"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              隐私设置
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="总跑动距离"
                value={`${dashboardData.stats.totalDistance} km`}
                icon="🏃‍♂️"
                color="blue"
              />
              <StatsCard
                title="平均速度"
                value={`${dashboardData.stats.averageSpeed} km/h`}
                icon="⚡"
                color="green"
              />
              <StatsCard
                title="最高速度"
                value={`${dashboardData.stats.maxSpeed} km/h`}
                icon="🚀"
                color="purple"
              />
              <StatsCard
                title="比赛场次"
                value={`${dashboardData.stats.matchCount} 场`}
                icon="⚽"
                color="orange"
              />
            </div>

            {/* Weekly Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                最近趋势
              </h3>
              <WeeklyChart data={dashboardData.weeklyData} />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  运动统计
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">主要位置</span>
                    <span className="font-medium">{dashboardData.stats.bestPosition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">总消耗卡路里</span>
                    <span className="font-medium">{dashboardData.stats.totalCalories} 卡</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">总活跃时间</span>
                    <span className="font-medium">{dashboardData.stats.totalActiveTime} 分钟</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  位置分布
                </h3>
                <div className="space-y-2">
                  {Object.entries(dashboardData.stats.positionBreakdown).map(([position, count]) => (
                    <div key={position} className="flex justify-between">
                      <span className="text-gray-600">{position}</span>
                      <span className="font-medium">{count} 场</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <MatchHistory accessToken={accessToken} />
          </div>
        )}

        {activeTab === "privacy" && (
          <div>
            <PrivacySettings 
              currentSettings={dashboardData.privacy}
              onUpdate={handlePrivacyUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}