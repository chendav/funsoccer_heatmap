import React, { useEffect, useState } from "react";

/**
 * 热力图展示组件（布局优化版）
 * 支持外部传入trackId，渲染选中球员的热力图。
 */
export default function Heatmap({ deviceId, trackId }: { deviceId: string | undefined, trackId?: string | undefined }) {
  // 保存所有球员的热力图数据，key为track_id
  const [heatmap, setHeatmap] = useState<Record<string, number[][]>>({});

  // 设备切换时加载数据
  useEffect(() => {
    if (!deviceId) return;
    setHeatmap({});
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
    fetch(`${apiBase}/api/heatmap?device_id=${deviceId}`)
      .then(res => {
        if (!res.ok) throw new Error("网络错误");
        return res.json();
      })
      .then(data => {
        const heatmapData = data.heatmap || {};
        console.log('【调试】API返回的heatmap数据:', heatmapData);
        console.log('【调试】heatmap的所有keys:', Object.keys(heatmapData));
        setHeatmap(heatmapData);
      })
      .catch((error) => {
        console.error('【调试】API请求失败:', error);
      });
  }, [deviceId]);

  // 只渲染选中球员的点位（不做热力图累计）
  const pointList: { x: number; y: number }[] = [];
  let grid: number[][] | null = null;
  if (trackId && heatmap[trackId]) {
    grid = heatmap[trackId];
    // 遍历所有非零点，记录其归一化坐标
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] > 0) {
          // 归一化坐标（0~1）
          const x = (j + 0.5) / cols;
          const y = (i + 0.5) / rows;
          pointList.push({ x, y });
        }
      }
    }
    console.log('【调试】当前trackId:', trackId);
    console.log('【调试】非零点数量:', pointList.length);
    console.log('【调试】点坐标:', pointList);
    console.log('【调试】点坐标详情:', pointList.map(pt => ({x: pt.x, y: pt.y, cx: pt.x * 320, cy: pt.y * 480})));
  } else {
    console.log('【调试】trackId或heatmap[trackId]不存在:', { trackId, hasHeatmap: trackId ? !!heatmap[trackId] : false });
  }

  // 自动适配网格大小
  // const rows = grid ? grid.length : 10;
  // const cols = grid && grid[0] ? grid[0].length : 15;

  // 自适应宽高，移动端下用vw/vh
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
  const svgWidth = isMobile ? window.innerWidth * 0.95 : 320;
  const svgHeight = isMobile ? window.innerWidth * 1.4 : 480;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('屏幕宽度:', window.innerWidth);
    }
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full mt-4 mb-2 heatmap-container">
      {/* 球场SVG热力图 */}
      <svg
        className="absolute z-10"
        width={svgWidth} height={svgHeight} viewBox="0 0 320 480" fill="none"
        style={{ top: 0, left: 0 }}
      >
        {/* 外框（四角点旋转） */}
        <rect x={0} y={0} width={320} height={480} stroke="#F5EFE2" strokeWidth="8" fill="none" />
        {/* 中线（旋转） */}
        <line x1={0} y1={240} x2={320} y2={240} stroke="#F5EFE2" strokeWidth="6" />
        {/* 中心圆（旋转，半径用高度） */}
        <circle cx={160} cy={240} r={(0.587-0.413)*480/2} stroke="#F5EFE2" strokeWidth="6" fill="none" />
        {/* 上禁区（门型结构，旋转） */}
        {/* 竖线1 */}
        <line x1={0.204*320} y1={0} x2={0.204*320} y2={0.157*480} stroke="#F5EFE2" strokeWidth="6" />
        {/* 横线上 */}
        <line x1={0.204*320} y1={0.157*480} x2={0.796*320} y2={0.157*480} stroke="#F5EFE2" strokeWidth="6" />
        {/* 竖线2 */}
        <line x1={0.796*320} y1={0} x2={0.796*320} y2={0.157*480} stroke="#F5EFE2" strokeWidth="6" />
        {/* 下禁区（门型结构，旋转） */}
        {/* 竖线1 */}
        <line x1={0.204*320} y1={480} x2={0.204*320} y2={480-0.157*480} stroke="#F5EFE2" strokeWidth="6" />
        {/* 横线下 */}
        <line x1={0.204*320} y1={480-0.157*480} x2={0.796*320} y2={480-0.157*480} stroke="#F5EFE2" strokeWidth="6" />
        {/* 竖线2 */}
        <line x1={0.796*320} y1={480} x2={0.796*320} y2={480-0.157*480} stroke="#F5EFE2" strokeWidth="6" />
        {/* 轨迹点渲染 */}
        {pointList.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x * 320}
            cy={pt.y * 480}
            r={6}
            fill="#1f2937"
            opacity={0.6}
            stroke="#374151"
            strokeWidth="1"
          />
        ))}
      </svg>
      {/* 热力图渲染 */}
      {/* 这里不再渲染格子，仅保留SVG点位渲染 */}
      {/* 占位，保证布局高度 */}
      <div style={{ width: svgWidth, height: svgHeight, visibility: "hidden" }} />
    </div>
  );
} 