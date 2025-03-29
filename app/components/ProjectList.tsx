'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Project {
  id: string;
  title: string;
  area: string;
  city?: string;
  buyer: string;
  industry?: string;
  publishTime: number;
  publishDate: string;
  budget?: number;
  bidAmount?: number;
  winner?: string;
  bidOpenTime?: number;
  bidEndTime?: number;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ProjectListProps {
  userId: string;
  filters?: {
    timeRange?: string;
    area?: string;
    industry?: string;
    startDate?: string | null;
    endDate?: string | null;
  };
}

export default function ProjectList({ userId, filters = {} }: ProjectListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'publishTime', direction: 'desc' });

  // 获取项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // 构建查询参数
        const queryParams = new URLSearchParams();
        
        // 添加分页参数
        queryParams.append('page', currentPage.toString());
        queryParams.append('pageSize', pagination.pageSize.toString());
        
        // 添加搜索参数
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }
        
        // 添加筛选参数
        if (filters.timeRange) {
          queryParams.append('timeRange', filters.timeRange);
        }
        
        if (filters.area && filters.area !== 'all') {
          queryParams.append('area', filters.area);
        }
        
        if (filters.industry && filters.industry !== 'all') {
          queryParams.append('industry', filters.industry);
        }
        
        if (filters.startDate) {
          queryParams.append('startDate', filters.startDate);
        }
        
        if (filters.endDate) {
          queryParams.append('endDate', filters.endDate);
        }
        
        const response = await fetch(`/api/dashboard/projects?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data.projects || []);
        setPagination(data.pagination || {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        });
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [userId, currentPage, searchTerm, filters]);
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // 重置到第一页
  };
  
  // 处理排序
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    });
  };
  
  // 本地排序
  const sortedProjects = [...projects].sort((a, b) => {
    const key = sortConfig.key as keyof Project;
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });
  
  // 处理项目选择
  const handleSelectProject = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };
  
  // 处理全选/取消全选
  const handleSelectAll = () => {
    if (selectedIds.size === projects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(projects.map(p => p.id)));
    }
  };
  
  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 处理查看详情
  const handleViewDetails = (id: string) => {
    router.push(`/projects/${id}`);
  };

  // 格式化金额
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // 格式化日期
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '—';
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN');
  };
  
  // 生成分页器
  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // 首页按钮
    pages.push(
      <button 
        key="first" 
        onClick={() => handlePageChange(1)} 
        disabled={currentPage === 1}
        className={`px-2 py-1 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
      >
        首页
      </button>
    );
    
    // 上一页按钮
    pages.push(
      <button 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={!pagination.hasPrev}
        className={`px-2 py-1 rounded ${!pagination.hasPrev ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
      >
        &lt;
      </button>
    );
    
    // 页码按钮
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => handlePageChange(i)} 
          className={`px-3 py-1 rounded ${currentPage === i ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}
        >
          {i}
        </button>
      );
    }
    
    // 下一页按钮
    pages.push(
      <button 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)} 
        disabled={!pagination.hasNext}
        className={`px-2 py-1 rounded ${!pagination.hasNext ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
      >
        &gt;
      </button>
    );
    
    // 末页按钮
    pages.push(
      <button 
        key="last" 
        onClick={() => handlePageChange(pagination.totalPages)} 
        disabled={currentPage === pagination.totalPages || pagination.totalPages === 0}
        className={`px-2 py-1 rounded ${currentPage === pagination.totalPages || pagination.totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
      >
        末页
      </button>
    );
    
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          共 <span className="font-medium">{pagination.total}</span> 条数据，
          当前第 <span className="font-medium">{currentPage}</span>/{pagination.totalPages} 页
        </div>
        <div className="flex space-x-1">
          {pages}
        </div>
      </div>
    );
  };
  
  // 渲染表格
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">项目列表</h2>
        <div className="flex space-x-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索项目、采购方、中标方..."
              className="border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              搜索
            </button>
          </form>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => {/* 导出功能 */}}
            disabled={selectedIds.size === 0}
          >
            导出选中
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
          <span className="ml-2">加载中...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>未找到符合条件的项目</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === projects.length && projects.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    项目名称
                    {sortConfig.key === 'title' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('publishTime')}
                  >
                    发布日期
                    {sortConfig.key === 'publishTime' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('area')}
                  >
                    地区
                    {sortConfig.key === 'area' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('buyer')}
                  >
                    采购方
                    {sortConfig.key === 'buyer' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('budget')}
                  >
                    预算金额
                    {sortConfig.key === 'budget' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('bidAmount')}
                  >
                    中标金额
                    {sortConfig.key === 'bidAmount' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('winner')}
                  >
                    中标方
                    {sortConfig.key === 'winner' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(project.id)}
                        onChange={() => handleSelectProject(project.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-md truncate" title={project.title}>
                        {project.title}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{project.publishDate}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{project.area}{project.city ? ` - ${project.city}` : ''}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate" title={project.buyer}>
                        {project.buyer}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatCurrency(project.budget)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatCurrency(project.bidAmount)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate" title={project.winner}>
                        {project.winner || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(project.id)}
                        className="text-blue-600 hover:text-blue-900 ml-2"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {renderPagination()}
        </>
      )}
    </div>
  );
} 