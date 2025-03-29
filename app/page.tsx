import Link from 'next/link';
import Navbar from './components/Navbar';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <>
      <Navbar />

      <section className="bg-gradient-to-br from-white to-sky-100 py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-800 leading-tight">
            智能招标数据分析平台
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            一站式解决方案，从数据导入、清洗、分析到可视化洞察，助您轻松把握市场脉搏，优化采购决策。
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register" className="apple-button text-lg px-8 py-3">
              立即注册
            </Link>
            <Link href="/login" className="apple-button-secondary text-lg px-8 py-3">
              登录
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-gray-800">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="feature-card">
              <div className="feature-icon bg-blue-100 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.425 0 4.5 4.5 0 0 1-1.41 8.775H6.75Z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">便捷数据导入</h3>
              <p className="text-gray-600">
                支持批量上传JSON文件，智能解析和校验数据，自动处理重复与格式问题。
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 1.085m1-1.085V11.25m1 1.085-1-1.085m0 0h-1.5m7.5 0h1.5m-4.5 4.5H18m-3.75 0h-7.5" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">多维数据分析</h3>
              <p className="text-gray-600">
                提供时间、地域、行业、机构等多维度分析，交互式图表深入洞察数据价值。
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon bg-purple-100 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">精美可视化</h3>
              <p className="text-gray-600">
                采用现代化的图表库，生成清晰直观的可视化报告，支持地图、趋势图、占比图等。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-sky-50 to-indigo-100">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">准备好探索数据了吗?</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto mb-10">
              立即注册，开始上传您的招标数据，发掘隐藏的商业价值。
            </p>
             <Link href="/register" className="apple-button text-lg px-10 py-4">
              免费开始使用
            </Link>
        </div>
      </section>

      <footer className="py-8 bg-white border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
           © {new Date().getFullYear()} 招标数据分析平台. All rights reserved.
        </div>
      </footer>
    </>
  );
} 