# FunSoccer Vercel 部署指南（包含Authing登录功能）

本指南将帮助你将集成了Authing登录功能的FunSoccer应用部署到Vercel生产环境。

## 🚀 快速部署步骤

### 第一步：准备Authing应用

1. **访问Authing控制台**
   ```
   https://console.authing.cn/
   ```

2. **创建应用**
   - 应用类型：单页应用 (SPA)
   - 应用名称：FunSoccer
   - 选择合适的认证地址

3. **记录应用信息**
   ```
   App ID: 6xxxxxxxxxxxxxxxxxxxxxxx
   App Domain: funsoccer.authing.cn
   App Secret: 在"应用配置" → "其他设置"中查看
   ```

4. **配置回调地址**
   在应用配置中添加：
   ```
   开发环境：http://localhost:3000
   生产环境：https://your-domain.vercel.app
   ```

### 第二步：部署前检查

运行预部署检查脚本：
```bash
cd funsoccer_coding/soccer-heatmap-next
node pre-deploy-check.js
```

确保所有检查项都通过 ✅

### 第三步：配置Vercel环境变量

#### 方式一：使用自动化脚本（推荐）

```bash
# 确保已安装并登录Vercel CLI
npm i -g vercel
vercel login

# 运行环境变量配置脚本
chmod +x setup-vercel-env-with-auth.sh
./setup-vercel-env-with-auth.sh
```

按提示输入Vercel域名，脚本会自动配置大部分环境变量。

#### 方式二：手动配置

访问 Vercel 控制台 → 项目 → Settings → Environment Variables

**必需的环境变量：**

```bash
# Authing 配置
NEXT_PUBLIC_AUTHING_DOMAIN=your-domain.authing.cn
NEXT_PUBLIC_AUTHING_APP_ID=your-app-id
AUTHING_APP_SECRET=your-app-secret

# NextAuth 配置
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-32-char-random-string

# API 配置
NEXT_PUBLIC_API_BASE=http://47.239.73.57
NEXT_PUBLIC_BACKEND_API_BASE=http://47.239.73.57
BACKEND_API_BASE=http://47.239.73.57

# WebSocket 配置
NEXT_PUBLIC_WS_URL=ws://47.239.73.57:8000/ws/detection
NEXT_PUBLIC_WS_BASE=ws://47.239.73.57:8000

# 应用配置
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
NEXT_PUBLIC_APP_ENV=production
NODE_ENV=production
```

**生成NextAuth Secret:**
```bash
# 使用OpenSSL
openssl rand -base64 32

# 或使用Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 第四步：部署到Vercel

#### 方式一：Git自动部署（推荐）

```bash
# 提交所有更改
git add .
git commit -m "Add Authing authentication integration"
git push origin main

# Vercel会自动检测到推送并开始部署
```

#### 方式二：使用Vercel CLI

```bash
# 部署到生产环境
vercel --prod

# 或者先部署到预览环境测试
vercel

# 确认无误后推广到生产环境
vercel --prod
```

### 第五步：验证部署

1. **访问部署地址**
   ```
   https://your-domain.vercel.app
   ```

2. **测试登录功能**
   - 点击右上角"登录"按钮
   - 测试邮箱密码登录
   - 测试手机验证码登录
   - 测试用户注册功能

3. **检查浏览器控制台**
   - 确保没有JavaScript错误
   - 检查网络请求是否正常

4. **验证状态持久化**
   - 登录后刷新页面
   - 确认登录状态保持

## 📋 部署后检查清单

- [ ] 🔐 Authing应用配置完成
- [ ] 📝 Vercel环境变量设置完成
- [ ] 🚀 应用成功部署到Vercel
- [ ] 🔑 登录功能正常工作
- [ ] 📱 手机端响应式显示正常
- [ ] 💾 登录状态持久化工作
- [ ] 🌐 HTTPS证书自动配置
- [ ] 📊 应用性能正常

## 🔧 故障排除

### 常见问题及解决方案

#### 1. CORS错误
**错误信息：** "Access to fetch at ... from origin ... has been blocked by CORS policy"

**解决方案：**
- 检查Authing控制台的回调URL配置
- 确保包含了正确的Vercel域名
- 验证协议是否为HTTPS

#### 2. 环境变量未生效
**症状：** 登录按钮点击无响应或显示错误

**解决方案：**
```bash
# 检查Vercel环境变量
vercel env list

# 重新部署以应用环境变量
vercel --prod
```

#### 3. NextAuth配置错误
**错误信息：** "NEXTAUTH_URL environment variable not set"

**解决方案：**
- 确保设置了正确的NEXTAUTH_URL
- 检查NEXTAUTH_SECRET是否足够长（推荐32字符以上）

#### 4. API请求失败
**症状：** 用户登录成功但其他API功能异常

**解决方案：**
- 检查`NEXT_PUBLIC_API_BASE`设置
- 确认后端服务`http://47.239.73.57:8000`可访问
- 验证vercel.json中的API代理配置

#### 5. 移动端显示问题
**症状：** 手机访问时布局异常

**解决方案：**
- 检查响应式CSS
- 测试不同设备的viewport
- 确认Touch事件处理正常

## 📊 性能优化建议

1. **启用Vercel Analytics**
   ```bash
   vercel analytics enable
   ```

2. **配置图片优化**
   - 使用Next.js Image组件
   - 启用WebP格式

3. **启用边缘函数**
   - 配置地理位置就近访问
   - 优化API响应时间

4. **缓存优化**
   - 配置静态资源缓存
   - 设置API响应缓存

## 🔒 安全建议

1. **环境变量安全**
   - 不要在客户端代码中暴露敏感信息
   - 定期更换NEXTAUTH_SECRET

2. **HTTPS强制**
   - Vercel自动启用HTTPS
   - 配置HTTP到HTTPS重定向

3. **访问控制**
   - 在Authing中配置IP白名单（可选）
   - 启用多因素认证（MFA）

4. **监控和告警**
   - 设置Vercel部署通知
   - 监控Authing登录日志

## 🎯 生产环境最佳实践

1. **域名配置**
   ```bash
   # 添加自定义域名
   vercel domains add yourdomain.com
   ```

2. **监控设置**
   - 配置Vercel Analytics
   - 设置错误监控
   - 启用性能监控

3. **备份策略**
   - 定期备份环境变量配置
   - 保存Authing应用配置

4. **版本管理**
   - 使用Git标签管理版本
   - 配置自动化测试

## 📞 支持和帮助

遇到问题时，可以：

1. **查看日志**
   ```bash
   # Vercel部署日志
   vercel logs

   # Vercel运行时日志
   vercel logs --since 1h
   ```

2. **获取帮助**
   - [Vercel文档](https://vercel.com/docs)
   - [Authing文档](https://docs.authing.cn/)
   - [Next.js文档](https://nextjs.org/docs)

3. **社区支持**
   - Vercel Discord社区
   - Authing技术支持
   - GitHub Issues

---

🎉 **恭喜！你已经成功将FunSoccer应用与Authing登录功能部署到Vercel生产环境！**