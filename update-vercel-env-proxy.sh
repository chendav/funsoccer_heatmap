#!/bin/bash

# Update Vercel environment variables to use proxy paths
# This solves the Mixed Content security issue

echo "Updating Vercel environment variables to use proxy paths..."

# API URLs - 使用相对路径，让 Vercel 代理处理
vercel env rm NEXT_PUBLIC_API_BASE production --yes 2>/dev/null
echo "/api/proxy" | vercel env add NEXT_PUBLIC_API_BASE production

vercel env rm NEXT_PUBLIC_BACKEND_API_BASE production --yes 2>/dev/null
echo "/api/proxy" | vercel env add NEXT_PUBLIC_BACKEND_API_BASE production

vercel env rm BACKEND_API_BASE production --yes 2>/dev/null
echo "/api/proxy" | vercel env add BACKEND_API_BASE production

# WebSocket URLs - 对于 WebSocket，我们仍需要保持原样
# 因为 WebSocket 升级可能需要特殊处理
vercel env rm NEXT_PUBLIC_WS_URL production --yes 2>/dev/null
echo "/ws/detection" | vercel env add NEXT_PUBLIC_WS_URL production

vercel env rm NEXT_PUBLIC_WS_BASE production --yes 2>/dev/null
echo "/ws" | vercel env add NEXT_PUBLIC_WS_BASE production

echo "Environment variables updated for proxy configuration!"
echo "Note: The Next.js config will handle the actual proxying to http://47.239.73.57:8000"