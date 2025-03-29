import './globals.css';
import type { Metadata } from 'next';
import AuthProvider from './components/AuthProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: '招标数据分析平台',
  description: '一站式招标数据分析与可视化解决方案',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <Toaster position="top-center" />
          <main className="min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
} 