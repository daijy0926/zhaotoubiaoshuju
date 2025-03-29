'use client';

import { useState, useEffect } from 'react';
import TrendChart from './TrendChart';
import RegionMap from './RegionMap';
import IndustryChart from './IndustryChart';
import BudgetComparisonChart from './BudgetComparisonChart';
import FilterPanel from './FilterPanel';

// 加载骨架屏组件
const SkeletonCard = () => (
  <div className="apple-card">
    <div className="flex flex-col gap-4">
      <div className="skeleton h-8 w-1/3"></div>
      <div className="skeleton h-48"></div>
      <div className="skeleton h-6 w-2/3"></div>
    </div>
  </div>
);

// 接收用户ID作为props
interface DashboardClientContentProps {
  userId: string;
  initialData?: any; // 可选的初始数据
}

export default function DashboardClientContent({ userId, initialData }: DashboardClientContentProps) {
  const [isLoading, setIsLoading] = useState(!initialData); // 如果有初始数据，设置加载状态为false
  const [dashboardData, setDashboardData] = useState<any>(initialData || null);
  const [filters, setFilters] = useState({
    timeRange: 'year',
    area: 'all',
    industry: 'all',
    startDate: null,
    endDate: null,
  });

  // 加载仪表盘数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 实际API调用，传递用户ID和筛选条件
        const queryParams = new URLSearchParams();
        // 添加所有筛选条件
        for (const [key, value] of Object.entries(filters)) {
          if (value !== null) {
            queryParams.append(key, String(value));
          }
        }
        // 添加用户ID
        queryParams.append('userId', userId);
        
        const response = await fetch(`/api/dashboard/data?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // 展示错误提示或回退到模拟数据
        setDashboardData({
          trendData: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            bidCounts: [65, 78, 90, 81, 76, 85, 95, 101, 98, 87, 105, 120],
            bidAmounts: [1200, 1350, 1500, 1320, 1450, 1600, 1700, 1850, 1800, 1650, 1900, 2100],
          },
          regionalData: {
            topRegions: [
              { name: '广东', value: 358 },
              { name: '北京', value: 287 },
              { name: '上海', value: 251 },
              { name: '江苏', value: 198 },
              { name: '浙江', value: 176 },
            ],
            regionMap: [
              { name: '北京', value: 287 },
              { name: '天津', value: 123 },
              { name: '河北', value: 98 },
              // ... 其他省份数据
            ]
          },
          industryData: {
            labels: ['信息技术', '医疗卫生', '建筑工程', '教育', '交通', '其他'],
            data: [35, 25, 15, 10, 8, 7],
          },
          budgetData: {
            categories: ['信息技术', '医疗卫生', '建筑工程', '教育', '交通'],
            budget: [250, 320, 180, 120, 200],
            actual: [230, 310, 195, 110, 180],
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters, userId]);

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  // 处理多维分析按钮点击
  const handleMultiDimensionAnalysis = (type: string) => {
    // 显示分析加载状态
    setIsLoading(true);
    
    // 模拟分析数据加载时间
    setTimeout(() => {
      // 根据类型显示不同的分析模态框内容
      setModalContent({
        title: getAnalysisTitle(type),
        content: getAnalysisContent(type)
      });
      setIsModalOpen(true);
      setIsLoading(false);
    }, 800);
  };

  // 处理高级分析按钮点击
  const handleAdvancedAnalysis = (type: string) => {
    // 显示分析加载状态
    setIsLoading(true);
    
    // 模拟分析数据加载时间
    setTimeout(() => {
      // 根据类型显示不同的分析报告内容
      setModalContent({
        title: type === 'budget' ? '预算与成交价差异分析报告' : '中标供应商分析报告',
        content: type === 'budget' ? getBudgetAnalysisContent() : getSupplierAnalysisContent()
      });
      setIsModalOpen(true);
      setIsLoading(false);
    }, 1000);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 根据分析类型获取标题
  const getAnalysisTitle = (type: string): string => {
    switch(type) {
      case 'time': return '时间维度分析';
      case 'geo': return '地理维度分析';
      case 'org': return '机构维度分析';
      case 'product': return '产品维度分析';
      default: return '多维数据分析';
    }
  };

  // 根据分析类型获取内容
  const getAnalysisContent = (type: string): React.ReactNode => {
    switch(type) {
      case 'time':
        return (
          <div>
            <p className="text-gray-600 mb-4">时间维度分析展示了招标项目在不同时间段的分布情况，帮助您识别招标活动的季节性趋势和周期性模式。</p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-2">分析结论</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>招标活动在每年的3-5月和9-11月达到高峰</li>
                <li>一周内，周三和周四发布的项目数量最多</li>
                <li>近两年招标数量整体呈上升趋势，增长率约为15%</li>
              </ul>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              [此处将显示时间维度图表]
            </div>
            <div className="flex justify-end">
              <button className="apple-button">导出PDF报告</button>
            </div>
          </div>
        );
      case 'geo':
        return (
          <div>
            <p className="text-gray-600 mb-4">地理维度分析展示了招标项目在不同地区的分布情况，帮助您识别重点区域和市场机会。</p>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-2">分析结论</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>华东和华北地区占据总招标量的58%</li>
                <li>西部地区招标增速最快，同比增长23%</li>
                <li>三线及以下城市招标占比逐年提升，显示市场下沉趋势</li>
              </ul>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              [此处将显示地理分布热力图]
            </div>
            <div className="flex justify-end">
              <button className="apple-button">导出PDF报告</button>
            </div>
          </div>
        );
      case 'org':
        return (
          <div>
            <p className="text-gray-600 mb-4">机构维度分析展示了不同采购方和代理机构的招标特点和模式，帮助您了解客户结构。</p>
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-2">分析结论</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>政府机构占总采购量的45%，国企占32%，民企占23%</li>
                <li>代理机构参与的项目平均金额高出非代理项目25%</li>
                <li>Top10代理机构占据市场份额35%，行业集中度中等</li>
              </ul>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              [此处将显示机构分布图表]
            </div>
            <div className="flex justify-end">
              <button className="apple-button">导出PDF报告</button>
            </div>
          </div>
        );
      case 'product':
        return (
          <div>
            <p className="text-gray-600 mb-4">产品维度分析展示了不同产品类别和关键词的分布情况，帮助您找到产品机会。</p>
            <div className="bg-orange-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-2">分析结论</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>IT设备和软件服务是最频繁招标的产品类别</li>
                <li>"智能化"、"数字化"、"云平台"是高频关键词</li>
                <li>医疗设备和环保技术招标增长最快</li>
              </ul>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              [此处将显示产品词云和分类图]
            </div>
            <div className="flex justify-end">
              <button className="apple-button">导出PDF报告</button>
            </div>
          </div>
        );
      default:
        return <p>未找到相关分析内容</p>;
    }
  };

  // 获取预算分析内容
  const getBudgetAnalysisContent = (): React.ReactNode => {
    return (
      <div>
        <p className="text-gray-600 mb-4">预算与成交价差异分析可以帮助您了解不同行业和项目类型的价格波动情况，发现潜在的价格优化空间。</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">价差总览</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>平均价差比例:</span>
                <span className="font-medium">-12.3%</span>
              </div>
              <div className="flex justify-between">
                <span>价差中位数:</span>
                <span className="font-medium">-8.5%</span>
              </div>
              <div className="flex justify-between">
                <span>最大价差比例:</span>
                <span className="font-medium text-green-600">-42.7%</span>
              </div>
              <div className="flex justify-between">
                <span>最小价差比例:</span>
                <span className="font-medium text-red-600">+5.2%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">行业价差对比</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>IT行业平均价差 <span className="font-medium">-15.3%</span></li>
              <li>建筑行业平均价差 <span className="font-medium">-6.8%</span></li>
              <li>医疗行业平均价差 <span className="font-medium">-9.2%</span></li>
              <li>教育行业平均价差 <span className="font-medium">-11.5%</span></li>
            </ul>
          </div>
        </div>
        
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
          [此处将显示预算vs成交价对比图表]
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium mb-2">优化建议</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>IT设备类招标项目的实际成交价普遍低于预算15%以上，可考虑适当调整预算策略</li>
            <li>建筑类项目价差较小，预算控制更为准确</li>
            <li>大型项目（1000万以上）价差比例通常更大，建议针对大项目进行更精细的价格分析</li>
          </ul>
        </div>
        
        <div className="flex justify-end">
          <button className="apple-button">导出完整报告</button>
        </div>
      </div>
    );
  };

  // 获取供应商分析内容
  const getSupplierAnalysisContent = (): React.ReactNode => {
    return (
      <div>
        <p className="text-gray-600 mb-4">中标供应商分析可以帮助您了解市场竞争格局，发现行业领导者和新兴供应商的特点。</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">供应商分布</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>总供应商数量: <span className="font-medium">873</span></li>
              <li>活跃供应商数: <span className="font-medium">312</span> (中标2次以上)</li>
              <li>TOP10占市场份额: <span className="font-medium">32.5%</span></li>
              <li>新兴供应商比例: <span className="font-medium">18.7%</span> (近1年首次中标)</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">行业分布TOP5</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>信息技术: <span className="font-medium">157家</span></li>
              <li>建筑工程: <span className="font-medium">113家</span></li>
              <li>医疗设备: <span className="font-medium">89家</span></li>
              <li>教育培训: <span className="font-medium">76家</span></li>
              <li>办公设备: <span className="font-medium">64家</span></li>
            </ul>
          </div>
        </div>
        
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
          [此处将显示供应商分析图表]
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium mb-2">市场洞察</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>行业集中度呈上升趋势，大型供应商占比增加</li>
            <li>地方性供应商在本地中标率高于全国性供应商25%</li>
            <li>联合投标成功率高出单独投标12%</li>
            <li>有创新技术背景的供应商中标金额普遍高于传统供应商</li>
          </ul>
        </div>
        
        <div className="flex justify-end">
          <button className="apple-button">导出完整报告</button>
        </div>
      </div>
    );
  };

  // 在useState部分添加新的状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string, content: React.ReactNode}>({
    title: '',
    content: null
  });

  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-6">招标数据分析</h1>
        
        {/* 筛选器面板 */}
        <FilterPanel onFilterChange={handleFilterChange} currentFilters={filters} />
      </div>

      {/* 仪表盘卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* 招标趋势卡片 */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <div className="apple-card">
            <h2 className="text-2xl font-semibold mb-4">招标趋势</h2>
            {dashboardData && <TrendChart data={dashboardData.trendData} />}
            <div className="mt-4 text-sm text-gray-500">
              数据显示，{filters.timeRange === 'year' ? '年度' : '季度'}招标数量呈{dashboardData?.trendData?.bidCounts[11] > dashboardData?.trendData?.bidCounts[10] ? '上升' : '下降'}趋势
            </div>
          </div>
        )}

        {/* 地域分布卡片 */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <div className="apple-card">
            <h2 className="text-2xl font-semibold mb-4">地域分布</h2>
            {dashboardData && <RegionMap data={dashboardData.regionalData} />}
            <div className="mt-4 text-sm text-gray-500">
              数据显示，招标热度最高的地区为{dashboardData?.regionalData?.topRegions[0]?.name}、{dashboardData?.regionalData?.topRegions[1]?.name}和{dashboardData?.regionalData?.topRegions[2]?.name}
            </div>
          </div>
        )}

        {/* 行业占比卡片 */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <div className="apple-card">
            <h2 className="text-2xl font-semibold mb-4">行业占比</h2>
            {dashboardData && <IndustryChart data={dashboardData.industryData} />}
            <div className="mt-4 text-sm text-gray-500">
              {dashboardData?.industryData?.labels[0]}和{dashboardData?.industryData?.labels[1]}领域占据招标总量的主要部分
            </div>
          </div>
        )}

        {/* 预算分析卡片 */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <div className="apple-card">
            <h2 className="text-2xl font-semibold mb-4">预算与实际成交对比</h2>
            {dashboardData && <BudgetComparisonChart data={dashboardData.budgetData} />}
            <div className="mt-4 text-sm text-gray-500">
              展示各行业预算与实际成交金额的对比分析
            </div>
          </div>
        )}
      </div>

      {/* 多维分析部分 */}
      <div className="bg-white shadow-md rounded-xl p-8 mb-10">
        <h2 className="text-3xl font-semibold mb-6">多维数据分析</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stats-card">
            <h3 className="text-lg font-medium mb-2">时间维度分析</h3>
            <p className="text-gray-600 mb-4">查看年度/季度/月度趋势变化</p>
            <button className="apple-button-secondary w-full" onClick={() => handleMultiDimensionAnalysis('time')}>查看详情</button>
          </div>
          
          <div className="stats-card">
            <h3 className="text-lg font-medium mb-2">地理维度分析</h3>
            <p className="text-gray-600 mb-4">省市区域分布与热点地图</p>
            <button className="apple-button-secondary w-full" onClick={() => handleMultiDimensionAnalysis('geo')}>查看详情</button>
          </div>
          
          <div className="stats-card">
            <h3 className="text-lg font-medium mb-2">机构维度分析</h3>
            <p className="text-gray-600 mb-4">采购方和代理机构的模式分析</p>
            <button className="apple-button-secondary w-full" onClick={() => handleMultiDimensionAnalysis('org')}>查看详情</button>
          </div>
          
          <div className="stats-card">
            <h3 className="text-lg font-medium mb-2">产品维度分析</h3>
            <p className="text-gray-600 mb-4">关键词分析和项目类型分布</p>
            <button className="apple-button-secondary w-full" onClick={() => handleMultiDimensionAnalysis('product')}>查看详情</button>
          </div>
        </div>
      </div>

      {/* 高级分析部分 */}
      <div className="bg-apple-gray rounded-xl p-8 mb-10">
        <h2 className="text-3xl font-semibold mb-6">高级分析</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">预算与成交价差异分析</h3>
            <p className="text-gray-600 mb-4">
              分析预算与实际成交价的差异比例，发现潜在的价格优化空间
            </p>
            <button className="apple-button w-full" onClick={() => handleAdvancedAnalysis('budget')}>生成分析报告</button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">中标供应商分析</h3>
            <p className="text-gray-600 mb-4">
              分析中标供应商的分布和特点，发现市场竞争格局
            </p>
            <button className="apple-button w-full" onClick={() => handleAdvancedAnalysis('supplier')}>查看供应商分析</button>
          </div>
        </div>
      </div>

      {/* 模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl">
            <h2 className="text-2xl font-semibold mb-6">{modalContent.title}</h2>
            {modalContent.content}
            <div className="mt-6 flex justify-end">
              <button className="apple-button" onClick={handleCloseModal}>关闭</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .stats-card {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        .stats-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-color: #d1d5db;
        }
        .skeleton {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 0.375rem;
        }
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
} 