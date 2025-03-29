'use client';

import React, { useState, useEffect } from 'react';

interface DataItem {
  id: string;
  [key: string]: any;
}

interface JsonDataViewerProps {
  data: DataItem[];
  onClose: () => void;
  onConfirmUpload: (mergedData: DataItem[]) => void;
}

const JsonDataViewer: React.FC<JsonDataViewerProps> = ({ data, onClose, onConfirmUpload }) => {
  const [mergedData, setMergedData] = useState<DataItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // 初始化：合并具有相同ID的数据
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const idMap = new Map<string, DataItem>();
    
    // 第一次遍历：收集所有ID及其对应的数据
    data.forEach(item => {
      if (!item.id) return;
      
      if (idMap.has(item.id)) {
        // 合并相同ID的数据，非空字段优先保留
        const existingItem = idMap.get(item.id)!;
        Object.keys(item).forEach(key => {
          if (key === 'id') return;
          
          // 如果当前项不为空且现有项为空，或者两者都有值但当前项更完整，则使用当前项
          if ((item[key] && !existingItem[key]) || 
              (item[key] && existingItem[key] && 
               String(item[key]).length > String(existingItem[key]).length)) {
            existingItem[key] = item[key];
          }
        });
      } else {
        // 第一次遇到此ID，直接存储
        idMap.set(item.id, { ...item });
      }
    });
    
    // 转换回数组
    const result = Array.from(idMap.values());
    setMergedData(result);
    
    // 默认选中所有项
    setSelectedIds(new Set(result.map(item => item.id)));
  }, [data]);
  
  // 切换选择状态
  const toggleSelection = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };
  
  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      // 如果当前页已全选，则取消全选
      setSelectedIds(new Set());
    } else {
      // 否则全选当前页
      const newSelectedIds = new Set(selectedIds);
      filteredData.forEach(item => newSelectedIds.add(item.id));
      setSelectedIds(newSelectedIds);
    }
  };
  
  // 处理排序
  const handleSort = (field: string) => {
    if (sortField === field) {
      // 如果点击的是当前排序字段，则反转排序方向
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // 否则，更改排序字段并设置为升序
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // 处理确认上传
  const handleConfirmUpload = () => {
    const selectedData = mergedData.filter(item => selectedIds.has(item.id));
    onConfirmUpload(selectedData);
  };
  
  // 过滤和排序数据
  const filteredData = mergedData
    .filter(item => {
      if (!searchTerm) return true;
      
      // 在所有字段中搜索
      return Object.values(item).some(value => 
        value && String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? (aValue > bValue ? 1 : -1)
        : (aValue > bValue ? -1 : 1);
    });
  
  // 分页处理
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  
  // 获取数据中所有可能的字段
  const allFields = mergedData.length > 0 
    ? Array.from(new Set(mergedData.flatMap(item => Object.keys(item))))
    : [];
  
  // 常用字段放在前面
  const priorityFields = ['id', 'title', 'area', 'buyer', 'publishTime', 'budget', 'bidAmount', 'winner'];
  const sortedFields = [
    ...priorityFields.filter(field => allFields.includes(field)),
    ...allFields.filter(field => !priorityFields.includes(field))
  ];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">解析数据预览（已合并相同ID）</h2>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 text-sm">
              总计 {mergedData.length} 条记录，已选择 {selectedIds.size} 条
            </span>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <input
                type="text"
                placeholder="搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">每页显示:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // 重置为第一页
                }}
                className="px-2 py-1 border rounded"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <button
              onClick={handleConfirmUpload}
              disabled={selectedIds.size === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedIds.size === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              确认上传已选 ({selectedIds.size})
            </button>
          </div>
        </div>
        
        <div className="overflow-auto flex-1">
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && paginatedData.every(item => selectedIds.has(item.id))}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span>选择</span>
                  </div>
                </th>
                {sortedFields.map((field) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <span>{field}</span>
                      {sortField === field && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr 
                    key={item.id || index} 
                    className={`hover:bg-gray-50 ${selectedIds.has(item.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-2 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </td>
                    {sortedFields.map((field) => (
                      <td key={field} className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-[300px]" title={String(item[field] || '')}>
                          {item[field] !== undefined && item[field] !== null
                            ? typeof item[field] === 'object'
                              ? JSON.stringify(item[field])
                              : String(item[field])
                            : ''}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={sortedFields.length + 1} className="px-3 py-8 text-center text-gray-500">
                    {searchTerm ? '没有找到匹配的记录' : '没有数据'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                显示 {startIndex + 1} 至 {Math.min(startIndex + itemsPerPage, filteredData.length)} 条，共 {filteredData.length} 条
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  首页
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  上一页
                </button>
                <div className="px-3 py-1">
                  <span className="font-medium">{currentPage}</span> / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  下一页
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  末页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonDataViewer; 