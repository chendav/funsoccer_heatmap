'use client';

import React, { useState } from 'react';
import SessionManager from '@/components/SessionManager';
import HeatmapNew from '@/components/HeatmapNew';

/**
 * 演示页面 - 展示新的API集成
 * 访问 http://localhost:3000/demo 查看
 */
export default function DemoPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">FunSoccer 数据管理系统</h1>
          <p className="text-gray-600 mt-2">管理比赛、会话和查看数据分析</p>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：会话管理 */}
          <div>
            <SessionManager 
              onSessionSelect={(sessionId) => {
                console.log('Selected session:', sessionId);
                setSelectedSessionId(sessionId);
              }}
            />
          </div>

          {/* 右侧：数据展示 */}
          <div>
            {selectedSessionId ? (
              <HeatmapNew 
                sessionId={selectedSessionId}
                resolution="medium"
              />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow">
                <div className="text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">暂无数据</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    请先选择或创建一个比赛会话
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">使用说明</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>首先创建或选择一个比赛</li>
            <li>点击"开始新会话"创建一个数据采集会话</li>
            <li>会话状态为"preparing"时，点击"激活"开始采集</li>
            <li>采集完成后点击"停止"结束会话</li>
            <li>点击"处理数据"触发数据分析</li>
            <li>处理完成后，右侧将显示热力图和统计数据</li>
          </ol>
        </div>

        {/* API状态指示器 */}
        <div className="mt-8 flex items-center justify-center text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>API连接正常</span>
            <span className="mx-2">|</span>
            <span>后端地址: {process.env.NEXT_PUBLIC_API_BASE}</span>
          </div>
        </div>
      </div>
    </div>
  );
}