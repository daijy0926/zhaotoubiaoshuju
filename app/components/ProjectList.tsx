'use client';

import { useState, useEffect } from 'react';
import { exportToCSV, formatDate, formatMoney } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  publishTime: number;
  area: string;
  industry: string;
  budget: number;
  bidAmount: number;
  winningBidder: string;
  publisherName: string;
  projectType: string;
  tenderMethod: string;
  projectStatus: string;
  projectDetails: string;
}

interface ProjectListProps {
  userId: string;
  filters: {
    timeRange: string;
    area: string;
    industry: string;
    startDate: string | null;
    endDate: string | null;
  };
}

export default function ProjectList({ userId, filters }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [sortBy, setSortBy] = useState('publishTime');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // 加载项目数据
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        
        // 添加所有筛选条件
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null) {
            queryParams.append(key, String(value));
          }
        });
        
        // 添加分页和排序参数
        queryParams.append('page', String(pagination.page));
        queryParams.append('pageSize', String(pagination.pageSize));
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortOrder', sortOrder);
        
        // 添加用户ID
        queryParams.append('userId', userId);
        
        const response = await fetch(`/api/dashboard/projects?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data.projects);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      } catch (error) {
        console.error('Error fetching projects:', error);
        // 设置空数据
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjects();
  }, [userId, filters, pagination.page, pagination.pageSize, sortBy, sortOrder]);
  
  // 处理排序
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // 如果已经按这列排序，则切换排序顺序
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 否则，按新列排序，默认降序
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  // 获取排序指示器
  const getSortIndicator = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };
  
  // 处理分页
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // 导出数据为CSV
  const handleExport = () => {
    if (projects.length === 0) return;
    
    // 准备导出数据
    const headers = [
      '项目标题', '发布时间', '地区', '行业', '预算(元)', 
      '中标金额(元)', '中标供应商', '发布单位', '项目类型', '招标方式', '项目状态'
    ];
    
    const data = projects.map(project => [
      project.title,
      formatDate(project.publishTime * 1000),
      project.area,
      project.industry,
      formatMoney(project.budget),
      formatMoney(project.bidAmount),
      project.winningBidder || '-',
      project.publisherName || '-',
      project.projectType || '-',
      project.tenderMethod || '-',
      project.projectStatus || '-'
    ]);
    
    exportToCSV([headers, ...data], `招投标项目数据_${new Date().toISOString().split('T')[0]}`);
  };
  
  // 导出全部数据
  const handleExportAll = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      // 添加所有筛选条件
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      // 导出全部数据，不分页
      queryParams.append('page', '1');
      queryParams.append('pageSize', '10000');
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);
      queryParams.append('userId', userId);
      
      const response = await fetch(`/api/dashboard/projects?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch all projects');
      }
      
      const data = await response.json();
      
      // 准备导出数据
      const headers = [
        '项目标题', '发布时间', '地区', '行业', '预算(元)', 
        '中标金额(元)', '中标供应商', '发布单位', '项目类型', '招标方式', '项目状态'
      ];
      
      const exportData = data.projects.map((project: Project) => [
        project.title,
        formatDate(project.publishTime * 1000),
        project.area,
        project.industry,
        formatMoney(project.budget),
        formatMoney(project.bidAmount),
        project.winningBidder || '-',
        project.publisherName || '-',
        project.projectType || '-',
        project.tenderMethod || '-',
        project.projectStatus || '-'
      ]);
      
      exportToCSV([headers, ...exportData], `招投标项目完整数据_${new Date().toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Error exporting all projects:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-medium">项目列表</h3>
        <div className="flex gap-2">
          <button 
            onClick={handleExport} 
            disabled={loading || projects.length === 0}
            className="apple-button-sm"
          >
            导出当前页
          </button>
          <button 
            onClick={handleExportAll} 
            disabled={loading}
            className="apple-button-sm"
          >
            导出全部数据
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          没有找到匹配的项目
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    项目标题 {getSortIndicator('title')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('publishTime')}
                  >
                    发布时间 {getSortIndicator('publishTime')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('area')}
                  >
                    地区 {getSortIndicator('area')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('industry')}
                  >
                    行业 {getSortIndicator('industry')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('budget')}
                  >
                    预算 {getSortIndicator('budget')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('bidAmount')}
                  >
                    中标金额 {getSortIndicator('bidAmount')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    详情
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(project.publishTime * 1000)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.industry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.budget ? formatMoney(project.budget) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.bidAmount ? formatMoney(project.bidAmount) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 分页控件 */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                上一页
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示第 <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span> 到第{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                  </span>{' '}
                  条，共 <span className="font-medium">{pagination.total}</span> 条结果
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">上一页</span>
                    &larr;
                  </button>
                  
                  {/* 页码按钮 */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    // 显示当前页码附近的页码
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      // 如果总页数少于5，显示所有页码
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      // 如果当前页在前3页，显示前5页
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      // 如果当前页在后3页，显示后5页
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      // 否则显示当前页及其前后各2页
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          pagination.page === pageNum
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">下一页</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 