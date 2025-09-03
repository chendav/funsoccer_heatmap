# Authing 生产环境配置指南

本指南将帮你在Vercel生产环境中配置Authing登录功能。

## 第一步：创建Authing应用

### 1. 注册Authing账号
访问 [Authing控制台](https://console.authing.cn/) 并注册账号

### 2. 创建应用
1. 登录后点击"创建应用"
2. 选择"单页应用 (SPA)"类型
3. 填写应用信息：
   - 应用名称：FunSoccer
   - 认证地址：选择一个合适的二级域名（如：funsoccer）
   - 应用描述：FunSoccer足球数据分析平台

### 3. 获取应用配置信息
创建完成后，在应用详情页面记录以下信息：
- **App ID**：应用的唯一标识符
- **App Domain**：形如 `funsoccer.authing.cn` 的域名
- **App Secret**：在"应用配置" → "其他设置" → "APP Secret" 中查看

## 第二步：配置应用设置

### 1. 配置登录回调地址
在应用配置中添加以下回调地址：
- 开发环境：`http://localhost:3000`
- 生产环境：`https://your-vercel-domain.vercel.app`

### 2. 配置登录方式
在"认证配置" → "登录注册方式"中启用：
- ✅ 邮箱密码登录
- ✅ 用户名密码登录  
- ✅ 手机号验证码登录
- ✅ 邮箱注册

### 3. 配置安全设置
在"安全设置"中：
- 启用"防止用户注册"（可选）
- 配置密码强度要求
- 设置登录失败锁定策略

## 第三步：配置Vercel环境变量

### 方式一：使用脚本自动配置

1. 确保已安装Vercel CLI：
```bash
npm i -g vercel
```

2. 登录Vercel：
```bash
vercel login
```

3. 在项目根目录运行配置脚本：
```bash
chmod +x setup-vercel-env-with-auth.sh
./setup-vercel-env-with-auth.sh
```

### 方式二：手动在Vercel控制台配置

访问 [Vercel控制台](https://vercel.com/dashboard) → 选择项目 → Settings → Environment Variables

添加以下环境变量：

#### 🔐 Authing配置（必需）
```bash
NEXT_PUBLIC_AUTHING_DOMAIN=your-domain.authing.cn
NEXT_PUBLIC_AUTHING_APP_ID=your-app-id  
AUTHING_APP_SECRET=your-app-secret
```

#### 🔒 NextAuth配置（必需）
```bash
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-random-secret-string
```

#### 📡 API配置（已有）
```bash
NEXT_PUBLIC_API_BASE=http://47.239.73.57
NEXT_PUBLIC_BACKEND_API_BASE=http://47.239.73.57
BACKEND_API_BASE=http://47.239.73.57
```

#### 🔌 WebSocket配置（已有）
```bash
NEXT_PUBLIC_WS_URL=ws://47.239.73.57:8000/ws/detection
NEXT_PUBLIC_WS_BASE=ws://47.239.73.57:8000
```

#### ⚙️ 应用配置（已有）
```bash
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
NEXT_PUBLIC_APP_ENV=production
NODE_ENV=production
```

## 第四步：生成NextAuth Secret

如果需要生成安全的NextAuth Secret，可以使用：

```bash
# 方式一：使用OpenSSL
openssl rand -base64 32

# 方式二：使用Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方式三：在线生成
# 访问 https://generate-secret.vercel.app/32
```

## 第五步：测试配置

### 1. 本地测试
```bash
# 创建 .env.local 文件并添加配置
cp .env.example .env.local
# 编辑 .env.local 添加真实的Authing配置

# 启动开发服务器
bun run dev
```

### 2. 部署到Vercel
```bash
# 提交代码
git add .
git commit -m "Add Authing authentication integration"
git push

# 触发Vercel自动部署
# 或者手动部署
vercel --prod
```

## 第六步：验证部署

部署完成后：

1. **访问生产地址**：打开你的Vercel部署地址
2. **测试登录功能**：
   - 点击右上角"登录"按钮
   - 尝试邮箱/用户名登录
   - 测试手机号验证码登录
   - 测试用户注册功能
3. **检查控制台**：查看是否有错误信息
4. **验证状态持久化**：刷新页面确认登录状态保持

## 常见问题解决

### 1. CORS错误
确保在Authing控制台的"应用配置" → "登录回调URL"中添加了正确的Vercel域名。

### 2. Token无效错误
检查环境变量是否正确设置，特别是`NEXT_PUBLIC_AUTHING_DOMAIN`和`NEXT_PUBLIC_AUTHING_APP_ID`。

### 3. NextAuth错误
确保`NEXTAUTH_URL`设置为完整的生产环境URL，`NEXTAUTH_SECRET`设置了足够长的随机字符串。

### 4. 网络请求失败
检查是否在中国大陆访问，Authing在国内有更好的网络环境。

## 安全建议

1. **保护敏感信息**：
   - 不要在客户端代码中暴露`AUTHING_APP_SECRET`
   - 使用HTTPS协议进行生产环境访问

2. **访问控制**：
   - 在Authing控制台配置IP白名单（可选）
   - 启用多因素认证（MFA）（可选）

3. **监控和日志**：
   - 在Authing控制台查看登录日志
   - 监控异常登录行为

## 支持

如果遇到问题，可以：
- 查看 [Authing官方文档](https://docs.authing.cn/)
- 访问 [Authing社区](https://forum.authing.cn/)
- 联系Authing技术支持