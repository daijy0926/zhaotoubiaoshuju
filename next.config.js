/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 添加域名配置
  images: {
    domains: ['zhaotoubiaoshuju.daijy.top', 'zhaotoubiaoshuju.vercel.app'],
  },
  
  // 环境变量
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://zhaotoubiaoshuju.daijy.top',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://zhaotoubiaoshuju.daijy.top',
  },
  
  // 配置输出独立应用，改善部署性能
  output: 'standalone',
};

module.exports = nextConfig; 