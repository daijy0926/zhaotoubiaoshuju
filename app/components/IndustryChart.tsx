'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface IndustryChartProps {
  data: {
    labels: string[];
    data: number[];
  };
}

export default function IndustryChart({ data }: IndustryChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 适应窗口大小变化
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (chartRef.current && data) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      chartInstance.current = echarts.init(chartRef.current);

      // 创建一个颜色列表
      const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'];

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          type: 'scroll'
        },
        series: [
          {
            name: '行业分布',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data.labels.map((label, index) => ({
              value: data.data[index],
              name: label,
              itemStyle: {
                color: colors[index % colors.length]
              }
            }))
          }
        ]
      };

      chartInstance.current.setOption(option);
    }
  }, [data]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '350px' }}></div>
  );
} 