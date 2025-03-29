import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '../components/Navbar';
import DashboardClientContent from '../components/DashboardClientContent'; // 将客户端逻辑分离

// 这个页面现在是服务器组件
export default async function DashboardPage() {
  // 1. 在服务器端获取会话
  const session = await getServerSession(authOptions);

  // 2. 如果未登录，重定向到登录页
  if (!session) {
    redirect('/login?callbackUrl=/dashboard'); // 重定向回此页面
  }
  
  // 3. 获取用户 ID
  const userId = (session.user as any)?.id;
  if (!userId) {
     // 如果没有 userId（理论上不应该发生，因为我们配置了 callback），也重定向
     console.error("Session exists but userId is missing", session);
     redirect('/login?error=User ID missing');
  }

  // 4. (后续步骤) 在这里可以进行服务器端的数据获取
  // 例如: const initialData = await fetchDashboardDataForUser(userId);
  // 然后将 initialData 传递给客户端组件

  // 5. 渲染页面骨架（服务器组件部分），并将客户端交互部分委托给 DashboardClientContent
  return (
    <>
      <Navbar />
      <DashboardClientContent userId={userId} /> 
      {/* <DashboardClientContent userId={userId} initialData={initialData} />  // 传递初始数据 */} 
    </>
  );
} 