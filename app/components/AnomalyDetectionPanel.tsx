'use client';

import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, Clock, DollarSign } from 'lucide-react';

// 定义组件属性接口
interface AnomalyDetectionPanelProps {
  data: {
    budgetAnomalies: Array<{
      id: string;
      title: string;
      budget: number;
      bidAmount: number;
      diffPercentage: string;
      anomalyType: string;
    }>;
    timeAnomalies: Array<{
      id: string;
      title: string;
      publishTime: string;
      bidOpenTime: string;
      diffDays: number;
      anomalyType: string;
    }>;
    valueAnomalies: Array<{
      id: string;
      title: string;
      budget: number;
      bidAmount: number;
      ratio: string;
      anomalyType: string;
    }>;
    statistics: {
      avgBudget: number;
      avgBidAmount: number;
      budgetCount: number;
      bidAmountCount: number;
      totalProjects: number;
    };
  };
}

export default function AnomalyDetectionPanel({ data }: AnomalyDetectionPanelProps) {
  const [activeTab, setActiveTab] = useState<'budget' | 'time' | 'value'>('budget');
  
  // 计算异常百分比
  const calculateAnomalyPercentage = (anomalyCount: number, total: number) => {
    if (total === 0) return 0;
    return ((anomalyCount / total) * 100).toFixed(1);
  };
  
  // 渲染预算异常表格
  const renderBudgetAnomalies = () => {
    if (!data.budgetAnomalies.length) {
      return <div className="text-gray-500 p-4 text-center">未发现预算异常数据</div>;
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">项目</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">预算金额</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">成交金额</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">差异</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">异常类型</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.budgetAnomalies.map((anomaly) => (
              <tr key={anomaly.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{anomaly.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{anomaly.budget.toLocaleString()} 元</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{anomaly.bidAmount.toLocaleString()} 元</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${parseFloat(anomaly.diffPercentage) > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                  {anomaly.diffPercentage}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    anomaly.anomalyType === '超预算' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {anomaly.anomalyType}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // 渲染时间异常表格
  const renderTimeAnomalies = () => {
    if (!data.timeAnomalies.length) {
      return <div className="text-gray-500 p-4 text-center">未发现时间异常数据</div>;
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">项目</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发布时间</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开标时间</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">间隔天数</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">异常类型</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.timeAnomalies.map((anomaly) => (
              <tr key={anomaly.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{anomaly.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{anomaly.publishTime}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{anomaly.bidOpenTime}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                  anomaly.diffDays > 180 ? 'text-red-500' : anomaly.diffDays < 3 ? 'text-yellow-500' : 'text-gray-500'
                }`}>
                  {anomaly.diffDays} 天
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    anomaly.anomalyType === '流程过长' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {anomaly.anomalyType}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // 渲染极端值异常表格
  const renderValueAnomalies = () => {
    if (!data.valueAnomalies.length) {
      return <div className="text-gray-500 p-4 text-center">未发现极端值异常数据</div>;
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">项目</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">预算金额</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">成交金额</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">比率</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">异常类型</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.valueAnomalies.map((anomaly) => (
              <tr key={anomaly.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{anomaly.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{anomaly.budget.toLocaleString()} 元</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{anomaly.bidAmount.toLocaleString()} 元</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-500">
                  {anomaly.ratio}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {anomaly.anomalyType}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // 获取统计指标
  const totalAnomalies = data.budgetAnomalies.length + data.timeAnomalies.length + data.valueAnomalies.length;
  const totalProjects = data.statistics.totalProjects;
  const anomalyPercentage = calculateAnomalyPercentage(totalAnomalies, totalProjects);
  
  return (
    <div>
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="power-bi-stat-card">
          <span className="text-3xl font-bold text-blue-600">
            {totalProjects}
          </span>
          <span className="text-sm text-gray-500">总项目数</span>
        </div>
        <div className="power-bi-stat-card">
          <span className="text-3xl font-bold text-red-600">
            {totalAnomalies}
          </span>
          <span className="text-sm text-gray-500">异常项目数</span>
        </div>
        <div className="power-bi-stat-card">
          <span className="text-3xl font-bold text-amber-600">
            {anomalyPercentage}%
          </span>
          <span className="text-sm text-gray-500">异常占比</span>
        </div>
        <div className="power-bi-stat-card">
          <span className="text-3xl font-bold text-green-600">
            {data.statistics.avgBudget ? data.statistics.avgBudget.toLocaleString() : 0}
          </span>
          <span className="text-sm text-gray-500">平均预算 (元)</span>
        </div>
      </div>
      
      {/* 异常类型标签页 */}
      <div className="mb-6">
        <nav className="flex space-x-4 border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-3 py-2 flex items-center text-sm font-medium ${
              activeTab === 'budget'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            预算异常 ({data.budgetAnomalies.length})
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`px-3 py-2 flex items-center text-sm font-medium ${
              activeTab === 'time'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4 mr-1" />
            时间异常 ({data.timeAnomalies.length})
          </button>
          <button
            onClick={() => setActiveTab('value')}
            className={`px-3 py-2 flex items-center text-sm font-medium ${
              activeTab === 'value'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            极端值异常 ({data.valueAnomalies.length})
          </button>
        </nav>
        
        {/* 异常数据表格 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {activeTab === 'budget' && '预算异常项目'}
              {activeTab === 'time' && '时间异常项目'}
              {activeTab === 'value' && '极端值异常项目'}
            </h3>
          </div>
          
          <div className="p-0">
            {activeTab === 'budget' && renderBudgetAnomalies()}
            {activeTab === 'time' && renderTimeAnomalies()}
            {activeTab === 'value' && renderValueAnomalies()}
          </div>
        </div>
      </div>
      
      {/* 异常检测说明 */}
      <div className="mt-6 p-4 bg-amber-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
          异常数据检测规则
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>预算异常: 成交金额与预算金额差异超过50%或低于-30%的项目。</li>
          <li>时间异常: 从发布到开标时间超过180天或少于3天的项目。</li>
          <li>极端值异常: 成交金额接近为0但预算很高，或成交金额远超预算10倍以上的项目。</li>
        </ul>
      </div>
    </div>
  );
} 