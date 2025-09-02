#!/bin/bash

# Vercel Environment Variables Setup Script
# 为FunSoccer前端配置生产环境变量

echo "🚀 Setting up Vercel environment variables for FunSoccer..."

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
echo ""
echo "🎯 Ready to deploy with correct endpoint configuration!"