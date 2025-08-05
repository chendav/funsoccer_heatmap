import { translations, type Language } from "@/lib/translations";
import { useSinglePlayerStats, useMatchStatsSummary } from "@/hooks/usePlayerStats";
import { formatDistance } from "@/lib/playerStatsApi";
// import { formatActiveTime } from "@/lib/playerStatsApi"; // TODO: 使用活跃时间格式化时导入

interface StatsCardsProps {
  matchId?: string;
  globalId?: number;
  language: Language;
  fallbackDistance?: string; // 兼容旧的distance prop
}

/**
 * 底部统计卡片组件（动态数据版）
 * 展示累计运动场次、累计跑动距离、排名三大卡片，支持实时数据更新
 */
export default function StatsCards({ 
  matchId, 
  globalId, 
  language, 
  fallbackDistance 
}: StatsCardsProps) {
  const t = translations[language];
  
  // 获取单个球员统计数据
  const { stats: playerStats, loading: playerLoading } = useSinglePlayerStats(
    matchId, 
    globalId,
    { enabled: !!matchId && globalId !== undefined }
  );
  
  // 获取比赛摘要数据（用于排名计算）
  const { summary: matchSummary, loading: summaryLoading } = useMatchStatsSummary(
    matchId,
    { enabled: !!matchId }
  );

  // 加载状态指示器
  const LoadingDot = () => (
    <div className="flex space-x-1">
      <div className="w-1 h-1 bg-[#A6A29A] rounded-full animate-pulse"></div>
      <div className="w-1 h-1 bg-[#A6A29A] rounded-full animate-pulse delay-100"></div>
      <div className="w-1 h-1 bg-[#A6A29A] rounded-full animate-pulse delay-200"></div>
    </div>
  );

  // 移除调试信息 - 生产环境

  // 计算数据值
  const getStatsValues = () => {
    // 如果有球员统计数据，使用动态数据
    if (playerStats && matchSummary) {
      // 计算排名（根据跑动距离排序）
      const ranking = matchSummary.total_players > 0 
        ? Math.ceil((playerStats.total_distance / matchSummary.max_distance) * matchSummary.total_players)
        : "--";

      return [
        { 
          label: t.totalMatches, 
          value: "1", // 当前只显示当前比赛
          loading: false 
        },
        { 
          label: t.totalDistance, 
          value: formatDistance(playerStats.total_distance),
          loading: playerLoading 
        },
        { 
          label: t.ranking, 
          value: ranking === "--" ? "--" : `#${ranking}`,
          loading: summaryLoading 
        },
      ];
    }

    // 回退到静态数据或加载状态
    return [
      { label: t.totalMatches, value: "37", loading: false },
      { 
        label: t.totalDistance, 
        value: fallbackDistance ?? "--", 
        loading: playerLoading && !!matchId 
      },
      { label: t.ranking, value: "217", loading: summaryLoading && !!matchId },
    ];
  };

  const stats = getStatsValues();

  return (
    <div className="w-full flex justify-center gap-3 sm:gap-6 mt-12 mb-4 px-2">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-[#F5EFE2] rounded-b-2xl rounded-t-md px-4 sm:px-8 py-4 sm:py-6 flex flex-col items-center shadow-lg min-w-[100px] sm:min-w-[120px] flex-1 max-w-[140px]"
        >
          <div className="text-2xl sm:text-3xl font-bold tracking-widest text-[#A6A29A] mb-2 min-h-[2rem] flex items-center justify-center">
            {stat.loading ? <LoadingDot /> : stat.value}
          </div>
          <div className="text-sm sm:text-base tracking-widest text-[#A6A29A] mb-1 text-center leading-tight">
            {stat.label}
          </div>
          {/* 实时数据指示器 */}
          {playerStats && idx === 1 && (
            <div className="text-xs text-[#A6A29A] opacity-60 mt-1 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              实时
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 