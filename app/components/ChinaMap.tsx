'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
// 移除直接导入中国地图数据
// import 'echarts/map/js/china';

// 中国地图数据将在组件内部通过registerMap注册

interface ChinaMapProps {
  data: {
    regionMap: { name: string; value: number }[];
  };
  onRegionClick?: (region: string) => void;
}

export default function ChinaMap({ data, onRegionClick }: ChinaMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 注册中国地图数据
  useEffect(() => {
    // 简化的中国地图GeoJSON数据
    // 实际项目中，应该将这个数据放在单独的文件中
    const chinaGeoJSON: any = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "id": "710000",
          "properties": {"name": "台湾"},
          "geometry": {
            "type": "MultiPolygon",
            "coordinates": [[[[121.97, 24.08], [121.82, 25.02], [121.40, 25.03]]]]
          }
        },
        {
          "type": "Feature",
          "id": "130000",
          "properties": {"name": "河北"},
          "geometry": {
            "type": "MultiPolygon",
            "coordinates": [[[[118.17, 39.70], [117.78, 36.98], [114.55, 38.07]]]]
          }
        },
        {
          "type": "Feature",
          "id": "140000",
          "properties": {"name": "山西"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[112.9, 38.27], [111.83, 36.10], [112.80, 35.20]]]
          }
        },
        {
          "type": "Feature",
          "id": "150000",
          "properties": {"name": "内蒙古"},
          "geometry": {
            "type": "MultiPolygon",
            "coordinates": [[[[119.17, 44.27], [117.21, 43.50], [113.48, 41.22]]]]
          }
        },
        {
          "type": "Feature",
          "id": "110000",
          "properties": {"name": "北京"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[116.46, 40.02], [116.12, 39.82], [116.80, 39.90]]]
          }
        },
        {
          "type": "Feature",
          "id": "120000",
          "properties": {"name": "天津"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[117.05, 39.20], [117.35, 39.10], [117.20, 38.95]]]
          }
        },
        {
          "type": "Feature",
          "id": "310000",
          "properties": {"name": "上海"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[121.40, 31.15], [121.65, 31.28], [121.80, 31.10]]]
          }
        },
        {
          "type": "Feature",
          "id": "320000",
          "properties": {"name": "江苏"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[119.00, 34.00], [119.97, 33.15], [120.80, 32.96]]]
          }
        },
        {
          "type": "Feature",
          "id": "330000",
          "properties": {"name": "浙江"},
          "geometry": {
            "type": "MultiPolygon",
            "coordinates": [[[[120.17, 29.27], [121.10, 28.90], [120.42, 27.28]]]]
          }
        },
        {
          "type": "Feature",
          "id": "340000",
          "properties": {"name": "安徽"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[118.00, 32.70], [116.83, 30.93], [117.90, 29.87]]]
          }
        },
        {
          "type": "Feature",
          "id": "350000",
          "properties": {"name": "福建"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[118.38, 26.68], [119.72, 25.71], [118.10, 24.47]]]
          }
        },
        {
          "type": "Feature",
          "id": "360000",
          "properties": {"name": "江西"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[116.47, 28.47], [115.81, 26.49], [114.78, 28.20]]]
          }
        },
        {
          "type": "Feature",
          "id": "370000",
          "properties": {"name": "山东"},
          "geometry": {
            "type": "MultiPolygon",
            "coordinates": [[[[120.32, 37.95], [119.16, 36.43], [116.94, 37.25]]]]
          }
        },
        {
          "type": "Feature",
          "id": "410000",
          "properties": {"name": "河南"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[115.00, 34.18], [114.05, 32.68], [112.57, 35.10]]]
          }
        },
        {
          "type": "Feature",
          "id": "420000",
          "properties": {"name": "湖北"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[114.25, 31.05], [112.23, 29.80], [109.72, 30.30]]]
          }
        },
        {
          "type": "Feature",
          "id": "430000",
          "properties": {"name": "湖南"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[112.15, 29.45], [111.89, 27.65], [109.70, 28.25]]]
          }
        },
        {
          "type": "Feature",
          "id": "440000",
          "properties": {"name": "广东"},
          "geometry": {
            "type": "MultiPolygon",
            "coordinates": [[[[114.95, 23.05], [113.27, 22.15], [115.77, 22.62]]]]
          }
        },
        {
          "type": "Feature", 
          "id": "450000",
          "properties": {"name": "广西"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[108.75, 24.45], [108.05, 22.84], [106.65, 23.68]]]
          }
        },
        {
          "type": "Feature",
          "id": "460000",
          "properties": {"name": "海南"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[109.84, 19.28], [109.25, 18.76], [110.35, 18.38]]]
          }
        },
        {
          "type": "Feature",
          "id": "500000",
          "properties": {"name": "重庆"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[107.17, 30.42], [108.38, 29.32], [106.50, 29.60]]]
          }
        },
        {
          "type": "Feature",
          "id": "510000",
          "properties": {"name": "四川"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[103.10, 31.43], [101.76, 29.32], [103.52, 28.50]]]
          }
        },
        {
          "type": "Feature",
          "id": "520000",
          "properties": {"name": "贵州"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[106.90, 27.17], [104.55, 26.25], [106.15, 25.60]]]
          }
        },
        {
          "type": "Feature",
          "id": "530000",
          "properties": {"name": "云南"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[102.71, 24.43], [101.57, 22.75], [99.53, 25.01]]]
          }
        },
        {
          "type": "Feature",
          "id": "540000",
          "properties": {"name": "西藏"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[88.80, 31.37], [85.33, 28.25], [92.70, 29.30]]]
          }
        },
        {
          "type": "Feature",
          "id": "610000",
          "properties": {"name": "陕西"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[109.24, 36.22], [106.80, 33.87], [110.13, 35.15]]]
          }
        },
        {
          "type": "Feature",
          "id": "620000",
          "properties": {"name": "甘肃"},
          "geometry": {
            "type": "MultiPolygon",
            "coordinates": [[[[102.75, 37.88], [98.10, 36.20], [100.98, 40.02]]]]
          }
        },
        {
          "type": "Feature",
          "id": "630000",
          "properties": {"name": "青海"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[95.80, 36.52], [97.34, 33.67], [100.72, 32.67]]]
          }
        },
        {
          "type": "Feature",
          "id": "640000",
          "properties": {"name": "宁夏"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[106.30, 37.42], [105.37, 35.63], [106.65, 36.82]]]
          }
        },
        {
          "type": "Feature",
          "id": "650000",
          "properties": {"name": "新疆"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[86.06, 41.17], [82.50, 37.75], [88.82, 39.32]]]
          }
        },
        {
          "type": "Feature",
          "id": "810000",
          "properties": {"name": "香港"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[114.18, 22.32], [114.30, 22.20], [114.08, 22.15]]]
          }
        },
        {
          "type": "Feature",
          "id": "820000",
          "properties": {"name": "澳门"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[113.55, 22.20], [113.60, 22.15], [113.50, 22.10]]]
          }
        }
      ]
    };

    // 注册地图
    echarts.registerMap('china', chinaGeoJSON);
  }, []);

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
          '新疆': '新疆',
          '宁夏': '宁夏',
          '广西': '广西',
          '西藏': '西藏',
          '香港': '香港',
          '澳门': '澳门',
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
          max: maxValue || 10,
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