"use client";

import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { getWebSocketConfig } from '../utils/websocket-config';

interface WebSocketAlertProps {
  show: boolean;
  onDismiss: () => void;
}

export function WebSocketAlert({ show, onDismiss }: WebSocketAlertProps) {
  if (!show) return null;

  const wsConfig = getWebSocketConfig();
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

  // 如果 WebSocket 可以连接（包括 WSS），则不显示警告
  if (wsConfig.canConnect) return null;

  if (!isSecure) return null; // 只在HTTPS环境显示

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Card className="p-4 bg-yellow-50 border-yellow-200 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 text-yellow-600">⚠️</div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-yellow-800">
              WebSocket连接受限
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              由于浏览器安全策略，HTTPS页面无法连接到不安全的WebSocket服务器。
            </p>
            <div className="mt-3 flex flex-col space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const httpUrl = window.location.href.replace('https://', 'http://');
                  window.location.href = httpUrl;
                }}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
              >
                🔓 切换到HTTP版本 (推荐)
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="text-yellow-700 hover:bg-yellow-100"
              >
                知道了，稍后处理
              </Button>
            </div>
            <p className="mt-2 text-xs text-yellow-600">
              💡 或者联系管理员配置SSL证书以支持WSS
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}