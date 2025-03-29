import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  // 1. 验证用户是否登录
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  // 2. 获取用户ID和查询参数
  const userId = (session.user as any).id;
  const searchParams = request.nextUrl.searchParams;
  
  // 获取分页参数
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  
  // 获取筛选参数
  const timeRange = searchParams.get('timeRange') || 'year';
  const area = searchParams.get('area') || 'all';
  const industry = searchParams.get('industry') || 'all';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const searchTerm = searchParams.get('search') || '';
  
  try {
    const connection = await pool.getConnection();
    try {
      // 构建SQL查询
      let sql = `
        SELECT 
          id, title, area, city, buyer, industry, 
          publishTime, budget, bidAmount, winner,
          bidOpenTime, bidEndTime
        FROM TenderProject
        WHERE userId = ?
      `;
      
      const queryParams: any[] = [userId];
      
      // 添加筛选条件
      const filters = [];
      
      // 地区筛选
      if (area !== 'all') {
        filters.push('area = ?');
        queryParams.push(area);
      }
      
      // 行业筛选
      if (industry !== 'all') {
        filters.push('industry = ?');
        queryParams.push(industry);
      }
      
      // 搜索关键词
      if (searchTerm) {
        filters.push('(title LIKE ? OR buyer LIKE ? OR winner LIKE ?)');
        queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
      }
      
      // 时间范围筛选
      if (startDate && endDate) {
        // 自定义时间范围
        const startTimestamp = new Date(startDate).getTime() / 1000;
        const endTimestamp = new Date(endDate).getTime() / 1000;
        
        filters.push('publishTime BETWEEN ? AND ?');
        queryParams.push(startTimestamp.toString(), endTimestamp.toString());
      } else {
        const currentYear = new Date().getFullYear();
        
        if (timeRange === 'year') {
          filters.push('YEAR(FROM_UNIXTIME(publishTime/1000)) = ?');
          queryParams.push(currentYear.toString());
        } else if (timeRange === 'quarter') {
          const currentMonth = new Date().getMonth() + 1;
          const quarterStart = Math.floor((currentMonth - 1) / 3) * 3 + 1;
          
          filters.push('YEAR(FROM_UNIXTIME(publishTime/1000)) = ?');
          filters.push('MONTH(FROM_UNIXTIME(publishTime/1000)) BETWEEN ? AND ?');
          queryParams.push(
            currentYear.toString(),
            quarterStart.toString(),
            (quarterStart + 2).toString()
          );
        } else if (timeRange === 'month') {
          const currentMonth = new Date().getMonth() + 1;
          
          filters.push('YEAR(FROM_UNIXTIME(publishTime/1000)) = ?');
          filters.push('MONTH(FROM_UNIXTIME(publishTime/1000)) = ?');
          queryParams.push(currentYear.toString(), currentMonth.toString());
        }
      }
      
      // 将所有筛选条件添加到SQL
      if (filters.length > 0) {
        sql += ' AND ' + filters.join(' AND ');
      }
      
      // 添加排序
      sql += ' ORDER BY publishTime DESC';
      
      // 获取总记录数（用于分页）
      const countSql = `
        SELECT COUNT(*) as total
        FROM TenderProject
        WHERE userId = ?
        ${filters.length > 0 ? ' AND ' + filters.join(' AND ') : ''}
      `;
      
      const [countResult] = await connection.query(countSql, queryParams);
      const total = (countResult as any[])[0].total;
      
      // 添加分页限制
      const offset = (page - 1) * pageSize;
      sql += ' LIMIT ? OFFSET ?';
      queryParams.push(pageSize, offset);
      
      // 执行查询
      const [rows] = await connection.query(sql, queryParams);
      
      // 处理结果
      const projects = (rows as any[]).map(project => ({
        ...project,
        publishTime: Number(project.publishTime),
        bidOpenTime: project.bidOpenTime ? Number(project.bidOpenTime) : null,
        bidEndTime: project.bidEndTime ? Number(project.bidEndTime) : null,
        budget: project.budget ? Number(project.budget) : null,
        bidAmount: project.bidAmount ? Number(project.bidAmount) : null,
        publishDate: new Date(Number(project.publishTime) * 1000).toISOString().split('T')[0]
      }));
      
      // 计算总页数
      const totalPages = Math.ceil(total / pageSize);
      
      return NextResponse.json({
        projects,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
    return NextResponse.json({ error: '获取项目列表失败' }, { status: 500 });
  }
} 