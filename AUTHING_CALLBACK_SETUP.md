# 🔐 Authing 回调地址配置指南

## 当前Authing应用信息

- **App ID**: `68b7cbae2816014ddfcbba17`
- **App Domain**: `funsoccer.authing.cn` 
- **App Secret**: `67dcdcbf9afbb6b882093b9e3e215d55`
- **认证地址**: `https://funsoccer.authing.cn`

## 🔧 必须配置的回调地址

### 步骤1：访问Authing控制台
1. 登录 [Authing控制台](https://console.authing.cn/)
2. 选择你的 "FunSoccer" 应用
3. 进入 "应用配置" 页面

### 步骤2：配置登录回调URL
在 "登录回调URL" 部分，**替换**当前的回调地址：

**当前回调地址** (需要删除):
```
https://console.authing.cn/console/get-started/68b7cbae2816014ddfcbba17
```

**新的回调地址** (需要添加):
```
# 开发环境
http://localhost:3000

# 生产环境 (请替换为你的实际Vercel域名)
https://your-vercel-domain.vercel.app
```

### 步骤3：配置登出回调URL (可选)
同样添加：
```
http://localhost:3000
https://your-vercel-domain.vercel.app
```

### 步骤4：启用登录方式
在 "登录注册方式" 中确保启用：
- ✅ 邮箱密码登录
- ✅ 用户名密码登录  
- ✅ 手机号验证码登录
- ✅ 邮箱注册

## 📝 本地环境已配置完成

你的 `.env.local` 文件已经配置好了：

```bash
# Authing Authentication Configuration
NEXT_PUBLIC_AUTHING_DOMAIN=funsoccer.authing.cn
NEXT_PUBLIC_AUTHING_APP_ID=68b7cbae2816014ddfcbba17
AUTHING_APP_SECRET=67dcdcbf9afbb6b882093b9e3e215d55

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=funsoccer-nextauth-secret-2024-development-key-32chars
```

## 🚀 测试本地登录

1. **启动开发服务器**:
   ```bash
   cd funsoccer_coding/soccer-heatmap-next
   bun run dev
   ```

2. **访问页面**:
   ```
   http://localhost:3000
   ```

3. **测试登录功能**:
   - 点击右上角 "登录" 按钮
   - 测试邮箱密码登录
   - 测试手机号验证码登录
   - 测试用户注册功能

## 🌐 Vercel生产环境配置

### 获取你的Vercel域名
运行以下命令查看你的部署域名：
```bash
vercel domains ls
# 或者
vercel ls
```

### 配置Vercel环境变量
```bash
# 方式1：使用脚本（推荐）
./setup-vercel-env-with-auth.sh

# 方式2：手动在Vercel控制台设置
# 访问 https://vercel.com/dashboard
# 选择项目 → Settings → Environment Variables
```

### 必需的生产环境变量
```bash
NEXT_PUBLIC_AUTHING_DOMAIN=funsoccer.authing.cn
NEXT_PUBLIC_AUTHING_APP_ID=68b7cbae2816014ddfcbba17
AUTHING_APP_SECRET=67dcdcbf9afbb6b882093b9e3e215d55
NEXTAUTH_URL=https://your-actual-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret-32-chars-long
```

## 🔍 故障排除

### 常见错误1：CORS错误
**错误信息**: "Access has been blocked by CORS policy"
**解决方案**: 确保在Authing控制台正确配置了回调地址

### 常见错误2：回调地址不匹配
**错误信息**: "redirect_uri_mismatch"
**解决方案**: 
1. 检查Authing控制台的回调URL配置
2. 确保NEXTAUTH_URL环境变量正确
3. 确保协议匹配（http vs https）

### 常见错误3：应用配置错误
**错误信息**: "invalid_client"
**解决方案**: 
1. 检查App ID是否正确
2. 检查App Secret是否正确
3. 确认应用类型为"单页应用"

## ✅ 配置完成检查清单

- [ ] 🔑 已在Authing控制台配置正确的回调URL
- [ ] 📝 本地 `.env.local` 文件配置完成
- [ ] 🚀 本地开发服务器可正常启动
- [ ] 🔐 本地登录功能测试通过
- [ ] 🌐 Vercel环境变量配置完成
- [ ] 🎯 生产环境回调URL已添加到Authing
- [ ] ✨ 生产环境登录功能测试通过

---

**🎉 配置完成后，你就可以在本地和生产环境中使用完整的Authing登录功能了！**