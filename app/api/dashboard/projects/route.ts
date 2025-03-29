import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  // 验证用户是否登录
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  // 获取用户ID和查询参数
  const userId = (session.user as any).id;
  const searchParams = request.nextUrl.searchParams;
  const timeRange = searchParams.get('timeRange') || 'year';
  const area = searchParams.get('area') || 'all';
  const industry = searchParams.get('industry') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const sortBy = searchParams.get('sortBy') || 'publishTime';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  
  try {
    const connection = await pool.getConnection();
    try {
      // 构建基本查询，获取所有时间相关字段
      // 只选择包含time的时间字段，不包括createdAt和updatedAt
      let query = `
        SELECT 
          id, title, publishTime, bidOpenTime, bidEndTime, signEndTime, 
          area, industry, budget, bidAmount, winningBidder, publisherName,
          projectType, tenderMethod, projectStatus, projectDetails 
        FROM TenderProject
        WHERE userId = ?
      `;
      
      const queryParams = [userId];
      
      // 添加筛选条件
      if (area !== 'all') {
        query += ' AND area = ?';
        queryParams.push(area);
      }
      
      if (industry !== 'all') {
        query += ' AND industry = ?';
        queryParams.push(industry);
      }
      
      // 根据时间范围筛选，始终使用publishTime进行筛选
      const currentYear = new Date().getFullYear();
      if (timeRange === 'year') {
        query += ' AND YEAR(FROM_UNIXTIME(publishTime/1000)) = ?';
        queryParams.push(currentYear.toString());
      } else if (timeRange === 'quarter') {
        const currentMonth = new Date().getMonth() + 1;
        const quarterStart = Math.floor((currentMonth - 1) / 3) * 3 + 1;
        
        query += ' AND YEAR(FROM_UNIXTIME(publishTime/1000)) = ? AND MONTH(FROM_UNIXTIME(publishTime/1000)) BETWEEN ? AND ?';
        queryParams.push(
          currentYear.toString(),
          quarterStart.toString(),
          (quarterStart + 2).toString()
        );
      } else if (timeRange === 'month') {
        const currentMonth = new Date().getMonth() + 1;
        query += ' AND YEAR(FROM_UNIXTIME(publishTime/1000)) = ? AND MONTH(FROM_UNIXTIME(publishTime/1000)) = ?';
        queryParams.push(
          currentYear.toString(),
          currentMonth.toString()
        );
      } else if (timeRange === 'custom' && searchParams.get('startDate') && searchParams.get('endDate')) {
        // 自定义时间范围
        const startDate = new Date(searchParams.get('startDate')!).getTime() / 1000;
        const endDate = new Date(searchParams.get('endDate')!).getTime() / 1000;
        
        query += ' AND publishTime BETWEEN ? AND ?';
        queryParams.push(startDate.toString(), endDate.toString());
      }
      
      // 获取总数
      const countQuery = `SELECT COUNT(*) as total FROM (${query}) as countTable`;
      const [countRows] = await connection.query(countQuery, queryParams);
      const total = (countRows as any[])[0].total;
      
      // 添加排序和分页
      // 确保排序字段是有效的时间字段
      const validTimeFields = ['publishTime', 'bidOpenTime', 'bidEndTime', 'signEndTime'];
      let finalSortBy = sortBy;
      
      // 如果是时间相关排序，验证排序字段
      if (sortBy.toLowerCase().includes('time') && !validTimeFields.includes(sortBy)) {
        finalSortBy = 'publishTime'; // 默认回退到publishTime
      }
      
      query += ` ORDER BY ${finalSortBy} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(pageSize, (page - 1) * pageSize);
      
      // 执行查询
      const [rows] = await connection.query(query, queryParams);
      
      // 处理数据，只返回有意义的时间字段
      const processedRows = (rows as any[]).map(row => {
        // 转换时间字段为可读格式
        const processedRow = { ...row };
        
        // 处理所有时间字段
        Object.keys(processedRow).forEach(key => {
          if (key.toLowerCase().includes('time') && 
              !['createdAt', 'updatedAt'].includes(key) && 
              processedRow[key] !== null) {
            // 为前端添加格式化时间字段
            processedRow[`${key}Formatted`] = new Date(Number(processedRow[key]) * 1000).toISOString();
          }
        });
        
        return processedRow;
      });
      
      // 返回结果
      return NextResponse.json({
        projects: processedRows,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching project list:', error);
    return NextResponse.json({ error: '获取项目列表失败' }, { status: 500 });
  }
} 