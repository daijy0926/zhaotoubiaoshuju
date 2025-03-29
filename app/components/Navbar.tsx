'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const isActive = (path: string) => {
    return pathname === path ? 'text-apple-blue font-medium' : 'text-gray-600 hover:text-apple-blue';
  };

  return (
    <nav className="glass-navbar sticky top-0 z-50 py-4 backdrop-blur-lg border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href={session ? "/dashboard" : "/"} className="text-2xl font-semibold text-apple-dark">
              招标数据分析平台
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            {/* 未登录状态：显示首页链接 */}
            {!session && (
              <Link href="/" className={`${isActive('/')} transition-colors`}>
                首页
              </Link>
            )}
            
            {/* 已登录状态：显示数据分析和数据导入链接 */}
            {session && (
              <>
                <Link href="/dashboard" className={`${isActive('/dashboard')} transition-colors`}>
                  数据分析
                </Link>
                <Link href="/upload" className={`${isActive('/upload')} transition-colors`}>
                  数据导入
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              // 加载中状态
              <div className="animate-pulse h-8 w-24 bg-gray-200 rounded-md"></div>
            ) : session ? (
              // 已登录状态
              <>
                <span className="text-gray-700 text-sm hidden sm:block">
                  欢迎, {session.user?.name || session.user?.email}
                </span>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="apple-button-secondary text-sm"
                >
                  退出
                </button>
              </>
            ) : (
              // 未登录状态
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="apple-button-secondary text-sm"
                >
                  登录
                </button>
                <Link
                  href="/register"
                  className="apple-button text-sm"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 