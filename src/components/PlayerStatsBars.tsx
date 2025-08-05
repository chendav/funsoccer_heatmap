import React from "react";
import { translations, type Language } from "@/lib/translations";
import { useSinglePlayerStats } from "@/hooks/usePlayerStats";
import { formatSpeed } from "@/lib/playerStatsApi";

interface PlayerStatsBarsProps {
  language: Language;
  matchId?: string;
  globalId?: number;
}

/**
 * 属性条形图区组件（动态数据版）
 * 展示平均速度、最高速度、活跃时间、数据点四项数据，支持实时更新
 */
export default function PlayerStatsBars({ 
  language, 
  matchId, 
  globalId 
}: PlayerStatsBarsProps) {
  const t = translations[language];
  
  // 获取球员统计数据
  const { stats: playerStats, loading } = useSinglePlayerStats(
    matchId, 
    globalId,
    { enabled: !!matchId && globalId !== undefined }
  );

  // 计算显示数据
  const getDisplayStats = () => {
    if (playerStats) {
      // 将活跃时间转换为分钟显示
      const activeMinutes = Math.round(playerStats.active_time / 60);
      
      return [
        { 
          label: "平均速度", 
          value: Math.round(playerStats.average_speed), 
          unit: "km/h",
          loading: false 
        },
        { 
          label: "最高速度", 
          value: Math.round(playerStats.max_speed), 
          unit: "km/h",
          loading: false 
        },
        { 
          label: "活跃时间", 
          value: activeMinutes, 
          unit: "分钟",
          loading: false 
        },
        { 
          label: "数据点", 
          value: Math.round(playerStats.data_points / 100) * 100, // 简化显示
          unit: "个",
          loading: false 
        },
      ];
    }

    // 回退到静态数据或加载状态
    return [
      { label: t.speed || "速度", value: 10, unit: "", loading },
      { label: "体力", value: 12, unit: "", loading },
      { label: "进攻", value: 12, unit: "", loading },
      { label: "防守", value: 8, unit: "", loading },
    ];
  };

  const stats = getDisplayStats();
  const maxVal = Math.max(...stats.map(s => s.value));

  // 加载状态指示器
  const LoadingBar = ({ height }: { height: number }) => (
    <div
      className="bg-gray-200 rounded-t-lg rounded-b-md flex items-end justify-center animate-pulse"
      style={{ width: "48px", height: `${height}px` }}
    >
      <div className="w-6 h-1 bg-gray-400 rounded mb-4"></div>
    </div>
  );

  return (
    <div className="flex items-end gap-3 sm:gap-4 mt-8 mb-4 justify-center">
      {stats.map((stat, idx) => {
        const barHeight = stat.value > 0 ? Math.max(stat.value / maxVal * 120 + 40, 60) : 60;
        
        return (
          <div key={idx} className="flex flex-col items-center">
            {stat.loading ? (
              <LoadingBar height={barHeight} />
            ) : (
              <div
                className="bg-[#F5EFE2] rounded-t-lg rounded-b-md flex flex-col items-center justify-end relative overflow-hidden"
                style={{
                  width: "40px",
                  height: `${barHeight}px`,
                  transition: "height 0.5s ease-in-out"
                }}
              >
                {/* 数值显示 */}
                <div className="flex flex-col items-center mb-2">
                  <span className="text-lg sm:text-xl font-bold text-[#A6A29A]">
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-xs text-[#A6A29A] opacity-70 -mt-1">
                      {stat.unit}
                    </span>
                  )}
                </div>
                
                {/* 动画填充效果 */}
                {playerStats && (
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#D4C4A8] to-transparent opacity-30 transition-all duration-1000"
                    style={{
                      height: `${(stat.value / maxVal) * 80}%`,
                    }}
                  />
                )}
              </div>
            )}
            
            <div className="text-xs sm:text-base text-[#A6A29A] mt-2 tracking-widest text-center leading-tight max-w-[50px]">
              {stat.label}
            </div>
            
            {/* 实时数据指示器 */}
            {playerStats && idx === 0 && (
              <div className="text-xs text-[#A6A29A] opacity-60 mt-1 flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs">实时</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 