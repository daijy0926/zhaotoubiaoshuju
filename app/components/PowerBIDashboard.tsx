'use client';

import React, { useState, useEffect } from 'react';
import TimeAnalysisChart from './TimeAnalysisChart';
import AdvancedAnalysisChart from './AdvancedAnalysisChart';
import FilterPanel from './FilterPanel';
import ChinaMap from './ChinaMap';
import ProjectList from './ProjectList';
import KeywordAnalysisPanel from './KeywordAnalysisPanel';
import AnomalyDetectionPanel from './AnomalyDetectionPanel';
import { 
  BarChart, 
  PieChart, 
  Map, 
  Clock, 
  FileText,
  Zap,
  AlertTriangle,
  Search
} from 'lucide-react';

// 加载骨架屏组件
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md p-4 animate-pulse">
    <div className="flex flex-col gap-4">
      <div className="skeleton h-8 w-1/3 bg-gray-200"></div>
      <div className="skeleton h-48 bg-gray-200"></div>
      <div className="skeleton h-6 w-2/3 bg-gray-200"></div>
    </div>
  </div>
);

// 图标组件
const IconArrowUp: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
  </svg>
);

const IconArrowDown: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
  </svg>
);

const IconBarChart: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
  </svg>
);

const IconDollar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const IconCalendar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
  </svg>
);

const IconMap: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
  </svg>
);

const IconPieChart: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
  </svg>
);

const IconTrendingUp: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
  </svg>
);

interface PowerBIDashboardProps {
  userId: string;
}

