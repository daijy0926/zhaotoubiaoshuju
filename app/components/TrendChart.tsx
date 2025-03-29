'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface TrendChartProps {
  data: {
    labels: string[];
    bidCounts: number[];
    bidAmounts: number[];
  };
}

export default function TrendChart({ data }: TrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 初始化或调整图表大小
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // 销毁图表实例以避免内存泄漏
      chartInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    // 确保DOM已经渲染，并且有数据
    if (chartRef.current && data) {
      // 如果已有实例，先销毁
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // 初始化ECharts实例
      chartInstance.current = echarts.init(chartRef.current);

      // 配置选项
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        legend: {
          data: ['招标数量', '招标金额(万元)']
        },
        xAxis: [
          {
            type: 'category',
            data: data.labels,
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '招标数量',
            position: 'left',
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '金额(万元)',
            position: 'right',
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        series: [
          {
            name: '招标数量',
            type: 'bar',
            data: data.bidCounts,
            barWidth: '30%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ])
            }
          },
          {
            name: '招标金额(万元)',
            type: 'line',
            yAxisIndex: 1,
            data: data.bidAmounts,
            smooth: true,
            lineStyle: {
              width: 3,
              shadowColor: 'rgba(0,0,0,0.3)',
              shadowBlur: 10,
              shadowOffsetY: 8
            },
            itemStyle: {
              color: '#ff7700'
            }
          }
        ]
      };

      // 使用配置项设置图表
      chartInstance.current.setOption(option);
    }
  }, [data]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '350px' }}></div>
  );
} 