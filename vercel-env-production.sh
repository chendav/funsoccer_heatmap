#!/bin/bash

# Vercel Production Environment Variables for FunSoccer with Authing
# 使用你的真实Authing配置

echo "🚀 Setting up Vercel production environment variables with your Authing configuration..."

# Authing Configuration (使用你的真实配置)
echo "🔐 Configuring Authing authentication..."
echo "funsoccer.authing.cn" | vercel env add NEXT_PUBLIC_AUTHING_DOMAIN production
echo "68b7cbae2816014ddfcbba17" | vercel env add NEXT_PUBLIC_AUTHING_APP_ID production
echo "67dcdcbf9afbb6b882093b9e3e215d55" | vercel env add AUTHING_APP_SECRET production

# API Configuration
echo "📡 Configuring API endpoints..."
echo "https://api.funsoccer.app" | vercel env add NEXT_PUBLIC_API_BASE production
echo "https://api.funsoccer.app" | vercel env add NEXT_PUBLIC_BACKEND_API_BASE production
echo "https://api.funsoccer.app" | vercel env add BACKEND_API_BASE production

# WebSocket Configuration
echo "🔌 Configuring WebSocket endpoints..."
echo "wss://api.funsoccer.app/ws/detection" | vercel env add NEXT_PUBLIC_WS_URL production
echo "wss://api.funsoccer.app" | vercel env add NEXT_PUBLIC_WS_BASE production

# App Configuration
echo "⚙️ Configuring app settings..."
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_GEOLOCATION production
echo "production" | vercel env add NEXT_PUBLIC_APP_ENV production
echo "production" | vercel env add NODE_ENV production

# NextAuth Configuration
echo "🔒 Configuring NextAuth..."
# 使用你的实际域名
VERCEL_DOMAIN="funsoccer.app"

echo "https://$VERCEL_DOMAIN" | vercel env add NEXTAUTH_URL production
echo "✅ NEXTAUTH_URL 已设置为: https://$VERCEL_DOMAIN"

# 提醒用户在Authing中添加回调地址
echo ""
echo "🚨 重要：请在Authing控制台添加以下回调地址："
echo "https://$VERCEL_DOMAIN"
echo "https://soccer-heatmap-next-nsrefbok6-chendavs-projects.vercel.app (备用)"
    echo ""
    echo "步骤："
    echo "1. 访问 https://console.authing.cn/"
    echo "2. 选择 FunSoccer 应用"
    echo "3. 进入应用配置 → 登录回调URL"
    echo "4. 删除默认的控制台地址"
    echo "5. 添加: http://localhost:3000"
    echo "6. 添加: https://$VERCEL_DOMAIN"
else
    echo "⚠️ 未输入域名，请稍后手动设置 NEXTAUTH_URL"
fi

# 生成生产环境的NextAuth Secret
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "$(date +%s | sha256sum | base64 | head -c 32)")
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production
echo "✅ NEXTAUTH_SECRET 已自动生成并设置"

echo ""
echo "✅ Vercel environment variables setup complete!"
echo ""
echo "📋 Configured variables:"
echo "- NEXT_PUBLIC_AUTHING_DOMAIN=funsoccer.authing.cn"
echo "- NEXT_PUBLIC_AUTHING_APP_ID=68b7cbae2816014ddfcbba17"
echo "- AUTHING_APP_SECRET=****** (已设置)"
echo "- NEXT_PUBLIC_API_BASE=https://api.funsoccer.app"
echo "- NEXT_PUBLIC_BACKEND_API_BASE=https://api.funsoccer.app"
echo "- BACKEND_API_BASE=https://api.funsoccer.app"
echo "- NEXT_PUBLIC_WS_URL=wss://api.funsoccer.app/ws/detection"
echo "- NEXT_PUBLIC_WS_BASE=wss://api.funsoccer.app"
echo "- NEXT_PUBLIC_ENABLE_GEOLOCATION=true"
echo "- NEXT_PUBLIC_APP_ENV=production"
echo "- NODE_ENV=production"
if [ ! -z "$VERCEL_DOMAIN" ]; then
    echo "- NEXTAUTH_URL=https://$VERCEL_DOMAIN"
fi
echo "- NEXTAUTH_SECRET=****** (已自动生成)"
echo ""
echo "🎯 Next steps:"
echo "1. 在Authing控制台配置回调地址"
echo "2. 运行 'vercel --prod' 部署到生产环境"
echo "3. 测试生产环境登录功能"
echo ""
echo "🎉 Ready for production deployment!"