import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 在构建时忽略ESLint错误（生产环境部署）
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 在构建时忽略TypeScript错误（生产环境部署）
  typescript: {
    ignoreBuildErrors: true,
  },
  // 配置 API 代理以解决 Mixed Content 问题
  async rewrites() {
    return [
      {
        source: '/api/proxy/api/:path*',
        destination: 'http://47.239.73.57:8000/api/:path*',
      },
      {
        source: '/api/proxy/:path*',
        destination: 'http://47.239.73.57:8000/:path*',
      },
      {
        source: '/ws/:path*',
        destination: 'http://47.239.73.57:8000/ws/:path*',
      },
    ];
  },
};

export default nextConfig;
