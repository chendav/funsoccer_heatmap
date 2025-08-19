import React, { useEffect, useState, useMemo } from "react";

interface HeatmapProps {
  deviceId: string | undefined;
  trackId?: string | undefined;
}

interface HeatPoint {
  x: number;
  y: number;
  intensity: number;
}

/**
 * 热力图展示组件（增强可视化版）
 * 支持外部传入trackId，渲染选中球员的真正热力图效果
 */
export default function Heatmap({ deviceId, trackId }: HeatmapProps) {
  const [heatmap, setHeatmap] = useState<Record<string, number[][]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 设备切换时加载数据
  useEffect(() => {
    if (!deviceId) return;
    
    setLoading(true);
    setError(null);
    setHeatmap({});
    
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
    fetch(`${apiBase}/api/heatmap/optimized?device_id=${deviceId}`)
      .then(res => {
        if (!res.ok) throw new Error("网络错误");
        return res.json();
      })
      .then(data => {
        const heatmapData = data.heatmap_data || {};
        setHeatmap(heatmapData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('API请求失败:', error);
        setError('加载热力图数据失败');
        setLoading(false);
      });
  }, [deviceId]);

  // 计算热力图点位数据
  const heatPoints = useMemo((): HeatPoint[] => {
    if (!trackId || !heatmap[trackId]) return [];

    const grid = heatmap[trackId];
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const points: HeatPoint[] = [];
    
    // 找到最大值用于归一化强度
    let maxIntensity = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] > maxIntensity) {
          maxIntensity = grid[i][j];
        }
      }
    }

    // 生成热力图点位
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] > 0) {
          const x = (j + 0.5) / cols;
          const y = (i + 0.5) / rows;
          const intensity = grid[i][j] / maxIntensity;
          points.push({ x, y, intensity });
        }
      }
    }
    
    return points;
  }, [trackId, heatmap]);

  // 响应式尺寸计算
  const { svgWidth, svgHeight } = useMemo(() => {
    if (typeof window === 'undefined') return { svgWidth: 320, svgHeight: 480 };
    
    const isMobile = window.innerWidth <= 768;
    const width = isMobile ? Math.min(window.innerWidth * 0.9, 320) : 320;
    const height = isMobile ? width * 1.5 : 480;
    
    return { svgWidth: width, svgHeight: height };
  }, []);

  // 获取热力图颜色
  const getHeatColor = (intensity: number): string => {
    // 使用更丰富的颜色渐变：蓝色 -> 青色 -> 绿色 -> 黄色 -> 红色
    const colors = [
      { r: 59, g: 130, b: 246 },   // blue-500
      { r: 6, g: 182, b: 212 },    // cyan-500  
      { r: 34, g: 197, b: 94 },    // green-500
      { r: 234, g: 179, b: 8 },    // yellow-500
      { r: 239, g: 68, b: 68 },    // red-500
    ];

    const scaledIntensity = Math.pow(intensity, 0.6); // 使用幂函数增强对比度
    const colorIndex = scaledIntensity * (colors.length - 1);
    const lowerIndex = Math.floor(colorIndex);
    const upperIndex = Math.min(lowerIndex + 1, colors.length - 1);
    const ratio = colorIndex - lowerIndex;

    const lower = colors[lowerIndex];
    const upper = colors[upperIndex];

    const r = Math.round(lower.r + (upper.r - lower.r) * ratio);
    const g = Math.round(lower.g + (upper.g - lower.g) * ratio);
    const b = Math.round(lower.b + (upper.b - lower.b) * ratio);

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full mt-4 mb-2">
      {/* 加载状态 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg z-20">
          <div className="text-white/80 text-sm flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            加载中...
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg z-20">
          <div className="text-red-200 text-sm text-center px-4">
            {error}
          </div>
        </div>
      )}

      {/* 球场SVG热力图 */}
      <svg
        className="relative z-10"
        width={svgWidth} 
        height={svgHeight} 
        viewBox="0 0 320 480" 
        fill="none"
      >
        {/* 渐变定义 */}
        <defs>
          {/* 径向渐变用于热力图点 */}
          <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopOpacity="1" />
            <stop offset="70%" stopOpacity="0.6" />
            <stop offset="100%" stopOpacity="0" />
          </radialGradient>
          
          {/* 球场草地纹理 */}
          <pattern id="grassPattern" patternUnits="userSpaceOnUse" width="4" height="4">
            <rect width="4" height="4" fill="#2d5016" opacity="0.1"/>
            <rect width="2" height="2" fill="#365c1a" opacity="0.1"/>
          </pattern>
        </defs>

        {/* 球场背景 */}
        <rect x={0} y={0} width={320} height={480} fill="url(#grassPattern)" opacity="0.3" />

        {/* 热力图层 - 在球场线条之前渲染 */}
        {heatPoints.map((point, idx) => {
          const radius = 25 + point.intensity * 20; // 根据强度调整半径
          const opacity = 0.3 + point.intensity * 0.4; // 根据强度调整透明度
          
          return (
            <circle
              key={`heat-${idx}`}
              cx={point.x * 320}
              cy={point.y * 480}
              r={radius}
              fill={getHeatColor(point.intensity)}
              opacity={opacity}
              style={{
                mixBlendMode: 'multiply', // 混合模式增强效果
                filter: `blur(${3 + point.intensity * 2}px)` // 模糊效果
              }}
            />
          );
        })}

        {/* 球场线条 - 在热力图之上 */}
        <g stroke="#F5EFE2" strokeWidth="3" fill="none" opacity="0.9">
          {/* 外框 */}
          <rect x={0} y={0} width={320} height={480} strokeWidth="4" />
          
          {/* 中线 */}
          <line x1={0} y1={240} x2={320} y2={240} strokeWidth="3" />
          
          {/* 中心圆 */}
          <circle cx={160} cy={240} r={(0.587-0.413)*480/2} strokeWidth="3" />
          <circle cx={160} cy={240} r={2} fill="#F5EFE2" />
          
          {/* 上禁区 */}
          <rect x={0.204*320} y={0} width={(0.796-0.204)*320} height={0.157*480} strokeWidth="3" />
          
          {/* 下禁区 */}
          <rect x={0.204*320} y={(1-0.157)*480} width={(0.796-0.204)*320} height={0.157*480} strokeWidth="3" />
          
          {/* 小禁区 */}
          <rect x={0.375*320} y={0} width={0.25*320} height={0.063*480} strokeWidth="2" />
          <rect x={0.375*320} y={(1-0.063)*480} width={0.25*320} height={0.063*480} strokeWidth="2" />
          
          {/* 球门 */}
          <rect x={0.44*320} y={-8} width={0.12*320} height={8} strokeWidth="3" />
          <rect x={0.44*320} y={480} width={0.12*320} height={8} strokeWidth="3" />
        </g>

        {/* 轨迹点位标记 - 在最顶层 */}
        {heatPoints.map((point, idx) => (
          <circle
            key={`marker-${idx}`}
            cx={point.x * 320}
            cy={point.y * 480}
            r={3 + point.intensity * 2}
            fill="white"
            opacity={0.8}
            stroke={getHeatColor(point.intensity)}
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* 数据状态指示 */}
      {!loading && !error && (
        <div className="mt-2 text-xs text-white/60 text-center">
          {heatPoints.length > 0 
            ? `${heatPoints.length} 个活动区域` 
            : trackId ? '暂无轨迹数据' : '请选择球员'
          }
        </div>
      )}
    </div>
  );
} 