"use client";

import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

interface Photo {
  photo_id: string;
  session_id: string;
  camera_id: string;
  timestamp: string;
  filename: string;
  original_path: string;
  thumbnail_path: string;
  file_size_bytes: number;
  image_width: number;
  image_height: number;
  status: string;
}

interface PlayerBindingProps {
  language: 'zh' | 'en';
}

export default function PlayerBinding({ language }: PlayerBindingProps) {
  const [currentUserId, setCurrentUserId] = useState('');
  const [userIdInput, setUserIdInput] = useState('demo_user_001');
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [currentMatchId, setCurrentMatchId] = useState('');
  const [status, setStatus] = useState('请输入用户ID开始使用');
  const [isStartDisabled, setIsStartDisabled] = useState(true);
  const [isEndDisabled, setIsEndDisabled] = useState(true);
  const [showPhotos, setShowPhotos] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // API endpoints
  const API_BASE = 'http://47.239.73.57:8000';  // 后端服务器
  const EDGE_API_BASE = 'http://10.0.0.118:8000';  // 边缘设备

  const translations = {
    zh: {
      title: '🏟️ FunSoccer 球员绑定系统',
      enterUserId: '请输入您的用户ID',
      confirmId: '确认身份',
      startMatch: '🚀 开始比赛拍照',
      endMatch: '🛑 结束比赛',
      selectPhoto: '📸 选择您的照片进行认领',
      clickPhoto: '请点击照片中您所在的位置来完成球员绑定',
      success: '🎉 球员绑定成功！',
      successDesc: '您已成功绑定到系统，可以开始享受AI数据分析服务了！',
      camera: '摄像头',
      loading: '正在加载...',
      errorStart: '启动拍照失败',
      errorEnd: '获取照片失败',
      errorClaim: '认领失败',
      statusReady: '请输入用户ID开始使用',
      statusStarting: '正在创建比赛会话...',
      statusCapturing: '📸 拍照已开始！请进入场地，30秒内将拍摄6张照片',
      statusComplete: '拍照完成！您可以点击"结束比赛"查看照片',
      statusGettingPhotos: '正在获取照片...',
      statusSelectPhoto: '找到照片，请点击您所在的位置'
    },
    en: {
      title: '🏟️ FunSoccer Player Binding System',
      enterUserId: 'Please enter your user ID',
      confirmId: 'Confirm Identity',
      startMatch: '🚀 Start Match Photos',
      endMatch: '🛑 End Match',
      selectPhoto: '📸 Select Your Photo to Claim',
      clickPhoto: 'Please click on your position in the photo to complete player binding',
      success: '🎉 Player Binding Successful!',
      successDesc: 'You have successfully bound to the system and can start enjoying AI data analysis services!',
      camera: 'Camera',
      loading: 'Loading...',
      errorStart: 'Failed to start photo capture',
      errorEnd: 'Failed to get photos',
      errorClaim: 'Failed to claim',
      statusReady: 'Please enter user ID to start',
      statusStarting: 'Creating match session...',
      statusCapturing: '📸 Photo capture started! Please enter the field, 6 photos will be taken in 30 seconds',
      statusComplete: 'Photo capture complete! You can click "End Match" to view photos',
      statusGettingPhotos: 'Getting photos...',
      statusSelectPhoto: 'Found photos, please click on your position'
    }
  };

  const t = (key: keyof typeof translations.zh) => translations[language][key];

  const setUserId = useCallback(() => {
    const trimmedId = userIdInput.trim();
    if (!trimmedId) {
      alert(language === 'zh' ? '请输入有效的用户ID' : 'Please enter a valid user ID');
      return;
    }
    setCurrentUserId(trimmedId);
    setStatus(language === 'zh' ? `用户ID已设置: ${trimmedId}` : `User ID set: ${trimmedId}`);
    setIsStartDisabled(false);
  }, [userIdInput, language]);

  const startMatch = useCallback(async () => {
    if (!currentUserId) {
      alert(language === 'zh' ? '请先设置用户ID' : 'Please set user ID first');
      return;
    }

    try {
      setStatus(t('statusStarting'));
      setIsStartDisabled(true);
      setIsLoading(true);

      // 1. 调用后端API创建会话
      const response = await fetch(`${API_BASE}/match-session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId })
      });

      if (!response.ok) {
        throw new Error('创建会话失败');
      }

      const data = await response.json();
      setCurrentSessionId(data.data.session_id);
      setCurrentMatchId(data.data.match_id);

      // 2. 通知边缘设备开始拍照
      const edgeResponse = await fetch(`${EDGE_API_BASE}/photo/start-capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: `web_ui_${Date.now()}`,
          session_id: data.data.session_id,
          duration_seconds: 30,
          interval_seconds: 5,
          cameras: ['cam1', 'cam2']
        })
      });

      if (!edgeResponse.ok) {
        throw new Error('启动拍照失败');
      }

      setStatus(t('statusCapturing'));
      setIsEndDisabled(false);

      // 30秒后自动提示可以结束
      setTimeout(() => {
        if (currentSessionId) {
          setStatus(t('statusComplete'));
        }
      }, 32000);

    } catch (error) {
      console.error('Start match error:', error);
      setStatus(t('errorStart') + ': ' + (error as Error).message);
      setIsStartDisabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, t, currentSessionId]);

  const endMatch = useCallback(async () => {
    if (!currentSessionId) {
      alert(language === 'zh' ? '没有活动的比赛会话' : 'No active match session');
      return;
    }

    try {
      setStatus(t('statusGettingPhotos'));
      setIsEndDisabled(true);
      setIsLoading(true);

      // 获取照片列表
      const response = await fetch(`${EDGE_API_BASE}/photo/get-session-photos/${currentSessionId}`);

      if (!response.ok) {
        throw new Error('获取照片失败');
      }

      const data = await response.json();
      setPhotos(data.data.photos);
      
      setStatus(t('statusSelectPhoto') + ` ${data.data.photos_count} ${language === 'zh' ? '张照片' : 'photos'}`);
      setShowPhotos(true);

    } catch (error) {
      console.error('End match error:', error);
      setStatus(t('errorEnd') + ': ' + (error as Error).message);
      setIsEndDisabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, t, language]);

  const handlePhotoClick = useCallback(async (event: React.MouseEvent<HTMLImageElement>, photo: Photo) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 计算相对坐标 (0-1 范围)
    const relativeX = x / rect.width;
    const relativeY = y / rect.height;

    try {
      setIsLoading(true);
      
      // 调用球员认领API
      const response = await fetch(`${API_BASE}/match-session/claim-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: currentSessionId,
          user_id: currentUserId,
          photo_id: photo.photo_id,
          click_coordinates: {
            x: relativeX,
            y: relativeY,
            pixel_x: Math.round(x),
            pixel_y: Math.round(y)
          }
        })
      });

      if (!response.ok) {
        throw new Error('球员认领失败');
      }

      // 显示成功消息
      setShowSuccess(true);
      setShowPhotos(false);
      setStatus(t('success'));

      // 3秒后重置状态
      setTimeout(() => {
        resetUI();
      }, 3000);

    } catch (error) {
      console.error('Claim player error:', error);
      alert(t('errorClaim') + ': ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, currentUserId, t]);

  const resetUI = useCallback(() => {
    setCurrentSessionId('');
    setCurrentMatchId('');
    setIsStartDisabled(false);
    setIsEndDisabled(true);
    setShowPhotos(false);
    setShowSuccess(false);
    setPhotos([]);
    setStatus(t('statusReady'));
  }, [t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            {t('title')}
          </h1>

          {/* User Input Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Input
              type="text"
              placeholder={t('enterUserId')}
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={setUserId} variant="default">
              {t('confirmId')}
            </Button>
          </div>

          {/* Match Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              onClick={startMatch}
              disabled={isStartDisabled || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              {t('startMatch')}
            </Button>
            <Button 
              onClick={endMatch}
              disabled={isEndDisabled || isLoading}
              variant="destructive"
              className="px-8 py-3 text-lg"
            >
              {t('endMatch')}
            </Button>
          </div>

          {/* Status Display */}
          <div className="text-center mb-8">
            <p className={`text-lg ${status.includes('📸') || status.includes('🎉') ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
              {status}
            </p>
            {isLoading && (
              <div className="mt-2 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                {t('loading')}
              </div>
            )}
          </div>

          {/* Success Message */}
          {showSuccess && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  {t('success')}
                </h3>
                <p className="text-green-700">
                  {t('successDesc')}
                </p>
              </div>
            </Card>
          )}

          {/* Photos Section */}
          {showPhotos && (
            <div>
              <h2 className="text-xl font-semibold text-center text-gray-900 mb-4">
                {t('selectPhoto')}
              </h2>
              <p className="text-center text-gray-600 mb-6">
                {t('clickPhoto')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {photos.map((photo) => (
                  <Card key={photo.photo_id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="p-4">
                      <img
                        src={`${EDGE_API_BASE}/photo/thumbnail/${photo.filename}`}
                        alt={`${t('camera')} ${photo.camera_id.toUpperCase()}`}
                        className="w-full h-48 object-cover rounded-lg mb-3 hover:opacity-90 transition-opacity"
                        onClick={(e) => handlePhotoClick(e, photo)}
                        style={{ cursor: 'crosshair' }}
                      />
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-900">
                          {t('camera')} {photo.camera_id.toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(photo.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}