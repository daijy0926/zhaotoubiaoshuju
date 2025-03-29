import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"; // 导入 getServerSession
import { authOptions } from "@/lib/auth"; // 导入 authOptions

// 数据预处理和标准化函数
function preprocessData(records: any[]) {
  return records.map(record => {
    // 创建记录的副本，避免修改原始数据
    const processedRecord = { ...record };
    
    // 1. 标准化日期格式 (将时间戳转换为MySQL日期格式)
    const formatDate = (timestamp: any) => {
      if (!timestamp) return null;
      
      let date;
      // 尝试解析不同格式的日期
      if (typeof timestamp === 'number') {
        // 如果是时间戳（秒或毫秒）
        date = new Date(timestamp * (timestamp < 10000000000 ? 1000 : 1));
      } else if (typeof timestamp === 'string') {
        // 尝试解析ISO日期字符串或其他格式
        date = new Date(timestamp);
      } else {
        return null;
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) return null;
      
      // 保存用于显示的格式化日期（用于元数据）
      return date;
    };
    
    // 处理各种日期字段
    if (processedRecord.publishTime) {
      const date = formatDate(processedRecord.publishTime);
      if (date) {
        processedRecord.publishTimeFormatted = date.toISOString().split('T')[0]; // YYYY-MM-DD
        processedRecord.publishTime = Math.floor(date.getTime() / 1000); // Unix timestamp (seconds)
      }
    }
    
    if (processedRecord.bidOpenTime) {
      const date = formatDate(processedRecord.bidOpenTime);
      if (date) {
        processedRecord.bidOpenTimeFormatted = date.toISOString().split('T')[0];
        processedRecord.bidOpenTime = Math.floor(date.getTime() / 1000);
      } else {
        processedRecord.bidOpenTime = null;
      }
    }
    
    if (processedRecord.bidEndTime) {
      const date = formatDate(processedRecord.bidEndTime);
      if (date) {
        processedRecord.bidEndTimeFormatted = date.toISOString().split('T')[0];
        processedRecord.bidEndTime = Math.floor(date.getTime() / 1000);
      } else {
        processedRecord.bidEndTime = null;
      }
    }
    
    if (processedRecord.signEndTime) {
      const date = formatDate(processedRecord.signEndTime);
      if (date) {
        processedRecord.signEndTimeFormatted = date.toISOString().split('T')[0];
        processedRecord.signEndTime = Math.floor(date.getTime() / 1000);
      } else {
        processedRecord.signEndTime = null;
      }
    }
    
    // 2. 标准化数值型字段
    if (processedRecord.budget) {
      const budget = parseFloat(processedRecord.budget);
      processedRecord.budget = isNaN(budget) ? null : budget;
    }
    
    if (processedRecord.bidAmount) {
      const bidAmount = parseFloat(processedRecord.bidAmount);
      processedRecord.bidAmount = isNaN(bidAmount) ? null : bidAmount;
    }
    
    // 3. 确保字符串字段不超出数据库字段长度限制
    const maxLength = {
      id: 255,
      title: 500,
      area: 50,
      city: 50,
      district: 50,
      buyer: 300,
      buyerClass: 100,
      industry: 100,
      subtype: 100,
      winner: 300,
      buyerTel: 50,
      buyerPerson: 50,
      agency: 300,
      agencyTel: 50,
      agencyPerson: 50,
      site: 255
    };
    
    // 对所有字符串字段进行清理和截断
    Object.keys(maxLength).forEach(field => {
      if (processedRecord[field]) {
        if (typeof processedRecord[field] !== 'string') {
          processedRecord[field] = String(processedRecord[field]);
        }
        // 截断超长字段
        if (processedRecord[field].length > maxLength[field as keyof typeof maxLength]) {
          processedRecord[field] = processedRecord[field].substring(0, maxLength[field as keyof typeof maxLength]);
        }
        
        // URL编码中的特殊字符处理
        if (field === 'id' && processedRecord[field].includes('%')) {
          try {
            // 尝试解码URL编码的ID
            processedRecord[field] = decodeURIComponent(processedRecord[field]);
          } catch (e) {
            // 如果解码失败，使用原始值
          }
        }
      }
    });
    
    return processedRecord;
  });
}

// 验证JSON结构和字段
interface ValidationResult {
  valid: boolean;
  error?: string;
  totalCount?: number;
  validCount?: number;
  invalidCount?: number;
  uniqueCount?: number;
  duplicateCount?: number;
  duplicateIds: string[];
  validRecords: any[];
}

function validateJsonData(data: any): ValidationResult {
  // 检查是否为数组
  if (!Array.isArray(data)) {
    return {
      valid: false,
      error: 'JSON数据必须是数组格式',
      duplicateIds: [],
      validRecords: []
    };
  }
  
  // 检查是否为空数组
  if (data.length === 0) {
    return {
      valid: false,
      error: '数据数组不能为空',
      duplicateIds: [],
      validRecords: []
    };
  }
  
  // 检查必填字段
  const validRecords = data.filter(item => 
    item && typeof item === 'object' && 
    item.id && item.title && item.area && item.buyer && item.publishTime
  );
  
  if (validRecords.length === 0) {
    return {
      valid: false,
      error: '没有找到包含必要字段的有效记录',
      duplicateIds: [],
      validRecords: []
    };
  }
  
  // 检查重复ID
  const uniqueIds = new Set<string>();
  const duplicates: string[] = [];
  
  data.forEach((item: any) => {
    if (item && item.id) {
      if (uniqueIds.has(item.id)) {
        duplicates.push(item.id);
      } else {
        uniqueIds.add(item.id);
      }
    }
  });
  
  return {
    valid: true,
    totalCount: data.length,
    validCount: validRecords.length,
    invalidCount: data.length - validRecords.length,
    uniqueCount: uniqueIds.size,
    duplicateCount: duplicates.length,
    duplicateIds: duplicates,
    validRecords
  };
}

