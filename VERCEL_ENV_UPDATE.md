# Vercel 环境变量更新说明

## 需要在 Vercel Dashboard 更新的环境变量

请访问 [Vercel Dashboard](https://vercel.com/dashboard) → 选择 `soccer-heatmap-next` 项目 → Settings → Environment Variables

### 更新以下环境变量：

```bash
# Backend API - 使用香港服务器实际IP和端口
NEXT_PUBLIC_API_BASE=http://47.239.73.57:8000
NEXT_PUBLIC_BACKEND_API_BASE=http://47.239.73.57:8000
BACKEND_API_BASE=http://47.239.73.57:8000

# WebSocket - 使用香港服务器WebSocket端点
NEXT_PUBLIC_WS_URL=ws://47.239.73.57:8000/ws/detection
NEXT_PUBLIC_WS_BASE=ws://47.239.73.57:8000

# Authing 配置（如果还没有设置）
NEXT_PUBLIC_AUTHING_DOMAIN=funsoccer.authing.cn
NEXT_PUBLIC_AUTHING_APP_ID=68b7cbae2816014ddfcbba17
AUTHING_APP_SECRET=67dcdcbf9afbb6b882093b9e3e215d55

# NextAuth
NEXTAUTH_URL=https://funsoccer.app
NEXTAUTH_SECRET=funsoccer-nextauth-secret-2024-production-key-32chars

# App Configuration
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
NEXT_PUBLIC_APP_ENV=production
NODE_ENV=production
```

### 重要说明：

1. **删除所有 `api.funsoccer.app` 相关的环境变量** - 这个域名不存在
2. **确保端口号是 8000** - 后端服务运行在 8000 端口
3. **WebSocket 路径是 `/ws/detection`** - 这是正确的 WebSocket 端点
4. 更新后需要重新部署才能生效

### 验证步骤：

1. 更新环境变量后，触发重新部署
2. 部署完成后，访问 https://funsoccer.app
3. 打开浏览器开发者工具 (F12)
4. 检查 Network 标签，确认：
   - API 请求指向 `http://47.239.73.57:8000`
   - WebSocket 连接到 `ws://47.239.73.57:8000/ws/detection`

### 问题排查：

如果 WebSocket 仍然无法连接，可能需要：
1. 检查服务器防火墙是否开放 8000 端口
2. 确认后端 WebSocket 服务正在运行
3. 检查是否有 CORS 或其他安全策略阻止连接