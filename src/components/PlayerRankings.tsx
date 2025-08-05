/**
 * 球员排行榜组件
 * 展示比赛中所有球员的统计数据排行
 */

import React, { useState } from "react";
import { translations, type Language } from "@/lib/translations";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { 
  formatDistance, 
  formatSpeed, 
  formatActiveTime,
  sortPlayersByDistance,
  sortPlayersBySpeed,
  sortPlayersByAverageSpeed,
  type PlayerStats 
} from "@/lib/playerStatsApi";

interface PlayerRankingsProps {
  matchId?: string;
  language: Language;
  className?: string;
}

type SortType = 'distance' | 'maxSpeed' | 'avgSpeed' | 'activeTime';

export default function PlayerRankings({ 
  matchId, 
  language, 
  className = "" 
}: PlayerRankingsProps) {
  const t = translations[language];
  const [sortBy, setSortBy] = useState<SortType>('distance');
  const [showAll, setShowAll] = useState(false);

  // 获取所有球员统计数据
  const { stats: allPlayerStats, loading, error, refresh, refreshPlayerStats } = usePlayerStats(
    matchId,
    { enabled: !!matchId }
  );

  // 排序数据
  const getSortedStats = (stats: PlayerStats[]): PlayerStats[] => {
    switch (sortBy) {
      case 'distance':
        return sortPlayersByDistance(stats);
      case 'maxSpeed':
        return sortPlayersBySpeed(stats);
      case 'avgSpeed':
        return sortPlayersByAverageSpeed(stats);
      case 'activeTime':
        return [...stats].sort((a, b) => b.active_time - a.active_time);
      default:
        return stats;
    }
  };

  const sortedStats = getSortedStats(allPlayerStats);
  const displayStats = showAll ? sortedStats : sortedStats.slice(0, 5);

  // 获取排序标签
  const getSortLabel = (type: SortType): string => {
    switch (type) {
      case 'distance': return '跑动距离';
      case 'maxSpeed': return '最高速度'; 
      case 'avgSpeed': return '平均速度';
      case 'activeTime': return '活跃时间';
      default: return '跑动距离';
    }
  };

  // 获取数值显示
  const getStatValue = (stat: PlayerStats, type: SortType): string => {
    switch (type) {
      case 'distance': return formatDistance(stat.total_distance);
      case 'maxSpeed': return formatSpeed(stat.max_speed);
      case 'avgSpeed': return formatSpeed(stat.average_speed);
      case 'activeTime': return formatActiveTime(stat.active_time);
      default: return formatDistance(stat.total_distance);
    }
  };

  if (!matchId) {
    return (
      <div className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>请选择比赛查看球员排行</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>加载失败: {error}</p>
          <button 
            onClick={refresh}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 ${className}`}>
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">球员排行榜</h3>
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        
        {/* 排序选择 */}
        <div className="flex flex-wrap gap-2">
          {(['distance', 'maxSpeed', 'avgSpeed', 'activeTime'] as SortType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSortBy(type)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                sortBy === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getSortLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* 数据刷新按钮 */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          共 {allPlayerStats.length} 名球员
        </p>
        <button
          onClick={refreshPlayerStats}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          刷新数据
        </button>
      </div>

      {/* 排行榜列表 */}
      <div className="space-y-3">
        {loading && allPlayerStats.length === 0 ? (
          // 加载骨架屏
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          ))
        ) : (
          displayStats.map((player, index) => (
            <div 
              key={player.global_id}
              className={`bg-gradient-to-r p-4 rounded-lg transition-all hover:shadow-md ${
                index === 0 
                  ? 'from-yellow-50 to-yellow-100 border-l-4 border-yellow-500' 
                  : index === 1
                  ? 'from-gray-50 to-gray-100 border-l-4 border-gray-400'
                  : index === 2
                  ? 'from-orange-50 to-orange-100 border-l-4 border-orange-500'
                  : 'from-blue-50 to-blue-100 border-l-4 border-blue-300'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* 排名 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 
                    ? 'bg-yellow-500 text-white' 
                    : index === 1
                    ? 'bg-gray-400 text-white'
                    : index === 2
                    ? 'bg-orange-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}>
                  {index + 1}
                </div>

                {/* 球员信息 */}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    球员 #{player.global_id}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-4">
                    <span>距离: {formatDistance(player.total_distance)}</span>
                    <span>速度: {formatSpeed(player.average_speed)}</span>
                    <span>时间: {Math.round(player.active_time / 60)}分钟</span>
                  </div>
                </div>

                {/* 主要指标 */}
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {getStatValue(player, sortBy)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getSortLabel(sortBy)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 展开/收起按钮 */}
      {allPlayerStats.length > 5 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {showAll ? '收起' : `查看全部 ${allPlayerStats.length} 名球员`}
          </button>
        </div>
      )}

      {/* 最后更新时间 */}
      {allPlayerStats.length > 0 && (
        <div className="text-center mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            数据实时更新中
          </div>
        </div>
      )}
    </div>
  );
}