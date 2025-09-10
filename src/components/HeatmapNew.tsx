import React, { useEffect, useState, useMemo } from "react";
import api from "@/services/api";

interface HeatmapProps {
  sessionId?: string;
  matchId?: string;
  resolution?: 'low' | 'medium' | 'high';
}

/**
 * 热力图展示组件
 * 显示处理后的热力图数据
 */
export default function HeatmapNew({ sessionId, matchId, resolution = 'medium' }: HeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<number[][] | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  // 如果提供了matchId但没有sessionId，获取最新的session
  useEffect(() => {
    if (matchId && !sessionId) {
      setLoading(true);
      setError(null);
      
      // 这里应该调用获取match sessions的API
      // 暂时使用matchId作为示例
      api.match.get(matchId)
        .then(match => {
          // 假设我们有一个方法获取match的最新session
          // setCurrentSession(match.latest_session_id);
          console.log('Match loaded:', match);
        })
        .catch(err => {
          console.error('Failed to load match:', err);
          setError('加载比赛数据失败');
        })
        .finally(() => setLoading(false));
    } else if (sessionId) {
      setCurrentSession(sessionId);
    }
  }, [matchId, sessionId]);

  // 加载热力图数据
  useEffect(() => {
    if (!currentSession) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 并行加载热力图和统计数据
        const [heatmap, stats] = await Promise.all([
          api.display.getHeatmap(currentSession, resolution),
          api.display.getStatistics(currentSession)
        ]);

        setHeatmapData(heatmap.data);
        setStatistics(stats);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('加载数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentSession, resolution]);

  // 设置SSE实时更新
  useEffect(() => {
    if (!currentSession) return;

    const eventSource = api.display.streamUpdates(currentSession);

    eventSource.addEventListener('update', (event) => {
      const update = JSON.parse(event.data);
      console.log('Received update:', update);
      
      // 根据更新类型处理数据
      if (update.type === 'heatmap') {
        setHeatmapData(update.data);
      } else if (update.type === 'statistics') {
        setStatistics(update.data);
      }
    });

    eventSource.addEventListener('error', (event) => {
      console.error('SSE error:', event);
      setError('实时连接中断');
    });

    // 清理函数
    return () => {
      eventSource.close();
    };
  }, [currentSession]);

  // 计算热力图的颜色
  const getHeatmapColor = (value: number, max: number) => {
    if (max === 0) return 'rgba(0, 0, 255, 0.1)';
    const intensity = value / max;
    
    // 从蓝色到红色的渐变
    if (intensity < 0.25) {
      return `rgba(0, 0, 255, ${0.2 + intensity * 2})`;
    } else if (intensity < 0.5) {
      return `rgba(0, 255, 255, ${0.4 + (intensity - 0.25) * 2})`;
    } else if (intensity < 0.75) {
      return `rgba(255, 255, 0, ${0.6 + (intensity - 0.5) * 2})`;
    } else {
      return `rgba(255, 0, 0, ${0.8 + (intensity - 0.75) * 0.8})`;
    }
  };

  // 渲染热力图网格
  const renderHeatmap = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return null;

    const maxValue = Math.max(...heatmapData.flat());
    const gridHeight = heatmapData.length;
    const gridWidth = heatmapData[0].length;

    return (
      <div className="relative w-full h-full">
        {/* 足球场背景 */}
        <div className="absolute inset-0 bg-green-800 rounded-lg">
          {/* 中线 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white opacity-50"></div>
          {/* 中圈 */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          w-20 h-20 border-2 border-white opacity-50 rounded-full"></div>
          {/* 球门区域 */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 
                          w-8 h-24 border-2 border-white border-l-0 opacity-50"></div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 
                          w-8 h-24 border-2 border-white border-r-0 opacity-50"></div>
        </div>

        {/* 热力图层 */}
        <div className="absolute inset-0 grid" 
             style={{ 
               gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
               gridTemplateRows: `repeat(${gridHeight}, 1fr)`
             }}>
          {heatmapData.map((row, y) => 
            row.map((value, x) => (
              <div 
                key={`${x}-${y}`}
                className="border-0"
                style={{ 
                  backgroundColor: getHeatmapColor(value, maxValue),
                  opacity: 0.7
                }}
              />
            ))
          )}
        </div>
      </div>
    );
  }, [heatmapData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载热力图数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 统计信息卡片 */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">总距离</div>
            <div className="text-2xl font-bold">
              {(statistics.total_distance / 1000).toFixed(2)} km
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">平均速度</div>
            <div className="text-2xl font-bold">
              {statistics.average_speed.toFixed(1)} m/s
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">最高速度</div>
            <div className="text-2xl font-bold">
              {statistics.max_speed.toFixed(1)} m/s
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">场地覆盖率</div>
            <div className="text-2xl font-bold">
              {statistics.area_coverage.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* 热力图 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">球员活动热力图</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => {/* 切换分辨率 */}}
              className={`px-3 py-1 rounded ${resolution === 'low' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              低
            </button>
            <button 
              onClick={() => {/* 切换分辨率 */}}
              className={`px-3 py-1 rounded ${resolution === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              中
            </button>
            <button 
              onClick={() => {/* 切换分辨率 */}}
              className={`px-3 py-1 rounded ${resolution === 'high' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              高
            </button>
          </div>
        </div>
        
        <div className="aspect-[105/68] bg-green-900 rounded-lg overflow-hidden">
          {renderHeatmap}
        </div>

        {/* 图例 */}
        <div className="mt-4 flex items-center justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 opacity-30"></div>
            <span className="text-sm text-gray-600">低活动</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 opacity-60"></div>
            <span className="text-sm text-gray-600">中等活动</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 opacity-80"></div>
            <span className="text-sm text-gray-600">高活动</span>
          </div>
        </div>
      </div>
    </div>
  );
}