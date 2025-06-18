/**
 * 热力图颜色图例组件
 * 红白配色，标注不同强度区间的含义，风格与主页面统一。
 */
export default function HeatmapLegend() {
  const legend = [
    { color: "#fff0f0", label: "极低" },
    { color: "#ffd6d6", label: "较低" },
    { color: "#ffb3b3", label: "中等" },
    { color: "#ff6666", label: "较高" },
    { color: "#d60000", label: "极高" },
  ];
  return (
    <div className="flex items-center gap-4 mt-4 justify-center">
      {legend.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-full border border-red-200" style={{ background: item.color }}></div>
          <span className="text-xs text-red-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
} 