/**
 * 球员绑定组件 - 使用轮询替代 WebSocket
 * 实现文档中描述的照片点击绑定功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { usePolling } from '@/hooks/usePolling';
import { pollingService } from '@/services/polling-service';

interface PlayerBindingProps {
  matchId?: string;
  onBindingComplete?: (globalId: number) => void;
}

interface PhotoData {
  id: string;
  url: string;
  timestamp: string;
  device_id: string;
  detections: {
    players: Array<{
      bbox: number[];
      confidence: number;
      global_id?: number;
    }>;
  };
}

interface MatchSession {
  match_id: string;
  status: 'PREPARING' | 'ACTIVE' | 'ENDED' | 'PROCESSING' | 'COMPLETED';
  participating_devices: string[];
  capture_progress: {
    total_frames: number;
    captured_frames: number;
    processed_frames: number;
  };
}

export const PlayerBindingWithPolling: React.FC<PlayerBindingProps> = ({
  matchId,
  onBindingComplete
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [bindingResult, setBindingResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 轮询比赛会话状态
  const { data: sessionData } = usePolling({
    url: `/api/v1/matches/${matchId}/session`,
    interval: 2000,
    enabled: !!matchId,
    onData: (data: MatchSession) => {
      if (data.status === 'ENDED' && !sessionId) {
        // 比赛结束，开始获取照片
        setSessionId(data.match_id);
        loadPhotos(data.match_id);
      }
    }
  });

  // 加载照片列表
  const loadPhotos = useCallback(async (sessionId: string) => {
    try {
      const response = await pollingService.fetchOnce(
        `/api/v1/sessions/${sessionId}/photos`
      );
      setPhotos(response.photos || []);
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  }, []);

  // 开始比赛
  const startMatch = useCallback(async () => {
    if (!matchId) return;

    try {
      const response = await pollingService.fetchOnce(
        `/api/v1/matches/${matchId}/start`,
        { method: 'POST' }
      );
      
      console.log('Match started:', response);
      // 开始轮询进度
    } catch (error) {
      console.error('Failed to start match:', error);
    }
  }, [matchId]);

  // 结束比赛
  const endMatch = useCallback(async () => {
    if (!matchId) return;

    try {
      const response = await pollingService.fetchOnce(
        `/api/v1/matches/${matchId}/end`,
        { method: 'POST' }
      );
      
      console.log('Match ended:', response);
      setSessionId(response.session_id);
      // 加载照片
      await loadPhotos(response.session_id);
    } catch (error) {
      console.error('Failed to end match:', error);
    }
  }, [matchId, loadPhotos]);

  // 处理照片点击
  const handlePhotoClick = useCallback((event: React.MouseEvent<HTMLImageElement>, photo: PhotoData) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 转换为相对坐标
    const relativeX = x / rect.width;
    const relativeY = y / rect.height;
    
    setSelectedPhoto(photo);
    setClickPosition({ x: relativeX, y: relativeY });
    
    // 发送点击数据到后端进行匹配
    processBinding(photo.id, relativeX, relativeY);
  }, []);

  // 处理球员绑定
  const processBinding = useCallback(async (photoId: string, x: number, y: number) => {
    setIsProcessing(true);
    
    try {
      const response = await pollingService.fetchOnce(
        '/api/v1/player-binding/match',
        {
          method: 'POST',
          body: JSON.stringify({
            photo_id: photoId,
            click_x: x,
            click_y: y,
            match_id: matchId,
            user_id: 'current_user' // 实际应从认证上下文获取
          })
        }
      );
      
      setBindingResult(response);
      
      if (response.success && response.global_id) {
        onBindingComplete?.(response.global_id);
      }
    } catch (error) {
      console.error('Binding failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [matchId, onBindingComplete]);

  // 轮询处理进度
  const { data: processingProgress } = usePolling({
    url: `/api/v1/matches/${matchId}/processing-progress`,
    interval: 1000,
    enabled: !!matchId && sessionData?.status === 'PROCESSING'
  });

  return (
    <div className="player-binding-container p-6 bg-white rounded-lg shadow-lg">
      {/* 比赛控制面板 */}
      <div className="match-controls mb-6">
        <h2 className="text-2xl font-bold mb-4">比赛控制</h2>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={startMatch}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={sessionData?.status === 'ACTIVE'}
          >
            开始比赛
          </button>
          
          <button
            onClick={endMatch}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={sessionData?.status !== 'ACTIVE'}
          >
            结束比赛
          </button>
        </div>

        {/* 进度显示 */}
        {sessionData?.capture_progress && (
          <div className="progress-info bg-gray-100 p-4 rounded">
            <p>拍摄进度: {sessionData.capture_progress.captured_frames} / {sessionData.capture_progress.total_frames}</p>
            <p>处理进度: {sessionData.capture_progress.processed_frames} / {sessionData.capture_progress.captured_frames}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ 
                  width: `${(sessionData.capture_progress.captured_frames / sessionData.capture_progress.total_frames) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 照片选择区域 */}
      {photos.length > 0 && (
        <div className="photo-selection">
          <h3 className="text-xl font-semibold mb-4">选择照片进行球员绑定</h3>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative cursor-pointer hover:opacity-80">
                <Image
                  src={photo.url}
                  alt={`Photo ${photo.id}`}
                  width={150}
                  height={150}
                  className="rounded object-cover"
                  onClick={(e) => handlePhotoClick(e, photo)}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  {new Date(photo.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 选中照片详情 */}
      {selectedPhoto && (
        <div className="selected-photo-detail mt-6 p-4 border rounded">
          <h4 className="font-semibold mb-2">选中的照片</h4>
          <div className="relative inline-block">
            <Image
              src={selectedPhoto.url}
              alt="Selected"
              width={400}
              height={300}
              className="rounded"
            />
            {/* 显示点击位置 */}
            {clickPosition && (
              <div 
                className="absolute w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${clickPosition.x * 100}%`,
                  top: `${clickPosition.y * 100}%`
                }}
              />
            )}
          </div>
          
          {/* 绑定结果 */}
          {bindingResult && (
            <div className={`mt-4 p-3 rounded ${bindingResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
              {bindingResult.success ? (
                <p className="text-green-800">
                  ✅ 成功绑定到球员 ID: {bindingResult.global_id}
                  <br />
                  置信度: {(bindingResult.confidence * 100).toFixed(1)}%
                </p>
              ) : (
                <p className="text-red-800">
                  ❌ 绑定失败: {bindingResult.message || '未找到匹配的球员'}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 处理中状态 */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-center">正在处理绑定...</p>
          </div>
        </div>
      )}

      {/* 后台处理进度 */}
      {processingProgress && (
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h4 className="font-semibold mb-2">后台处理进度</h4>
          <p>状态: {processingProgress.status}</p>
          <p>已处理: {processingProgress.processed_count} / {processingProgress.total_count}</p>
          {processingProgress.message && (
            <p className="text-sm text-gray-600 mt-2">{processingProgress.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerBindingWithPolling;