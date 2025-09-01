# FunSoccer Frontend Deployment

## 项目概述
FunSoccer 前端应用，基于 Next.js 15.3.3 构建，集成了地理位置设备匹配功能。

## 主要功能
- 📍 **智能设备匹配**: 基于用户地理位置自动推荐最近的设备
- 🔥 **实时热力图**: WebGL 加速的球员活动热力图
- 📊 **数据分析**: 实时球员统计和排名
- 📱 **响应式设计**: 支持移动端和桌面端
- 🌐 **多语言支持**: 中文/英文切换

## 技术栈
- **框架**: Next.js 15.3.3 with React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Hooks
- **实时通信**: WebSocket
- **地图服务**: 浏览器地理位置 API
- **构建工具**: Turbopack

## 部署环境
- **后端API**: http://47.239.73.57:8000
- **WebSocket**: ws://47.239.73.57:8000/ws/data
- **设备管理**: ws://47.239.73.57:8000/ws/devices

## 核心组件
- `GeographicDeviceSelector`: 地理位置设备匹配
- `Heatmap`: 热力图可视化
- `PlayerStatsBars`: 球员数据统计
- `DeviceSelector`: 设备选择器

## 开发命令
```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## API端点
- `GET /api/v1/device-location/devices/nearby` - 查找附近设备
- `POST /api/v1/device-location/match` - 用户设备匹配
- `GET /api/v1/device-location/health` - 服务健康检查

## 环境变量
- `NEXT_PUBLIC_API_BASE`: 后端API基础URL
- `NEXT_PUBLIC_BACKEND_API_BASE`: 后端API基础URL（地理位置服务）
- `NEXT_PUBLIC_WS_URL`: WebSocket连接URL
- `NEXT_PUBLIC_ENABLE_GEOLOCATION`: 是否启用地理位置功能

## 部署历史
- 2025-09-01: 集成地理位置设备匹配功能
- 2024-XX-XX: 初始版本发布

## 许可证
MIT License
