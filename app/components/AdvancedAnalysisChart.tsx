'use client';

import React, { useState } from 'react';
import { Bar, Doughnut, Line, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// 注册ChartJS组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AdvancedAnalysisChartProps {
  data: any;
  type: 'budget' | 'supplier' | 'trend' | 'correlation';
  onClick?: (category: string, value: any) => void;
}

export default function AdvancedAnalysisChart({ data, type, onClick }: AdvancedAnalysisChartProps) {
  const [selectedView, setSelectedView] = useState<string>('default');
  
  // 预算分析图表
  const renderBudgetAnalysis = () => {
    // 预算和实际成交金额差异分析
    const budgetDiffData = {
      labels: data.categories,
      datasets: [
        {
          type: 'bar' as const,
          label: '差异百分比',
          backgroundColor: data.diffPercentages.map((diff: number) => 
            diff < 0 ? 'rgba(54, 162, 235, 0.7)' : 'rgba(255, 99, 132, 0.7)'
          ),
          data: data.diffPercentages,
          yAxisID: 'y1',
        },
        {
          type: 'line' as const,
          label: '预算金额',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 2,
          fill: false,
          data: data.budgetValues,
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: '实际金额',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
          fill: false,
          data: data.actualValues,
          yAxisID: 'y',
        }
      ]
    };

    const budgetDiffOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '预算与实际金额差异分析',
          font: {
            size: 16,
          }
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            label: function(context: any) {
              const datasetIndex = context.datasetIndex;
              const value = context.parsed.y;
              
              if (datasetIndex === 0) {
                return `差异百分比: ${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
              } else if (datasetIndex === 1) {
                return `预算金额: ${value.toFixed(1)}万元`;
              } else {
                return `实际金额: ${value.toFixed(1)}万元`;
              }
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: '金额 (万元)'
          }
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: '差异百分比 (%)'
          },
          ticks: {
            callback: function(value: any) {
              return `${value}%`;
            }
          }
        }
      },
      onClick: (_: any, elements: any) => {
        if (elements.length > 0 && onClick) {
          const index = elements[0].index;
          onClick('category', data.categories[index]);
        }
      }
    };

    return (
      <div className="h-96">
        <Bar data={budgetDiffData} options={budgetDiffOptions} />
      </div>
    );
  };

  // 供应商分析图表
  const renderSupplierAnalysis = () => {
    if (selectedView === 'marketShare') {
      // 市场份额图表
      const marketShareData = {
        labels: data.topSuppliers.map((s: any) => s.name),
        datasets: [
          {
            label: '中标数量',
            data: data.topSuppliers.map((s: any) => s.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(201, 203, 207, 0.7)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 159, 64, 0.5)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(201, 203, 207, 1)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 159, 64, 0.8)',
            ],
            borderWidth: 1,
          },
        ],
      };

      const marketShareOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right' as const,
          },
          title: {
            display: true,
            text: 'Top 10供应商市场份额',
            font: {
              size: 16,
            }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const value = context.parsed;
                const total = data.topSuppliers.reduce((sum: number, s: any) => sum + s.count, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        onClick: (_: any, elements: any) => {
          if (elements.length > 0 && onClick) {
            const index = elements[0].index;
            onClick('supplier', data.topSuppliers[index].name);
          }
        }
      };

      return (
        <div className="h-96">
          <Doughnut data={marketShareData} options={marketShareOptions} />
        </div>
      );

    } else {
      // 供应商行业分布分析
      const industryDistData = {
        labels: data.industryDistribution.map((i: any) => i.industry),
        datasets: [
          {
            label: '供应商数量',
            data: data.industryDistribution.map((i: any) => i.supplierCount),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: '项目数量',
            data: data.industryDistribution.map((i: any) => i.projectCount),
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          }
        ],
      };

      const industryDistOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '各行业供应商分布',
            font: {
              size: 16,
            }
          },
          tooltip: {
            mode: 'index' as const,
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '数量'
            }
          },
          x: {
            title: {
              display: true,
              text: '行业'
            }
          }
        },
        onClick: (_: any, elements: any) => {
          if (elements.length > 0 && onClick) {
            const index = elements[0].index;
            onClick('industry', data.industryDistribution[index].industry);
          }
        }
      };

      return (
        <div className="h-96">
          <Bar data={industryDistData} options={industryDistOptions} />
        </div>
      );
    }
  };

  // 时间趋势分析图表
  const renderTrendAnalysis = () => {
    const trendData = {
      labels: data.months,
      datasets: [
        {
          label: '招标数量',
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          fill: false,
          data: data.projectCounts,
          yAxisID: 'y',
        },
        {
          label: '平均预算金额',
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          fill: false,
          data: data.avgBudgets,
          yAxisID: 'y1',
        }
      ]
    };

    const trendOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '招标趋势分析',
          font: {
            size: 16,
          }
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
        },
      },
      scales: {
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: '招标数量'
          }
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: '平均预算金额 (万元)'
          }
        }
      },
      onClick: (_: any, elements: any) => {
        if (elements.length > 0 && onClick) {
          const index = elements[0].index;
          onClick('month', data.months[index]);
        }
      }
    };

    return (
      <div className="h-96">
        <Line data={trendData} options={trendOptions} />
      </div>
    );
  };

  // 相关性分析图表
  const renderCorrelationAnalysis = () => {
    // 生成散点图数据
    const scatterData = {
      datasets: [
        {
          label: '项目预算与投标数量关系',
          data: data.correlationData.map((item: any) => ({
            x: item.budget,
            y: item.bidderCount
          })),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          pointRadius: 5,
          pointHoverRadius: 7,
        }
      ]
    };

    const scatterOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '预算与投标数量相关性分析',
          font: {
            size: 16,
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const x = context.parsed.x;
              const y = context.parsed.y;
              return `预算: ${x}万元, 投标数量: ${y}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '投标数量'
          }
        },
        x: {
          title: {
            display: true,
            text: '项目预算 (万元)'
          },
          ticks: {
            callback: function(value: any) {
              return `${value}万`;
            }
          }
        }
      },
      onClick: (_: any, elements: any) => {
        if (elements.length > 0 && onClick) {
          const index = elements[0].index;
          onClick('project', data.correlationData[index].id);
        }
      }
    };

    return (
      <div className="h-96">
        <Scatter data={scatterData} options={scatterOptions} />
      </div>
    );
  };

  return (
    <div>
      {type === 'supplier' && (
        <div className="mb-4">
          <div className="flex space-x-2 mb-4">
            <button 
              className={`px-4 py-2 rounded-md ${selectedView === 'default' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedView('default')}
            >
              行业分布
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${selectedView === 'marketShare' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedView('marketShare')}
            >
              市场份额
            </button>
          </div>
        </div>
      )}

      {type === 'budget' && renderBudgetAnalysis()}
      {type === 'supplier' && renderSupplierAnalysis()}
      {type === 'trend' && renderTrendAnalysis()}
      {type === 'correlation' && renderCorrelationAnalysis()}

      {/* 数据洞察卡片 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">数据洞察</h3>
        <ul className="list-disc pl-5 space-y-1">
          {data.insights && data.insights.map((insight: string, index: number) => (
            <li key={index} className="text-gray-700">{insight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
} 