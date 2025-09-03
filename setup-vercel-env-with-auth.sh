#!/bin/bash

# Vercel Environment Variables Setup Script with Authing Integration
# 为FunSoccer前端配置生产环境变量（包含Authing登录功能）

echo "🚀 Setting up Vercel environment variables for FunSoccer with Authing..."

# API Configuration
echo "📡 Configuring API endpoints..."
echo "http://47.239.73.57" | vercel env add NEXT_PUBLIC_API_BASE production
echo "http://47.239.73.57" | vercel env add NEXT_PUBLIC_BACKEND_API_BASE production
echo "http://47.239.73.57" | vercel env add BACKEND_API_BASE production

# WebSocket Configuration
echo "🔌 Configuring WebSocket endpoints..."
echo "ws://47.239.73.57:8000/ws/detection" | vercel env add NEXT_PUBLIC_WS_URL production
echo "ws://47.239.73.57:8000" | vercel env add NEXT_PUBLIC_WS_BASE production

# App Configuration
echo "⚙️ Configuring app settings..."
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_GEOLOCATION production
echo "production" | vercel env add NEXT_PUBLIC_APP_ENV production
echo "production" | vercel env add NODE_ENV production

# Authing Configuration
echo "🔐 Configuring Authing authentication..."
echo "请在Vercel控制台手动添加以下Authing环境变量:"
echo ""
echo "🔑 Required Authing Environment Variables:"
echo "- NEXT_PUBLIC_AUTHING_DOMAIN=your-domain.authing.cn"
echo "- NEXT_PUBLIC_AUTHING_APP_ID=your-app-id"  
echo "- AUTHING_APP_SECRET=your-app-secret"
echo ""
echo "🔒 NextAuth Configuration:"
echo "- NEXTAUTH_URL=https://your-vercel-domain.vercel.app"
echo "- NEXTAUTH_SECRET=your-nextauth-secret (生成一个随机字符串)"
echo ""
echo "⚠️  请按以下步骤配置Authing:"
echo "1. 访问 https://console.authing.cn/"
echo "2. 创建应用或选择现有应用"
echo "3. 获取 App ID, App Domain, App Secret"
echo "4. 在应用配置中添加回调地址: https://your-vercel-domain.vercel.app"
echo "5. 在Vercel控制台添加上述环境变量"
echo ""

# 可以自动设置的NextAuth相关变量
read -p "请输入你的Vercel域名 (例如: funsoccer.vercel.app): " VERCEL_DOMAIN
if [ ! -z "$VERCEL_DOMAIN" ]; then
    echo "https://$VERCEL_DOMAIN" | vercel env add NEXTAUTH_URL production
    echo "✅ NEXTAUTH_URL 已设置为: https://$VERCEL_DOMAIN"
fi

# 生成NextAuth Secret
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "$(date +%s | sha256sum | base64 | head -c 32)")
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production
echo "✅ NEXTAUTH_SECRET 已自动生成并设置"

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "📋 Configured variables:"
echo "- NEXT_PUBLIC_API_BASE=http://47.239.73.57"
echo "- NEXT_PUBLIC_BACKEND_API_BASE=http://47.239.73.57" 
echo "- BACKEND_API_BASE=http://47.239.73.57"
echo "- NEXT_PUBLIC_WS_URL=ws://47.239.73.57:8000/ws/detection"
echo "- NEXT_PUBLIC_WS_BASE=ws://47.239.73.57:8000"
echo "- NEXT_PUBLIC_ENABLE_GEOLOCATION=true"
echo "- NEXT_PUBLIC_APP_ENV=production"
echo "- NODE_ENV=production"
if [ ! -z "$VERCEL_DOMAIN" ]; then
    echo "- NEXTAUTH_URL=https://$VERCEL_DOMAIN"
fi
echo "- NEXTAUTH_SECRET=****** (已自动生成)"
echo ""
echo "🚨 还需要手动添加的Authing变量:"
echo "- NEXT_PUBLIC_AUTHING_DOMAIN"
echo "- NEXT_PUBLIC_AUTHING_APP_ID" 
echo "- AUTHING_APP_SECRET"
echo ""
echo "🎯 Ready to deploy with authentication support!"