import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import PowerBIDashboard from '../components/PowerBIDashboard';
import ProjectList from '../components/ProjectList';

// 这个页面现在是服务器组件
export default async function Dashboard() {
  // 获取用户会话
  const session = await getServerSession(authOptions);

  // 如果用户未登录，重定向到登录页面
  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }

  // 将session.user.id强制类型转换
  const userId = (session.user as any).id || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">智能招投标数据分析中心</h1>
      
      <div className="mb-8">
        <PowerBIDashboard userId={userId} />
      </div>
      
      <div className="mb-8">
        <ProjectList userId={userId} />
      </div>
    </div>
  );
} 