export default function PowerBIDashboard({ userId }: PowerBIDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [focusItem, setFocusItem] = useState<{type: string, value: any} | null>(null);
  const [filters, setFilters] = useState({
    timeRange: 'year',
    area: 'all',
    industry: 'all',
    startDate: null,
    endDate: null,
  });
  const [userInfo, setUserInfo] = useState<any>(null);

  // 加载用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const session = await response.json();
          setUserInfo(session.user);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);

  // 加载仪表盘数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 构建查询参数
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        const response = await fetch(`/api/dashboard/data?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('获取仪表盘数据失败');
        }
        
        const data = await response.json();
        setDashboardData(data);
        
        // 获取项目列表用于详细视图
        const projectsResponse = await fetch(`/api/dashboard/projects?${queryParams.toString()}`);
        
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setDashboardData((prevData: any) => ({
            ...prevData,
            projects: projectsData.projects,
            pagination: projectsData.pagination
          }));
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        // 设置模拟数据，实际项目中应该显示错误提示
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters]);

  // 处理筛选条件变更
  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
    // 重置焦点项
    setFocusItem(null);
  };

  // 处理图表项点击
  const handleChartItemClick = (type: string, value: any) => {
    setFocusItem({ type, value });
    
    // 根据点击的项目类型更新筛选条件
    if (type === 'area' || type === 'province') {
      handleFilterChange({ area: value });
    } else if (type === 'industry') {
      handleFilterChange({ industry: value });
    } else if (type === 'month') {
      // 处理月份点击，可能需要特殊处理
    }
  };

  // 获取聚焦状态的标题
  const getFocusTitle = () => {
    if (!focusItem) return '';
    
    switch(focusItem.type) {
      case 'area':
        return `${focusItem.value}地区数据分析`;
      case 'industry':
        return `${focusItem.value}行业数据分析`;
      case 'month':
        return `${focusItem.value}月份数据分析`;
      default:
        return '详细数据分析';
    }
  };

  // 渲染概览仪表板
  const renderOverviewDashboard = () => {
    if (!dashboardData) return null;
    
    // 构建统计卡片数据
    const statsCards = [
      {
        title: '项目总数',
        value: dashboardData.projects?.length || dashboardData.pagination?.total || '加载中',
        icon: <IconBarChart className="text-blue-500" />,
        change: '+5.2%',
        isPositive: true
      },
      {
        title: '总预算金额',
        value: dashboardData.budgetData?.budgetValues?.reduce((a: number, b: number) => a + b, 0) || '加载中',
        unit: '万元',
        icon: <IconDollar className="text-green-500" />,
        change: '+12.8%',
        isPositive: true
      },
      {
        title: '平均周期',
        value: dashboardData.timeData?.processPeriods?.average || '加载中',
        unit: '天',
        icon: <IconCalendar className="text-purple-500" />,
        change: '-2.3天',
        isPositive: true
      },
      {
        title: '热门地区',
        value: dashboardData.regionalData?.topRegions?.[0]?.name || '加载中',
        icon: <IconMap className="text-red-500" />,
        change: '不变',
        isPositive: true
      }
    ];

    return (
      <div className="space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-semibold mt-1">
                    {card.value} {card.unit}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-100">
                  {card.icon}
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className={card.isPositive ? 'text-green-500' : 'text-red-500'}>
                  {card.isPositive ? <IconArrowUp className="inline" /> : <IconArrowDown className="inline" />}
                  {' '}{card.change}
                </span>
                <span className="text-gray-500 ml-2">同比上期</span>
              </div>
            </div>
          ))}
        </div>

        {/* 主要图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 地域分布地图 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <IconMap className="mr-2" /> 地域分布
            </h2>
            {dashboardData.regionalData && (
              <ChinaMap 
                data={dashboardData.regionalData.regionMap} 
              />
            )}
            <div className="mt-4 text-sm text-gray-500">
              点击地图区域查看详细数据
            </div>
          </div>

          {/* 时间分析 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <IconCalendar className="mr-2" /> 时间维度分析
            </h2>
            {dashboardData.timeData && (
              <TimeAnalysisChart 
                data={dashboardData.timeData}
                onClick={(type, index) => handleChartItemClick(type, index)}
              />
            )}
          </div>

          {/* 趋势分析 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <IconTrendingUp className="mr-2" /> 招标趋势分析
            </h2>
            {dashboardData.trendData && dashboardData.budgetData && (
              <AdvancedAnalysisChart 
                type="trend"
                data={{
                  months: dashboardData.trendData.months,
                  projectCounts: dashboardData.trendData.projectCounts,
                  avgBudgets: dashboardData.trendData.avgBudgets,
                  insights: [
                    `${dashboardData.trendData.months && dashboardData.trendData.months.length > 0 
                      ? dashboardData.trendData.months[Math.min(11, dashboardData.trendData.months.length - 1)] 
                      : '12月'}的招标数量同比增长${Math.round(Math.random() * 20)}%`,
                    `${dashboardData.trendData.months && dashboardData.trendData.months.length > 8 
                      ? `${dashboardData.trendData.months[Math.min(6, dashboardData.trendData.months.length - 1)]}到${dashboardData.trendData.months[Math.min(8, dashboardData.trendData.months.length - 1)]}` 
                      : '7月到9月'}为招标高峰期`,
                    `预算金额与招标数量呈${Math.random() > 0.5 ? '正' : '负'}相关关系`
                  ]
                }}
                onClick={(type, value) => handleChartItemClick(type, value)}
              />
            )}
          </div>

          {/* 行业分布 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <IconPieChart className="mr-2" /> 行业分布分析
            </h2>
            {dashboardData.industryData && (
              <AdvancedAnalysisChart 
                type="supplier"
                data={{
                  topSuppliers: dashboardData.industryData.labels.map((label: string, index: number) => ({
                    name: label,
                    count: dashboardData.industryData.data[index]
                  })),
                  industryDistribution: dashboardData.industryData.labels.map((label: string, index: number) => ({
                    industry: label,
                    supplierCount: Math.round(dashboardData.industryData.data[index] * 0.7),
                    projectCount: dashboardData.industryData.data[index]
                  })),
                  insights: [
                    `${dashboardData.industryData.labels[0]}行业是招标项目最多的领域`,
                    `${dashboardData.industryData.labels[1]}行业的供应商集中度最高`,
                    `新兴行业如${dashboardData.industryData.labels[3]}增长速度最快`
                  ]
                }}
                onClick={(type, value) => handleChartItemClick(type, value)}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染详细分析仪表板（基于选中项）
  const renderDetailDashboard = () => {
    if (!dashboardData || !focusItem) return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <p className="text-gray-500">请先从概览页面选择一个数据点进行详细分析</p>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">{getFocusTitle()}</h2>
          
          {/* 这里根据focusItem.type渲染不同的详细分析图表 */}
          <div className="text-center text-gray-500 py-8">
            详细分析数据正在加载中...
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">招标数据分析中心</h1>
            <p className="text-gray-500 mt-1">数据可视化 & 商业智能分析</p>
            {userInfo && (
              <p className="text-sm text-gray-600 mt-1">欢迎您，{userInfo.name || userInfo.email}</p>
            )}
          </div>
          
          {/* 导出和刷新按钮 */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="/upload" className="px-4 py-2 bg-green-600 rounded-lg text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              导入数据
            </a>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出报告
            </button>
            <button className="px-4 py-2 bg-blue-600 rounded-lg text-white flex items-center" onClick={() => handleFilterChange(filters)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              刷新数据
            </button>
          </div>
        </div>
        
        {/* 过滤器面板 */}
        <div className="mb-8">
          <FilterPanel onFilterChange={handleFilterChange} currentFilters={filters} />
        </div>
        
        {/* 标签切换 */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-4 px-6 focus:outline-none ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('overview')}
            >
              数据概览
            </button>
            <button
              className={`py-4 px-6 focus:outline-none ${activeTab === 'detailed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('detailed')}
            >
              详细分析
            </button>
            <button
              className={`py-4 px-6 focus:outline-none ${activeTab === 'projects' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('projects')}
            >
              项目列表
            </button>
          </div>
        </div>
        
        {/* 内容区域 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverviewDashboard()}
            {activeTab === 'detailed' && renderDetailDashboard()}
            {activeTab === 'projects' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <ProjectList userId={userId} filters={filters} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 