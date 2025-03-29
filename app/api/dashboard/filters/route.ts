import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  // 验证用户会话
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  
  try {
    const connection = await pool.getConnection();
    try {
      // 获取行业列表
      const industriesSql = `
        SELECT DISTINCT industry FROM TenderProject 
        WHERE userId = ? AND industry IS NOT NULL AND industry != ''
        ORDER BY industry
      `;
      const [industriesResult] = await connection.query(industriesSql, [userId]);
      const industries = (industriesResult as any[]).map(row => row.industry);
      
      // 获取地区列表
      const areasSql = `
        SELECT DISTINCT area FROM TenderProject 
        WHERE userId = ? AND area IS NOT NULL AND area != ''
        ORDER BY area
      `;
      const [areasResult] = await connection.query(areasSql, [userId]);
      const areas = (areasResult as any[]).map(row => row.area);
      
      // 获取时间范围
      const timeRangeSql = `
        SELECT 
          MIN(publishTime) as min_time,
          MAX(publishTime) as max_time
        FROM TenderProject
        WHERE userId = ? AND publishTime IS NOT NULL
      `;
      const [timeResult] = await connection.query(timeRangeSql, [userId]);
      
      const timeRange = timeResult && (timeResult as any[])[0] && {
        min: (timeResult as any[])[0].min_time * 1000,  // 转换为毫秒
        max: (timeResult as any[])[0].max_time * 1000   // 转换为毫秒
      };
      
      return NextResponse.json({
        industries,
        areas,
        timeRange
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取筛选选项失败:', error);
    return NextResponse.json({ error: '获取筛选选项失败' }, { status: 500 });
  }
} 