import React, { useEffect, useState, useMemo } from "react";

interface HeatmapProps {
  deviceId: string | undefined;
  trackId?: string | undefined;
}

interface PositionPoint {
  x: number;
  y: number;
  timestamp: string;
}

/**
 * 球员位置图展示组件
 * 显示球员在场上的实际位置点，而非网格热力图
 */
export default function Heatmap({ deviceId, trackId }: HeatmapProps) {
  const [positionData, setPositionData] = useState<Record<string, PositionPoint[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 设备切换时加载数据
  useEffect(() => {
    if (!deviceId) return;
    
    setLoading(true);
    setError(null);
    setPositionData({});
    
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
    fetch(`${apiBase}/api/player-positions?device_id=${deviceId}&limit=200`)
      .then(res => {
        if (!res.ok) throw new Error("网络错误");
        return res.json();
      })
      .then(data => {
        const positions = data.position_data || {};
        console.log('[Heatmap] 加载位置数据:', positions);
        console.log('[Heatmap] 可用球员ID:', Object.keys(positions));
        setPositionData(positions);
        setLoading(false);
      })
      .catch((error) => {
        console.error('API请求失败:', error);
        setError('加载位置数据失败');
        setLoading(false);
      });
  }, [deviceId]);

  // 获取当前球员的位置点
  const playerPositions = useMemo((): PositionPoint[] => {
    console.log('[Heatmap] trackId:', trackId);
    console.log('[Heatmap] 位置数据keys:', Object.keys(positionData));
    
    if (!trackId || !positionData[trackId]) {
      console.log('[Heatmap] 返回空数据 - trackId:', trackId, 'positionData有该ID:', trackId ? !!positionData[trackId] : false);
      return [];
    }

    const positions = positionData[trackId];
    console.log('[Heatmap] 当前球员位置点数量:', positions.length);
    return positions;
  }, [trackId, positionData]);

  // 响应式尺寸计算
  const { svgWidth, svgHeight } = useMemo(() => {
    if (typeof window === 'undefined') return { svgWidth: 320, svgHeight: 480 };
    
    const isMobile = window.innerWidth <= 768;
    const width = isMobile ? Math.min(window.innerWidth * 0.9, 320) : 320;
    const height = isMobile ? width * 1.5 : 480;
    
    return { svgWidth: width, svgHeight: height };
  }, []);


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

        {/* 球员位置点层 - 在球场线条之前渲染 */}
        {playerPositions.map((position, idx) => {
          return (
            <circle
              key={`position-${idx}`}
              cx={position.x * 320}
              cy={position.y * 480}
              r={20}
              fill="#F5EFE2"
              opacity={0.5}
              stroke="#F5EFE2"
              strokeWidth="2"
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

      </svg>

      {/* 数据状态指示 */}
      {!loading && !error && (
        <div className="mt-2 text-xs text-white/60 text-center">
          {playerPositions.length > 0 
            ? `${playerPositions.length} 个位置点` 
            : trackId ? '暂无位置数据' : '请选择球员'
          }
        </div>
      )}
    </div>
  );
} 