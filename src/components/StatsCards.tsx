/**
 * 底部统计卡片组件（重构版）
 * 仅展示累计运动场次、累计跑动距离、排名三大卡片，底部横向排列，风格贴合设计图。
 */
export default function StatsCards({ distance }: { distance: string | undefined }) {
  const stats = [
    { label: "累计运动场次", value: "37" },
    { label: "累计跑动距离", value: distance ?? "--" },
    { label: "上海浦东前腰排名", value: "217" },
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