export async function POST(request: NextRequest) {
  // 1. 验证用户是否登录
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    // 2. 从请求中获取JSON数据
    const reqBody = await request.json();
    const { data } = reqBody;
    
    // 3. 验证JSON数据结构和必要字段
    const validationResult = validateJsonData(data);
    
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }
    
    // 4. 数据预处理和标准化
    const processedRecords = preprocessData(validationResult.validRecords);
    
    // 5. 保存到数据库
    const importedCount = await saveToDatabase(processedRecords, userId);

    return NextResponse.json({
      success: true,
      count: importedCount,
      total: data.length,
      valid: validationResult.validCount,
      invalid: validationResult.invalidCount,
      duplicates: validationResult.duplicateCount,
      message: `成功为用户 ${userId} 导入 ${importedCount} 条记录`
    });
  } catch (error) {
    console.error('Upload error for user:', userId, error);
    return NextResponse.json(
      { error: '服务器处理错误' },
      { status: 500 }
    );
  }
}

// 将预处理后的数据保存到数据库
async function saveToDatabase(records: any[], userId: string) {
  let importedCount = 0;
  const batchSize = 100; // 批量处理的记录数

  const connection = await pool.getConnection();
  try {
    // 开始事务
    await connection.beginTransaction();
    
    // 分批处理
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      for (const record of batch) {
        try {
          // 准备元数据
          const metaData: Record<string, any> = {};
          if (record.publishTimeFormatted) metaData.publishTimeFormatted = record.publishTimeFormatted;
          if (record.bidOpenTimeFormatted) metaData.bidOpenTimeFormatted = record.bidOpenTimeFormatted;
          if (record.bidEndTimeFormatted) metaData.bidEndTimeFormatted = record.bidEndTimeFormatted;
          if (record.signEndTimeFormatted) metaData.signEndTimeFormatted = record.signEndTimeFormatted;
          let detailContent = record.detail || '';
          if (Object.keys(metaData).length > 0) {
            const metaDataJson = JSON.stringify(metaData);
            detailContent = `${detailContent}\n\n<!-- METADATA_JSON -->\n${metaDataJson}`;
          }

          // 检查记录是否已存在
          const [existingRows] = await connection.query(
            'SELECT id FROM TenderProject WHERE id = ? AND userId = ?',
            [record.id, userId]
          );
          
          const existingRecords = existingRows as any[];
          
          if (existingRecords.length > 0) {
            // 更新现有记录
            await connection.query(
              `UPDATE TenderProject SET 
              title = ?, area = ?, city = ?, district = ?, buyer = ?, 
              buyerClass = ?, industry = ?, publishTime = ?, budget = ?, 
              bidAmount = ?, subtype = ?, detail = ?, winner = ?, 
              bidOpenTime = ?, bidEndTime = ?, signEndTime = ?, buyerTel = ?, 
              buyerPerson = ?, agency = ?, agencyTel = ?, agencyPerson = ?, 
              site = ?, updatedAt = NOW() 
              WHERE id = ? AND userId = ?`,
              [
                record.title, record.area, record.city || null, record.district || null, record.buyer,
                record.buyerClass || null, record.industry || null, record.publishTime,
                record.budget || null, record.bidAmount || null, record.subtype || null,
                detailContent, record.winner || null, record.bidOpenTime || null,
                record.bidEndTime || null, record.signEndTime || null, record.buyerTel || null,
                record.buyerPerson || null, record.agency || null, record.agencyTel || null,
                record.agencyPerson || null, record.site || null,
                record.id, userId
              ]
            );
          } else {
            // 创建新记录
            // 修复列数和值数量不匹配的问题
            await connection.query(
              `INSERT INTO TenderProject (
                id, userId, title, area, city, district, buyer, buyerClass, industry, 
                publishTime, budget, bidAmount, subtype, detail, winner, 
                bidOpenTime, bidEndTime, signEndTime, buyerTel, buyerPerson, 
                agency, agencyTel, agencyPerson, site, createdAt, updatedAt
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                record.id, userId, record.title, record.area, record.city || null,
                record.district || null, record.buyer, record.buyerClass || null,
                record.industry || null, record.publishTime, record.budget || null,
                record.bidAmount || null, record.subtype || null, detailContent,
                record.winner || null, record.bidOpenTime || null, record.bidEndTime || null,
                record.signEndTime || null, record.buyerTel || null, record.buyerPerson || null,
                record.agency || null, record.agencyTel || null, record.agencyPerson || null,
                record.site || null
              ]
            );
          }
          
          importedCount++;
        } catch (error) {
          console.error('Error importing record for user:', userId, record.id, error);
        }
      }
    }
    
    // 提交事务
    await connection.commit();
    
  } catch (error) {
    // 回滚事务
    await connection.rollback();
    console.error('Transaction error for user:', userId, error);
    throw error;
  } finally {
    // 释放连接
    connection.release();
  }

  return importedCount;
} 