'use client';

import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface TimeAnalysisChartProps {
  data: {
    dayOfWeekDistribution: {
      labels: string[];
      data: number[];
    };
    hourDistribution: {
      labels: string[];
      data: number[];
    };
    processPeriods: {
      average: string;
      distribution: {
        labels: string[];
        data: number[];
      };
    };
  };
  onClick?: (type: string, index: number) => void;
}

export default function TimeAnalysisChart({ data, onClick }: TimeAnalysisChartProps) {
  // 星期几分布图表配置
  const dayOfWeekChartData = {
    labels: data.dayOfWeekDistribution.labels,
    datasets: [
      {
        label: '招标数量',
        data: data.dayOfWeekDistribution.data,
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(54, 162, 235, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const dayOfWeekOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '一周内招标发布分布',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const total = data.dayOfWeekDistribution.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `招标数量: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '招标数量'
        }
      },
      x: {
        title: {
          display: true,
          text: '星期'
        }
      }
    },
    onClick: (_: any, elements: any) => {
      if (elements.length > 0 && onClick) {
        const index = elements[0].index;
        onClick('dayOfWeek', index);
      }
    }
  };

  // 招标周期分布的饼图配置
  const processPeriodsChartData = {
    labels: data.processPeriods.distribution.labels,
    datasets: [
      {
        data: data.processPeriods.distribution.data,
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

  const processPeriodsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: '招标周期分布',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const total = data.processPeriods.distribution.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    onClick: (_: any, elements: any) => {
      if (elements.length > 0 && onClick) {
        const index = elements[0].index;
        onClick('processPeriod', index);
      }
    }
  };

  // 小时分布图表配置（仅显示工作时间）
  const workHoursData = {
    labels: data.hourDistribution.labels.slice(7, 19), // 仅选择7点到18点
    datasets: [
      {
        label: '招标数量',
        data: data.hourDistribution.data.slice(7, 19),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const workHoursOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '工作时段招标发布分布',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const total = data.hourDistribution.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `招标数量: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '招标数量'
        }
      },
      x: {
        title: {
          display: true,
          text: '时段'
        }
      }
    },
    onClick: (_: any, elements: any) => {
      if (elements.length > 0 && onClick) {
        const index = elements[0].index + 7; // 调整为实际的小时索引
        onClick('hour', index);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="h-72">
        <Bar data={dayOfWeekChartData} options={dayOfWeekOptions} />
      </div>
      <div className="h-72">
        <Pie data={processPeriodsChartData} options={processPeriodsOptions} />
      </div>
      <div className="h-72 lg:col-span-2">
        <Bar data={workHoursData} options={workHoursOptions} />
      </div>
      <div className="lg:col-span-2 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">招标流程周期分析</h3>
        <p className="text-gray-700">平均招标周期: <span className="font-semibold text-blue-600">{data.processPeriods.average} 天</span></p>
        <p className="text-sm text-gray-600 mt-2">从发布到开标的平均时间间隔，可帮助企业了解行业招标流程时长，合理安排投标准备时间。</p>
      </div>
    </div>
  );
} 