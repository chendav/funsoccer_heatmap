'use client';

import React, { useEffect, useState } from 'react';
import { displayAPI } from '@/services/api';

interface Statistics {
  total_distance: number;
  average_speed: number;
  max_speed: number;
  active_time: number;
  area_coverage: number;
  player_count: number;
  session_duration: number;
  heat_intensity: number;
}

interface StatisticsDisplayProps {
  sessionId: string;
  className?: string;
}

export default function StatisticsDisplay({ sessionId, className = '' }: StatisticsDisplayProps) {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchStatistics();
    }
  }, [sessionId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await displayAPI.getStatistics(sessionId);
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const formatSpeed = (metersPerSecond: number) => {
    const kmPerHour = metersPerSecond * 3.6;
    return `${kmPerHour.toFixed(1)} km/h`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}时${minutes}分`;
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            onClick={fetchStatistics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>暂无统计数据</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: '总距离',
      value: formatDistance(statistics.total_distance),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: '平均速度',
      value: formatSpeed(statistics.average_speed),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: '最高速度',
      value: formatSpeed(statistics.max_speed),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      label: '活动时间',
      value: formatTime(statistics.active_time),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: '场地覆盖率',
      value: formatPercentage(statistics.area_coverage),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      label: '热度强度',
      value: statistics.heat_intensity.toFixed(1),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">统计数据</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* 额外信息 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">球员数量：</span>
            <span className="font-medium text-gray-900">{statistics.player_count} 人</span>
          </div>
          <div>
            <span className="text-gray-500">会话时长：</span>
            <span className="font-medium text-gray-900">{formatTime(statistics.session_duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}