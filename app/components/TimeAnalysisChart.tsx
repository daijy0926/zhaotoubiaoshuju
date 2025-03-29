'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// 定义属性类型
export interface TimeAnalysisChartProps {
  data: {
    dayOfWeekDistribution?: {
      labels: string[];
      data: number[];
    };
    hourDistribution?: {
      labels: string[];
      data: number[];
    };
    processPeriods?: {
      average: string;
      distribution: {
        labels: string[];
        data: number[];
      };
    };
  };
  onClick?: (type: string, value: string | number) => void;
}

const TimeAnalysisChart: React.FC<TimeAnalysisChartProps> = ({ data, onClick }) => {
  // 确保数据存在
  if (!data) return <div>加载中...</div>;
  
  const [activeTab, setActiveTab] = useState<'weekday' | 'hour' | 'period'>('weekday');
  
  // 准备图表数据
  const getChartData = () => {
    switch(activeTab) {
      case 'weekday':
        return {
          labels: data.dayOfWeekDistribution?.labels || ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
          datasets: [
            {
              label: '项目数量',
              data: data.dayOfWeekDistribution?.data || [0, 0, 0, 0, 0, 0, 0],
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              borderColor: 'rgb(53, 162, 235)',
              borderWidth: 1,
            },
          ],
        };
      case 'hour':
        return {
          labels: data.hourDistribution?.labels || Array.from({length: 24}, (_, i) => `${i}时`),
          datasets: [
            {
              label: '项目数量',
              data: data.hourDistribution?.data || Array(24).fill(0),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 1,
            },
          ],
        };
      case 'period':
        return {
          labels: data.processPeriods?.distribution.labels || ['7天内', '8-14天', '15-30天', '31-60天', '60天以上'],
          datasets: [
            {
              label: '项目数量',
              data: data.processPeriods?.distribution.data || [0, 0, 0, 0, 0],
              backgroundColor: 'rgba(153, 102, 255, 0.5)',
              borderColor: 'rgb(153, 102, 255)',
              borderWidth: 1,
            },
          ],
        };
      default:
        return {
          labels: [],
          datasets: [],
        };
    }
  };
  
  // 图表配置
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        display: false,
      },
      title: {
        display: true,
        text: activeTab === 'weekday' 
          ? '项目按星期分布' 
          : activeTab === 'hour' 
            ? '项目按小时分布' 
            : '招标流程周期分布',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0 && onClick) {
        const { index } = elements[0];
        const chartData = getChartData();
        const value = chartData.labels[index];
        onClick(activeTab, value);
      }
    },
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-center space-x-4 mb-4">
        <button
          className={`px-3 py-1 text-sm rounded-full ${
            activeTab === 'weekday' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('weekday')}
        >
          星期分布
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-full ${
            activeTab === 'hour' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('hour')}
        >
          时段分布
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-full ${
            activeTab === 'period' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('period')}
        >
          周期分布
        </button>
      </div>
      
      <div className="flex-1">
        <Bar options={options} data={getChartData()} />
      </div>
      
      {activeTab === 'period' && data.processPeriods && (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">
            平均招标周期: <span className="font-bold text-blue-600">{data.processPeriods.average} 天</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeAnalysisChart; 