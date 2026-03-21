import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Cloudflare Pages 配置
  experimental: {
    // 启用服务端组件支持
    serverComponentsExternalPackages: [],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
    // Cloudflare Pages 图片优化配置
    unoptimized: true,
  },
};

export default nextConfig;
