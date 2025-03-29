'use client';

import React, { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

interface KeywordAnalysisPanelProps {
  data: {
    topKeywords: {
      labels: string[];
      data: number[];
    };
    industryKeywords: {
      labels: string[];
      data: number[];
    };
    totalProjects: number;
  };
}

export default function KeywordAnalysisPanel({ data }: KeywordAnalysisPanelProps) {
  const [view, setView] = useState<'cloud' | 'bar'>('bar');
  
  // 关键词柱状图配置
  const keywordBarData = {
    labels: data.topKeywords.labels,
    datasets: [
      {
        label: '出现次数',
        data: data.topKeywords.data,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const keywordBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: '高频关键词分析',
        font: {
          size: 16,
        }
      },
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '出现次数'
        }
      },
      x: {
        title: {
          display: true,
          text: '关键词'
        }
      }
    },
  };
  
  // 行业分布饼图配置
  const industryPieData = {
    labels: data.industryKeywords.labels,
    datasets: [
      {
        label: '项目数量',
        data: data.industryKeywords.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const industryPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: '行业关键词分布',
        font: {
          size: 16,
        }
      },
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce(
              (a: number, b: number) => a + b, 0
            );
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };
  
  // 词云渲染（简化版）
  const renderWordCloud = () => {
    if (!data.topKeywords.labels.length) return <div>暂无关键词数据</div>;
    
    return (
      <div className="word-cloud p-4 flex flex-wrap justify-center">
        {data.topKeywords.labels.map((keyword, index) => {
          // 计算字体大小，基于出现频率
          const fontSize = Math.max(16, Math.min(36, 16 + (data.topKeywords.data[index] / Math.max(...data.topKeywords.data)) * 20));
          
          // 随机颜色
          const colors = [
            'text-blue-600', 'text-red-600', 'text-green-600', 
            'text-purple-600', 'text-yellow-600', 'text-pink-600'
          ];
          const colorClass = colors[index % colors.length];
          
          return (
            <div 
              key={keyword} 
              className={`m-2 p-2 ${colorClass} hover:bg-gray-100 rounded cursor-pointer transition-all`}
              style={{ fontSize: `${fontSize}px` }}
              title={`${keyword}: 出现${data.topKeywords.data[index]}次`}
            >
              {keyword}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div>
      {/* 统计摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="power-bi-stat-card">
          <span className="text-3xl font-bold text-blue-600">
            {data.totalProjects}
          </span>
          <span className="text-sm text-gray-500">项目总数</span>
        </div>
        <div className="power-bi-stat-card">
          <span className="text-3xl font-bold text-green-600">
            {data.topKeywords.labels.length}
          </span>
          <span className="text-sm text-gray-500">提取关键词数</span>
        </div>
        <div className="power-bi-stat-card">
          <span className="text-3xl font-bold text-purple-600">
            {data.industryKeywords.labels.length}
          </span>
          <span className="text-sm text-gray-500">识别行业数</span>
        </div>
      </div>
      
      {/* 视图切换 */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => setView('bar')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              view === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            柱状图
          </button>
          <button
            onClick={() => setView('cloud')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              view === 'cloud'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            词云图
          </button>
        </div>
      </div>
      
      {/* 数据可视化 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-96">
          {view === 'bar' ? (
            <Bar data={keywordBarData} options={keywordBarOptions} />
          ) : (
            renderWordCloud()
          )}
        </div>
        <div className="h-96">
          <Doughnut data={industryPieData} options={industryPieOptions} />
        </div>
      </div>
      
      {/* 分析洞察 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">关键词分析洞察</h3>
        <ul className="list-disc pl-5 space-y-1">
          {data.topKeywords.labels.length > 0 ? (
            <>
              <li>
                高频关键词 "{data.topKeywords.labels[0]}" 在所有项目中出现 {data.topKeywords.data[0]} 次，表明该领域需求较多。
              </li>
              {data.industryKeywords.labels.length > 0 && (
                <li>
                  行业分析显示 "{data.industryKeywords.labels[0]}" 行业招标项目占比最高，可重点关注。
                </li>
              )}
              {data.topKeywords.labels.length > 2 && (
                <li>
                  "{data.topKeywords.labels[0]}"、"{data.topKeywords.labels[1]}" 和 "{data.topKeywords.labels[2]}" 是出现频率最高的三个关键词。
                </li>
              )}
            </>
          ) : (
            <li>暂无足够数据进行关键词分析。</li>
          )}
        </ul>
      </div>
    </div>
  );
} 