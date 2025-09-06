#!/bin/bash

# Update Vercel environment variables for production

echo "Updating Vercel environment variables..."

# API URLs - 更新为正确的服务器地址
vercel env rm NEXT_PUBLIC_API_BASE production --yes 2>/dev/null
echo "http://47.239.73.57:8000" | vercel env add NEXT_PUBLIC_API_BASE production

vercel env rm NEXT_PUBLIC_BACKEND_API_BASE production --yes 2>/dev/null
echo "http://47.239.73.57:8000" | vercel env add NEXT_PUBLIC_BACKEND_API_BASE production

vercel env rm BACKEND_API_BASE production --yes 2>/dev/null
echo "http://47.239.73.57:8000" | vercel env add BACKEND_API_BASE production

# WebSocket URLs - 更新为正确的WebSocket端点
vercel env rm NEXT_PUBLIC_WS_URL production --yes 2>/dev/null
echo "ws://47.239.73.57:8000/ws/detection" | vercel env add NEXT_PUBLIC_WS_URL production

vercel env rm NEXT_PUBLIC_WS_BASE production --yes 2>/dev/null
echo "ws://47.239.73.57:8000" | vercel env add NEXT_PUBLIC_WS_BASE production

echo "Environment variables updated successfully!"
echo "Triggering redeployment..."

# Trigger redeployment
vercel --prod

echo "Deployment triggered!"