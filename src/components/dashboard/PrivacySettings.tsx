"use client";

import { useState } from "react";

interface UserPrivacy {
  isPrivate: boolean;
  allowLeaderboard: boolean;
  dataLevel: string;
}

interface PrivacySettingsProps {
  currentSettings: UserPrivacy;
  onUpdate: (settings: Partial<UserPrivacy>) => Promise<void>;
}

export default function PrivacySettings({ currentSettings, onUpdate }: PrivacySettingsProps) {
  const [settings, setSettings] = useState(currentSettings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggle = async (key: keyof UserPrivacy, value: boolean) => {
    setLoading(true);
    setMessage(null);

    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // 调用更新函数
      await onUpdate({ [key]: value });
      
      setMessage({ type: 'success', text: '设置更新成功' });
    } catch (error) {
      // 回滚设置
      setSettings(settings);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '更新失败' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDataLevelChange = async (dataLevel: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const newSettings = { 
        ...settings, 
        dataLevel,
        isPrivate: dataLevel === 'private',
        allowLeaderboard: dataLevel !== 'private'
      };
      setSettings(newSettings);

      await onUpdate({ 
        dataLevel,
        isPrivate: dataLevel === 'private',
        allowLeaderboard: dataLevel !== 'private'
      });
      
      setMessage({ type: 'success', text: '数据共享级别更新成功' });
    } catch (error) {
      setSettings(settings);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '更新失败' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* 消息提示 */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`text-sm font-medium ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* 数据隐私级别 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            数据隐私级别
          </h3>
          <p className="text-gray-600">
            选择您希望如何分享您的运动数据
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              id="private"
              type="radio"
              name="dataLevel"
              value="private"
              checked={settings.dataLevel === 'private'}
              onChange={(e) => handleDataLevelChange(e.target.value)}
              disabled={loading}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="flex-1">
              <label htmlFor="private" className="block text-sm font-medium text-gray-700">
                🔒 完全私有
              </label>
              <p className="text-sm text-gray-500 mt-1">
                您的数据完全保密，不会出现在任何排行榜或公共统计中
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              id="anonymous"
              type="radio"
              name="dataLevel"
              value="anonymous"
              checked={settings.dataLevel === 'anonymous'}
              onChange={(e) => handleDataLevelChange(e.target.value)}
              disabled={loading}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="flex-1">
              <label htmlFor="anonymous" className="block text-sm font-medium text-gray-700">
                👤 匿名参与
              </label>
              <p className="text-sm text-gray-500 mt-1">
                您的数据会匿名显示在排行榜中，只显示用户名，不泄露个人信息
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              id="public"
              type="radio"
              name="dataLevel"
              value="public"
              checked={settings.dataLevel === 'public'}
              onChange={(e) => handleDataLevelChange(e.target.value)}
              disabled={loading}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="flex-1">
              <label htmlFor="public" className="block text-sm font-medium text-gray-700">
                🌐 公开参与
              </label>
              <p className="text-sm text-gray-500 mt-1">
                您的数据和姓名会显示在公共排行榜和统计中（暂未启用）
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 详细隐私设置 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            详细隐私设置
          </h3>
          <p className="text-gray-600">
            精确控制您的数据使用方式
          </p>
        </div>

        <div className="space-y-6">
          {/* 排行榜参与 */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                参与城市排行榜
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                允许您的数据出现在本城市的匿名排行榜中
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('allowLeaderboard', !settings.allowLeaderboard)}
              disabled={loading || settings.dataLevel === 'private'}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.allowLeaderboard && settings.dataLevel !== 'private'
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              } ${loading || settings.dataLevel === 'private' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.allowLeaderboard && settings.dataLevel !== 'private' 
                    ? 'translate-x-5' 
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 数据保密 */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                个人数据保密
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                您的详细运动数据只有您自己能看到
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('isPrivate', !settings.isPrivate)}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.isPrivate ? 'bg-blue-600' : 'bg-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.isPrivate ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            数据管理
          </h3>
          <p className="text-gray-600">
            管理您的个人数据
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                导出个人数据
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                下载您的所有运动数据副本
              </p>
            </div>
            <button
              type="button"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              导出数据
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900">
                删除所有数据
              </h4>
              <p className="text-sm text-red-600 mt-1">
                永久删除您的所有数据，此操作不可撤销
              </p>
            </div>
            <button
              type="button"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              删除数据
            </button>
          </div>
        </div>
      </div>

      {/* 隐私说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-blue-600 text-xl">🛡️</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              隐私保护承诺
            </h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• 您的个人数据始终安全加密存储</p>
              <p>• 我们绝不会出售或分享您的个人信息</p>
              <p>• 排行榜数据经过匿名化处理，无法追踪到个人</p>
              <p>• 您可以随时修改隐私设置或删除所有数据</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}