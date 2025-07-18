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
        setHeatmap(heatmapData);
      })
      .catch(() => {
      });
  }, [deviceId]);

  // 只渲染选中球员的热力图
  let grid: number[][] | null = null;
  if (trackId && heatmap[trackId]) {
    grid = heatmap[trackId].map(row => row.map(val => val === 0 ? 0 : val * 100));
  }

  // 计算最大值用于归一化
  let maxVal = 0;
  if (grid) {
    for (let i = 0; i < grid.length; i++)
      for (let j = 0; j < grid[i].length; j++)
        if (grid[i][j] > maxVal) maxVal = grid[i][j];
  }

  // 颜色映射：调试用，所有非零格子都渲染为红色，便于观察
  function getHeatColor(val: number) {
    if (val === 0) return "transparent";
    // 标题色 #E5DED2，半透明
    return "rgba(229, 222, 210, 0.5)";
  }

  // 自动适配网格大小
  const rows = grid ? grid.length : 10;
  const cols = grid && grid[0] ? grid[0].length : 15;

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
      </svg>
      {/* 热力图渲染 */}
      <div
        className="absolute z-20"
        style={{ width: svgWidth, height: svgHeight, top: 0, left: 0, pointerEvents: "none" }}
      >
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            width: '100%',
            height: '100%'
          }}
        >
          {grid && grid.map((row, i) =>
            row.map((val, j) => (
              <div
                key={`${i}-${j}`}
                className="rounded-full"
                style={{
                  background: getHeatColor(val),
                  width: val === 0 ? '100%' : '32px',
                  height: val === 0 ? '100%' : '32px',
                  opacity: val === 0 ? 0 : 1,
                  margin: val === 0 ? undefined : 'auto',
                  boxShadow: val !== 0 ? '0 0 8px 2px rgba(229,222,210,0.4)' : undefined,
                  border: val !== 0 ? '2px solid #E5DED2' : undefined,
                  transition: 'width 0.2s, height 0.2s, opacity 0.2s',
                  pointerEvents: 'none',
                  position: 'relative',
                  zIndex: 30
                }}
              />
            ))
          )}
        </div>
      </div>
      {/* 占位，保证布局高度 */}
      <div style={{ width: svgWidth, height: svgHeight, visibility: "hidden" }} />
    </div>
  );
} 