# 前端环境配置部署说明

## 修复内容
修复了WebSocket连接和API端点配置错误，解决前端连接问题。

## 需要更新的环境变量文件

### .env.local (开发环境)
```bash
# FunSoccer Development Environment Configuration
# Backend API Base URL - Direct server connection
NEXT_PUBLIC_API_BASE=http://47.239.73.57
NEXT_PUBLIC_BACKEND_API_BASE=http://47.239.73.57

# Backend API Base for server-side calls
BACKEND_API_BASE=http://47.239.73.57

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://47.239.73.57:8000/ws/detection
NEXT_PUBLIC_WS_BASE=ws://47.239.73.57:8000

# App Configuration
NEXT_PUBLIC_APP_ENV=development
NODE_ENV=development
```

### .env.production (生产环境)
```bash
# FunSoccer生产环境配置
# 使用香港服务器直连IP
NEXT_PUBLIC_API_BASE=http://47.239.73.57
NEXT_PUBLIC_BACKEND_API_BASE=http://47.239.73.57

# Backend API Base for server-side calls
BACKEND_API_BASE=http://47.239.73.57

# WebSocket Configuration - 使用正确的detection端点
NEXT_PUBLIC_WS_URL=ws://47.239.73.57:8000/ws/detection
NEXT_PUBLIC_WS_BASE=ws://47.239.73.57:8000

# App Configuration
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
NEXT_PUBLIC_APP_ENV=production
NODE_ENV=production
```

## 主要修复点

1. **WebSocket端点修复**:
   - 原错误: `wss://api.funsoccer.app/ws/data`
   - 修复后: `ws://47.239.73.57:8000/ws/detection`

2. **API基础URL统一**:
   - 原错误: `http://localhost:8000`
   - 修复后: `http://47.239.73.57`

3. **环境变量优先级**:
   - PlayerBinding.tsx: 使用NEXT_PUBLIC_WS_URL环境变量
   - GeographicDeviceSelector.tsx: 使用NEXT_PUBLIC_BACKEND_API_BASE

## 部署后验证

测试以下功能确保修复生效:
- ✅ WebSocket连接不再报错
- ✅ 设备位置API正常调用
- ✅ 前端不再尝试连接localhost:8000

## 测试结果

所有前端连接测试已通过:
- API健康检查: ✅
- WebSocket连接: ✅
- 设备位置API: ✅