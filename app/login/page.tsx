'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar'; // 可以复用之前的 Navbar 或创建一个简单的

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false, // 不自动重定向，手动处理结果
        email,
        password,
      });

      if (result?.error) {
        // 根据 authorize 函数中抛出的错误信息显示
        if (result.error === "CredentialsSignin") { // NextAuth 默认错误码
            setError("邮箱或密码错误");
        } else {
            setError(result.error);
        }
        setIsLoading(false);
      } else if (result?.ok) {
        // 登录成功，跳转到仪表盘
        router.push('/dashboard');
        // router.refresh(); // 可以刷新页面确保状态更新，但通常 push 就够了
      } else {
         // 其他未知情况
         setError('登录时发生未知错误');
         setIsLoading(false);
      }
    } catch (err) {
      setError('登录请求失败');
      console.error('Sign in error:', err);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-apple">
          <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">登录</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="apple-input w-full"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    密码
                  </label>
                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium text-apple-blue hover:text-blue-600">
                      忘记密码?
                    </Link>
                  </div>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="apple-input w-full"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="apple-button w-full disabled:opacity-50"
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            还没有账户?{' '}
            <Link href="/register" className="font-medium text-apple-blue hover:text-blue-600">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </>
  );
} 