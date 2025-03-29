'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface RegionalData {
  topRegions: { name: string; value: number }[];
  regionMap: { name: string; value: number }[];
}

interface RegionMapProps {
  data: RegionalData;
}

export default function RegionMap({ data }: RegionMapProps) {
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

      // 使用条形图展示地区数据
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '项目数量',
          nameLocation: 'end'
        },
        yAxis: {
          type: 'category',
          data: data.topRegions.map(item => item.name),
          nameGap: 20,
          axisLabel: {
            interval: 0,
            rotate: 0
          }
        },
        series: [
          {
            name: '招标项目数量',
            type: 'bar',
            data: data.topRegions.map(item => item.value),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}'
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#0091ff' },
                { offset: 1, color: '#6fa6e3' }
              ])
            }
          }
        ]
      };

      chartInstance.current.setOption(option);
    }
  }, [data]);

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
} 