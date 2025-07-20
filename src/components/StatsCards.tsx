import { translations, type Language } from "@/lib/translations";

interface StatsCardsProps {
  distance: string | undefined;
  language: Language;
}

/**
 * 底部统计卡片组件（重构版）
 * 仅展示累计运动场次、累计跑动距离、排名三大卡片，底部横向排列，风格贴合设计图。
 */
export default function StatsCards({ distance, language }: StatsCardsProps) {
  const t = translations[language];
  
  const stats = [
    { label: t.totalMatches, value: "37" },
    { label: t.totalDistance, value: distance ?? "--" },
    { label: t.ranking, value: "217" },
  ];
  return (
    <div className="w-full flex justify-center gap-6 mt-12 mb-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-[#F5EFE2] rounded-b-2xl rounded-t-md px-8 py-6 flex flex-col items-center shadow-lg min-w-[120px]"
        >
          <div className="text-3xl font-bold tracking-widest text-[#A6A29A] mb-2">{stat.value}</div>
          <div className="text-base tracking-widest text-[#A6A29A] mb-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
} 