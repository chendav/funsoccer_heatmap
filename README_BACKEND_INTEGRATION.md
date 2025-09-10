# FunSoccer Frontend - Backend Integration Guide

## 概述

本文档说明如何将 FunSoccer 前端与新开发的后端 API 集成。

## 新增功能

### 1. 统一的 API 服务层
- 文件位置: `src/services/api.ts`
- 提供完整的 API 客户端，包括：
  - 认证管理 (auth)
  - 比赛管理 (match)
  - 会话管理 (session)
  - 数据处理 (processing)
  - 数据显示 (display)
  - 设备管理 (device)

### 2. 新组件

#### SessionManager 组件
- 文件: `src/components/SessionManager.tsx`
- 功能:
  - 创建和管理比赛
  - 开始/停止/激活会话
  - 触发数据处理
  - 监控处理进度

#### HeatmapNew 组件
- 文件: `src/components/HeatmapNew.tsx`
- 功能:
  - 显示处理后的热力图数据
  - 支持多种分辨率 (低/中/高)
  - 实时统计数据显示
  - SSE 实时更新支持

### 3. 演示页面
- 路径: `/demo`
- 文件: `src/app/demo/page.tsx`
- 集成展示所有功能

## 配置步骤

### 1. 环境变量配置

编辑 `.env.local` 文件：

```env
# 开发环境
NEXT_PUBLIC_API_BASE=http://localhost:8000

# 生产环境（部署到 Vercel 时）
# NEXT_PUBLIC_API_BASE=https://your-backend-api.com
```

### 2. 启动后端服务

```bash
# 在 backend 目录下
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 启动前端开发服务器

```bash
# 在 soccer-heatmap-next 目录下
npm install
npm run dev
```

访问 http://localhost:3000/demo 查看演示页面。

## API 使用示例

### 认证流程

```typescript
import api from '@/services/api';

// Authing 回调处理
const handleAuthCallback = async (code: string) => {
  const response = await api.auth.callback(code);
  // 保存 token
  api.setAuthToken(response.access_token);
  // 保存用户信息
  localStorage.setItem('user', JSON.stringify(response.user));
};
```

### 比赛管理

```typescript
// 创建比赛
const match = await api.match.create({
  field_name: '主球场',
  match_type: 'training',
  team_a_name: 'A队',
  team_b_name: 'B队'
});

// 获取比赛列表
const matches = await api.match.list({ page: 1, page_size: 10 });
```

### 会话管理

```typescript
// 开始会话
const session = await api.session.start({
  match_id: match.id,
  player_count: 22
});

// 停止会话
await api.session.stop(session.id);

// 激活会话
await api.session.activate(session.id);
```

### 数据处理

```typescript
// 触发处理
const task = await api.processing.trigger(session.id);

// 检查状态
const status = await api.processing.getStatus(task.id);

// 获取结果
const results = await api.processing.getResults(session.id);
```

### 数据显示

```typescript
// 获取热力图
const heatmap = await api.display.getHeatmap(session.id, 'medium');

// 获取统计数据
const stats = await api.display.getStatistics(session.id);

// SSE 实时更新
const eventSource = api.display.streamUpdates(session.id);
eventSource.addEventListener('update', (event) => {
  const data = JSON.parse(event.data);
  console.log('实时更新:', data);
});
```

## 部署到 Vercel

### 1. 更新环境变量

在 Vercel 项目设置中添加：
- `NEXT_PUBLIC_API_BASE`: 你的后端 API 地址
- `NEXT_PUBLIC_AUTHING_DOMAIN`: Authing 域名
- `NEXT_PUBLIC_AUTHING_APP_ID`: Authing 应用 ID
- 其他必要的环境变量

### 2. 配置 CORS

确保后端 API 允许来自 Vercel 域名的请求：

```python
# backend/app/core/config.py
CORS_ORIGINS = [
    "http://localhost:3000",
    "https://your-app.vercel.app"
]
```

### 3. 部署

```bash
# 推送到 GitHub
git add .
git commit -m "Update frontend with backend integration"
git push

# Vercel 会自动部署
```

## 注意事项

1. **认证集成**: 前端仍使用 Authing 进行用户认证，后端通过 JWT token 验证用户身份。

2. **实时数据**: SSE (Server-Sent Events) 用于实时数据推送，兼容 Vercel 部署。

3. **文件上传**: 身份照片上传使用 multipart/form-data，确保后端正确处理。

4. **错误处理**: API 服务层包含统一的错误处理，组件中应妥善处理错误状态。

5. **性能优化**: 
   - 使用 Redis 缓存热力图和统计数据
   - 支持多种分辨率以优化传输
   - SSE 连接包含心跳机制防止超时

## 测试流程

1. 创建新比赛
2. 开始会话
3. 激活会话（模拟数据采集）
4. 停止会话
5. 触发数据处理
6. 查看热力图和统计结果

## 故障排除

### API 连接失败
- 检查后端服务是否运行
- 确认 `.env.local` 中的 API 地址正确
- 检查 CORS 配置

### 认证问题
- 确认 Authing 配置正确
- 检查 JWT token 是否过期
- 验证后端认证中间件配置

### 数据不显示
- 检查会话是否已停止
- 确认数据处理任务已完成
- 查看浏览器控制台错误信息

## 联系支持

如有问题，请查看：
- 后端文档: `/docs/stories/`
- API 文档: 访问 `http://localhost:8000/docs`
- GitHub Issues: 提交问题报告