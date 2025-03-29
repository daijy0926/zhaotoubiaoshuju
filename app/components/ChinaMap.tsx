'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
// 导入中国地图数据
import 'echarts/map/js/china';

interface ChinaMapProps {
  data: {
    regionMap: { name: string; value: number }[];
  };
  onRegionClick?: (region: string) => void;
}

export default function ChinaMap({ data, onRegionClick }: ChinaMapProps) {
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
    if (chartRef.current && data && data.regionMap) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // 初始化地图
      chartInstance.current = echarts.init(chartRef.current);

      // 处理数据，匹配地图需要的省份名称格式
      const formattedData = data.regionMap.map(item => {
        // 处理省份名称，确保与地图匹配
        let name = item.name;
        if (name.endsWith('省') || name.endsWith('市') || name.endsWith('区') || name.endsWith('自治区')) {
          name = name.substring(0, name.length - 1);
        }
        // 特殊处理一些名称
        const specialNames: Record<string, string> = {
          '内蒙': '内蒙古',
          '新疆': '新疆维吾尔自治区',
          '宁夏': '宁夏回族自治区',
          '广西': '广西壮族自治区',
          '西藏': '西藏自治区',
          '香港': '香港特别行政区',
          '澳门': '澳门特别行政区',
        };
        
        if (specialNames[name]) {
          name = specialNames[name];
        }
        
        return {
          name,
          value: item.value
        };
      });

      // 找出最大值，用于设置颜色渐变
      const maxValue = Math.max(...formattedData.map(item => item.value));

      // 设置地图配置
      const option = {
        title: {
          text: '招投标地区分布',
          subtext: '点击省份查看详情',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}<br/>项目数量: {c}'
        },
        visualMap: {
          min: 0,
          max: maxValue,
          text: ['高', '低'],
          realtime: false,
          calculable: true,
          inRange: {
            color: ['#e0f7fa', '#4dd0e1', '#006064']
          }
        },
        series: [
          {
            name: '招投标数量',
            type: 'map',
            map: 'china',
            roam: true, // 允许缩放和平移
            emphasis: {
              label: {
                show: true
              },
              itemStyle: {
                areaColor: '#f5222d',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                borderWidth: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            data: formattedData
          }
        ]
      };

      // 设置点击事件
      if (onRegionClick) {
        chartInstance.current.on('click', (params: any) => {
          if (params.componentType === 'series' && params.name) {
            onRegionClick(params.name);
          }
        });
      }

      // 渲染地图
      chartInstance.current.setOption(option);
    }
  }, [data, onRegionClick]);

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
} 