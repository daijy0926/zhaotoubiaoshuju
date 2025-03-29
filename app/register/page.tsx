'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar'; // 可以复用或创建一个简单的 Navbar

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 客户端基本校验
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError('邮箱格式不正确');
        return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '注册失败');
      } else {
        setSuccess('注册成功！正在跳转到登录页面...');
        // 注册成功后，可以选择自动登录或跳转到登录页
        setTimeout(() => {
          router.push('/login');
        }, 2000); // 延迟2秒跳转
      }
    } catch (err) {
      setError('请求注册API失败');
      console.error('Registration API error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-apple">
          <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">创建账户</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                姓名 (可选)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="apple-input w-full"
                placeholder="你的名字"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="apple-input w-full"
                placeholder="至少6位字符"
              />
            </div>
             <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="apple-input w-full"
                placeholder="再次输入密码"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 p-3">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="apple-button w-full disabled:opacity-50 mt-2"
              >
                {isLoading ? '注册中...' : '注册'}
              </button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            已有账户?{' '}
            <Link href="/login" className="font-medium text-apple-blue hover:text-blue-600">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </>
  );
} 