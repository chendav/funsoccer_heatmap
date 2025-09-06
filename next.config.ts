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
  // Rewrites are configured in vercel.json to avoid conflicts
};

export default nextConfig;
