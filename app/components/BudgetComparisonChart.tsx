'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface BudgetComparisonChartProps {
  data: {
    categories: string[];
    budget: number[];
    actual: number[];
  };
}

export default function BudgetComparisonChart({ data }: BudgetComparisonChartProps) {
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

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params: any) {
            const budgetItem = params[0];
            const actualItem = params[1];
            
            // 计算差异百分比
            const diff = ((actualItem.value - budgetItem.value) / budgetItem.value * 100).toFixed(2);
            const diffValue = parseFloat(diff);
            const diffText = diffValue > 0 ? `+${diff}%` : `${diff}%`;
            const diffColor = diffValue > 0 ? '#f43f5e' : '#10b981';
            
            return `<div style="margin: 0px 0 0;line-height:1;">
                      <div style="font-size:14px;color:#666;font-weight:400;line-height:1;">${budgetItem.name}</div>
                      <div style="margin: 10px 0 0;line-height:1;">
                        <div style="margin: 0px 0 0;line-height:1;">
                          <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${budgetItem.color};"></span>
                          <span style="font-size:14px;color:#666;font-weight:400;margin-left:2px">${budgetItem.seriesName}:</span>
                          <span style="float:right;margin-left:20px;font-size:14px;color:#666;font-weight:900">${budgetItem.value}</span>
                          <div style="clear:both"></div>
                        </div>
                        <div style="margin: 5px 0 0;line-height:1;">
                          <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${actualItem.color};"></span>
                          <span style="font-size:14px;color:#666;font-weight:400;margin-left:2px">${actualItem.seriesName}:</span>
                          <span style="float:right;margin-left:20px;font-size:14px;color:#666;font-weight:900">${actualItem.value}</span>
                          <div style="clear:both"></div>
                        </div>
                        <div style="margin: 5px 0 0;line-height:1;">
                          <span style="font-size:14px;color:#666;font-weight:400;margin-left:14px">差异:</span>
                          <span style="float:right;margin-left:20px;font-size:14px;color:${diffColor};font-weight:900">${diffText}</span>
                          <div style="clear:both"></div>
                        </div>
                      </div>
                    </div>`;
          }
        },
        legend: {
          data: ['预算金额(万元)', '实际成交(万元)']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '金额 (万元)',
          nameLocation: 'end'
        },
        yAxis: {
          type: 'category',
          data: data.categories,
          axisLabel: {
            interval: 0,
            rotate: 0
          }
        },
        series: [
          {
            name: '预算金额(万元)',
            type: 'bar',
            stack: 'total',
            itemStyle: {
              color: '#3b82f6'
            },
            emphasis: {
              focus: 'series'
            },
            data: data.budget
          },
          {
            name: '实际成交(万元)',
            type: 'bar',
            stack: 'total',
            itemStyle: {
              color: '#10b981'
            },
            emphasis: {
              focus: 'series'
            },
            data: data.actual
          }
        ]
      };

      chartInstance.current.setOption(option);
    }
  }, [data]);

  // 计算整体节省百分比
  const calculateOverallSaving = () => {
    if (!data || !data.budget || !data.actual) return { percent: 0, amount: 0 };
    
    const totalBudget = data.budget.reduce((acc, curr) => acc + curr, 0);
    const totalActual = data.actual.reduce((acc, curr) => acc + curr, 0);
    
    const savingAmount = totalBudget - totalActual;
    const savingPercent = totalBudget === 0 ? 0 : (savingAmount / totalBudget) * 100;
    
    return {
      percent: Math.round(savingPercent * 100) / 100,
      amount: Math.round(savingAmount * 100) / 100
    };
  };

  const saving = calculateOverallSaving();

  return (
    <div>
      <div ref={chartRef} style={{ width: '100%', height: '300px' }}></div>
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">总预算节省:</span>
          <div className="flex items-center">
            <span className={`text-lg font-bold ${saving.percent > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {saving.percent > 0 ? saving.percent.toFixed(2) + '%' : '0%'}
            </span>
            <span className="text-sm text-gray-500 ml-2">
              ({saving.amount > 0 ? saving.amount.toFixed(2) : '0'} 万元)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 