import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import PowerBIDashboard from '../components/PowerBIDashboard';
import Navbar from '../components/Navbar';

// 这个页面现在是服务器组件
export default async function DashboardPage() {
  // 获取用户会话信息
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    // 如果用户未登录，重定向到登录页面
    redirect('/api/auth/signin?callbackUrl=/dashboard');
  }
  
  // 获取用户ID
  const userId = (session.user as any).id;
  
  return (
    <>
      <Navbar />
      <PowerBIDashboard userId={userId} />
    </>
  );
} 