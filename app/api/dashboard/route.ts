import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange') || 'year';
  const region = searchParams.get('region') || 'all';
  const industry = searchParams.get('industry') || 'all';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    // 构建查询条件
    const whereClause: any = {};
    
    // 时间范围筛选
    if (startDate && endDate) {
      whereClause.publishTime = {
        gte: new Date(startDate).getTime() / 1000,
        lte: new Date(endDate).getTime() / 1000
      };
    } else {
      const now = new Date();
      if (timeRange === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        whereClause.publishTime = { gte: Math.floor(startOfYear.getTime() / 1000) };
      } else if (timeRange === 'quarter') {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        const startOfQuarter = new Date(now.getFullYear(), quarterMonth, 1);
        whereClause.publishTime = { gte: Math.floor(startOfQuarter.getTime() / 1000) };
      } else if (timeRange === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        whereClause.publishTime = { gte: Math.floor(startOfMonth.getTime() / 1000) };
      }
    }

    // 地区筛选
    if (region !== 'all') {
      whereClause.area = region;
    }

    // 行业筛选
    if (industry !== 'all') {
      whereClause.industry = industry;
    }

    // 获取趋势数据 (按月分组)
    const trendData = await getTrendData(whereClause);
    
    // 获取地区分布数据
    const regionalData = await getRegionalData(whereClause);
    
    // 获取行业占比数据
    const industryData = await getIndustryData(whereClause);
    
    // 获取预算对比数据
    const budgetData = await getBudgetData(whereClause);

    return NextResponse.json({
      success: true,
      trendData,
      regionalData,
      industryData,
      budgetData
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return NextResponse.json(
      { error: '获取仪表盘数据失败' },
      { status: 500 }
    );
  }
}

// 获取趋势数据 (按月分组)
async function getTrendData(whereClause: any) {
  try {
    const currentYear = new Date().getFullYear();
    const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const bidCounts = new Array(12).fill(0);
    const bidAmounts = new Array(12).fill(0);

    // 获取所有项目
    const projects = await prisma.tenderProject.findMany({
      where: whereClause,
      select: {
        publishTime: true,
        budget: true
      }
    });

    // 按月分组统计
    projects.forEach(project => {
      const date = new Date(project.publishTime * 1000);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        bidCounts[month]++;
        if (project.budget) {
          bidAmounts[month] += project.budget / 10000; // 转换为万元
        }
      }
    });

    return {
      labels,
      bidCounts,
      bidAmounts: bidAmounts.map(amount => Math.round(amount))
    };
  } catch (error) {
    console.error('Error getting trend data:', error);
    throw error;
  }
}

// 获取地区分布数据
async function getRegionalData(whereClause: any) {
  try {
    // 按地区分组统计
    const regions = await prisma.tenderProject.groupBy({
      by: ['area'],
      where: whereClause,
      _count: {
        id: true
      }
    });

    // 转换为需要的格式
    const regionMap = regions.map(region => ({
      name: region.area,
      value: region._count.id
    }));

    // 排序获取Top 5地区
    const topRegions = [...regionMap]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      regionMap,
      topRegions
    };
  } catch (error) {
    console.error('Error getting regional data:', error);
    throw error;
  }
}

// 获取行业占比数据
async function getIndustryData(whereClause: any) {
  try {
    // 按行业分组统计
    const industries = await prisma.tenderProject.groupBy({
      by: ['industry'],
      where: whereClause,
      _count: {
        id: true
      }
    });

    // 过滤掉空值并转换格式
    const filteredIndustries = industries
      .filter(item => !!item.industry)
      .map(item => ({
        name: item.industry || '其他',
        count: item._count.id
      }));

    // 排序并获取前5个行业和其他行业
    const topIndustries = filteredIndustries
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 计算剩余行业的总数
    const othersCount = filteredIndustries
      .filter(item => !topIndustries.find(top => top.name === item.name))
      .reduce((sum, item) => sum + item.count, 0);

    // 如果有其他行业，添加到列表
    if (othersCount > 0) {
      topIndustries.push({ name: '其他', count: othersCount });
    }

    return {
      labels: topIndustries.map(item => item.name),
      data: topIndustries.map(item => item.count)
    };
  } catch (error) {
    console.error('Error getting industry data:', error);
    throw error;
  }
}

// 获取预算与实际成交对比数据
async function getBudgetData(whereClause: any) {
  try {
    // 查询有预算和中标金额的项目
    const projects = await prisma.tenderProject.findMany({
      where: {
        ...whereClause,
        budget: { not: null },
        bidAmount: { not: null }
      },
      select: {
        industry: true,
        budget: true,
        bidAmount: true
      }
    });

    // 按行业分组计算预算和中标金额
    const industriesMap = new Map();
    
    projects.forEach(project => {
      const industry = project.industry || '其他';
      if (!industriesMap.has(industry)) {
        industriesMap.set(industry, { budget: 0, actual: 0, count: 0 });
      }
      
      const data = industriesMap.get(industry);
      data.budget += project.budget || 0;
      data.actual += project.bidAmount || 0;
      data.count++;
    });

    // 转换为数组并排序
    const industriesArray = Array.from(industriesMap.entries())
      .map(([name, data]) => ({
        name,
        budget: Math.round(data.budget / 10000), // 转换为万元
        actual: Math.round(data.actual / 10000), // 转换为万元
        count: data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      categories: industriesArray.map(item => item.name),
      budget: industriesArray.map(item => item.budget),
      actual: industriesArray.map(item => item.actual)
    };
  } catch (error) {
    console.error('Error getting budget data:', error);
    throw error;
  }
} 