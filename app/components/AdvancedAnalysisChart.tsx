'use client';

import React, { useState, useRef, useEffect } from 'react';
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
// 导入Chart类型
import { Chart } from 'chart.js';

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
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  
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

    useEffect(() => {
      if (!chartRef.current) return;
      
      // 清除旧图表
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      
      // 创建新图表
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstanceRef.current = new ChartJS(ctx, {
          type: 'bar',
          data: budgetDiffData,
          options: budgetDiffOptions
        });
      }
      
      return () => {
        // 组件卸载时清除图表
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
      };
    }, [data, budgetDiffData, budgetDiffOptions]);

    return (
      <div className="h-96">
        <canvas ref={chartRef} height="350"></canvas>
      </div>
    );
  };

  // 供应商分析图表
  const renderSupplierAnalysis = () => {
    // 市场份额与行业分布分析
    const isMarketShare = selectedView === 'default' || selectedView === 'marketShare';
    
    const supplierData = {
      labels: isMarketShare ? data.suppliers : data.industries,
      datasets: [
        {
          label: isMarketShare ? '中标项目数量' : '行业项目数量',
          data: isMarketShare ? data.projectCounts : data.industryCounts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)',
            'rgba(40, 159, 64, 0.7)',
            'rgba(210, 199, 199, 0.7)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 206, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
            'rgb(255, 159, 64)',
            'rgb(159, 159, 159)',
            'rgb(83, 102, 255)',
            'rgb(40, 159, 64)',
            'rgb(210, 159, 199)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const supplierOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
        },
        title: {
          display: true,
          text: isMarketShare ? '供应商市场份额分析' : '行业分布分析',
          font: {
            size: 16,
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      onClick: (_event: any, elements: any[]) => {
        if (elements.length > 0 && onClick) {
          const index = elements[0].index;
          onClick(isMarketShare ? 'supplier' : 'industry', isMarketShare ? data.suppliers[index] : data.industries[index]);
        }
      }
    };

    return (
      <div className="h-96 flex flex-col">
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 rounded-l-lg ${selectedView === 'default' || selectedView === 'marketShare' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedView('marketShare')}
          >
            供应商市场份额
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg ${selectedView === 'industryDistribution' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedView('industryDistribution')}
          >
            行业分布
          </button>
        </div>
        <div className="flex-grow">
          <Doughnut data={supplierData} options={supplierOptions} />
        </div>
      </div>
    );
  };

  // 趋势分析图表
  const renderTrendAnalysis = () => {
    const trendData = {
      labels: data.months,
      datasets: [
        {
          label: '项目数量',
          data: data.projectCounts,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          yAxisID: 'y',
          tension: 0.3,
        },
        {
          label: '平均预算 (万元)',
          data: data.avgBudgets,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y1',
          tension: 0.3,
        }
      ]
    };

    const trendOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '项目趋势分析',
          font: {
            size: 16,
          }
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
        }
      },
      scales: {
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: '项目数量'
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
            text: '平均预算 (万元)'
          }
        }
      },
      onClick: (_event: any, elements: any[]) => {
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
    const correlationData = {
      datasets: [
        {
          label: '预算与参与竞标供应商数量关系',
          data: data.correlationData.map((item: any) => ({
            x: item.budget,
            y: item.bidderCount,
            r: Math.log(item.projectCount + 1) * 5, // 气泡大小基于项目数量
          })),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
        }
      ]
    };

    const correlationOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '预算与竞标供应商数量相关性分析',
          font: {
            size: 16,
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              return [
                `预算: ${context.raw.x}万元`,
                `平均竞标供应商数: ${context.raw.y}`,
                `项目数量: ${Math.round(Math.exp(context.raw.r / 5) - 1)}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: '项目预算 (万元)'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '平均竞标供应商数量'
          }
        }
      }
    };

    return (
      <div className="h-96">
        <Scatter data={correlationData} options={correlationOptions} />
      </div>
    );
  };

  // 根据分析类型渲染对应图表
  switch (type) {
    case 'budget':
      return renderBudgetAnalysis();
    case 'supplier':
      return renderSupplierAnalysis();
    case 'trend':
      return renderTrendAnalysis();
    case 'correlation':
      return renderCorrelationAnalysis();
    default:
      return <div>无效的分析类型</div>;
  }
} 