'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
  currentFilters: any;
}

export default function FilterPanel({ onFilterChange, currentFilters }: FilterPanelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [industries, setIndustries] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState({
    min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    max: new Date()
  });
  
  const [selectedIndustry, setSelectedIndustry] = useState(currentFilters.industry || 'all');
  const [selectedArea, setSelectedArea] = useState(currentFilters.area || 'all');
  const [selectedTimeRange, setSelectedTimeRange] = useState(currentFilters.timeRange || 'year');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: currentFilters.startDate || null,
    endDate: currentFilters.endDate || null
  });

  // 加载筛选选项
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/dashboard/filters');
        if (!response.ok) {
          throw new Error('Failed to fetch filter options');
        }
        
        const data = await response.json();
        setIndustries(data.industries || []);
        setAreas(data.areas || []);
        
        if (data.timeRange) {
          setTimeRange({
            min: new Date(data.timeRange.min),
            max: new Date(data.timeRange.max)
          });
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
        toast.error('加载筛选选项失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // 处理筛选条件变化
  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedIndustry(value);
    onFilterChange({ industry: value });
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedArea(value);
    onFilterChange({ area: value });
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTimeRange(value);
    
    if (value !== 'custom') {
      setCustomDateRange({
        startDate: null,
        endDate: null
      });
      onFilterChange({ 
        timeRange: value,
        startDate: null,
        endDate: null
      });
    } else {
      onFilterChange({ timeRange: value });
    }
  };

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setCustomDateRange({
      startDate: start,
      endDate: end
    });
    
    if (start && end) {
      onFilterChange({ 
        startDate: start,
        endDate: end
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">数据筛选</h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 flex items-center text-sm font-medium"
        >
          {isExpanded ? '收起' : '展开'} 
          <svg className={`ml-1 h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isExpanded ? '' : 'hidden md:grid'}`}>
        {/* 时间范围筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            时间范围
          </label>
          <select
            value={selectedTimeRange}
            onChange={handleTimeRangeChange}
            className="apple-select"
            disabled={isLoading}
          >
            <option value="year">近一年</option>
            <option value="quarter">近一季度</option>
            <option value="month">近一个月</option>
            <option value="custom">自定义日期范围</option>
          </select>

          {selectedTimeRange === 'custom' && (
            <div className="mt-4">
              <DatePicker
                selectsRange={true}
                startDate={customDateRange.startDate}
                endDate={customDateRange.endDate}
                onChange={handleDateRangeChange}
                className="apple-input"
                placeholderText="选择日期范围"
                dateFormat="yyyy/MM/dd"
                minDate={timeRange.min}
                maxDate={timeRange.max}
              />
            </div>
          )}
        </div>

        {/* 地区筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            地区
          </label>
          <select
            value={selectedArea}
            onChange={handleAreaChange}
            className="apple-select"
            disabled={isLoading}
          >
            <option value="all">全部地区</option>
            {areas.map((area, index) => (
              <option key={index} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* 行业筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            行业
          </label>
          <select
            value={selectedIndustry}
            onChange={handleIndustryChange}
            className="apple-select"
            disabled={isLoading}
          >
            <option value="all">全部行业</option>
            {industries.map((industry, index) => (
              <option key={index} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
} 