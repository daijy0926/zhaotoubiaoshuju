import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  // 检查用户是否登录
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ 
      error: '未授权访问' 
    }, { status: 401 });
  }
  
  const userId = (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ 
      error: '无法获取用户ID' 
    }, { status: 401 });  
  }
  
  // 创建数据库连接
  let connection;
  try {
    connection = await mysql.createConnection(process.env.DATABASE_URL || '');
    
    // 获取所有行业分类
    const [industryRows] = await connection.query(
      'SELECT DISTINCT industry FROM TenderProject WHERE userId = ? AND industry IS NOT NULL ORDER BY industry',
      [userId]
    );
    
    // 获取所有地区（修改region为area）
    const [areaRows] = await connection.query(
      'SELECT DISTINCT area FROM TenderProject WHERE userId = ? AND area IS NOT NULL ORDER BY area',
      [userId]
    );
    
    // 获取最早和最新的发布时间
    const [timeRows] = await connection.query(
      'SELECT MIN(publishTime) as minTime, MAX(publishTime) as maxTime FROM TenderProject WHERE userId = ? AND publishTime IS NOT NULL',
      [userId]
    );
    
    const industries = (industryRows as any[]).map(row => row.industry);
    const areas = (areaRows as any[]).map(row => row.area);
    const timeRange = timeRows as any[];
    
    return NextResponse.json({
      industries,
      areas, // 修改返回字段名，与查询一致
      timeRange: timeRange.length > 0 ? {
        min: timeRange[0].minTime,
        max: timeRange[0].maxTime
      } : {
        min: Date.now() - 365 * 24 * 60 * 60 * 1000, // 默认为一年前
        max: Date.now()
      }
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json({ 
      error: '获取过滤选项时出错' 
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
} 