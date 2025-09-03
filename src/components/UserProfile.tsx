"use client";

import { useAuth } from '@/contexts/AuthContext';
import { getUserId, getUserDisplayName, getUserAvatar, debugUserInfo } from '@/utils/userUtils';
import { useEffect } from 'react';

export default function UserProfile() {
  const { isAuthenticated, user } = useAuth();
  
  // 调试：在控制台显示用户信息
  useEffect(() => {
    if (isAuthenticated) {
      debugUserInfo(user);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <p className="text-gray-500">请先登录查看用户信息</p>
      </div>
    );
  }

  const userId = getUserId(user);
  const displayName = getUserDisplayName(user);
  const avatarUrl = getUserAvatar(user);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">用户信息</h3>
      
      <div className="flex items-start space-x-4">
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-avatar.png';
          }}
        />
        
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900 mb-2">{displayName}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">用户ID:</span>
              <p className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded mt-1">
                {userId}
              </p>
            </div>
            
            {user.email && (
              <div>
                <span className="text-gray-500">邮箱:</span>
                <p className="text-gray-900 mt-1">{user.email}</p>
              </div>
            )}
            
            {user.username && (
              <div>
                <span className="text-gray-500">用户名:</span>
                <p className="text-gray-900 mt-1">{user.username}</p>
              </div>
            )}
            
            {user.phone && (
              <div>
                <span className="text-gray-500">手机号:</span>
                <p className="text-gray-900 mt-1">{user.phone}</p>
              </div>
            )}
          </div>
          
          {user.createdAt && (
            <div className="mt-3 text-xs text-gray-500">
              注册时间: {new Date(user.createdAt).toLocaleString('zh-CN')}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>开发者提示:</strong> 用户ID `{userId}` 可用于关联用户的足球数据、统计信息等。
        </p>
      </div>
    </div>
  );
}