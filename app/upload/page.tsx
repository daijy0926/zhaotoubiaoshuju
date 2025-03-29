import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import UploadClientContent from '../components/UploadClientContent';
import Navbar from '../components/Navbar';

export default async function UploadPage() {
  // 检查用户是否登录
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    // 重定向到登录页面
    redirect('/api/auth/signin?callbackUrl=/upload');
  }
  
  const userId = (session.user as any).id;
  
  return (
    <div>
      <Navbar />
      <UploadClientContent userId={userId} />
    </div>
  );
} 