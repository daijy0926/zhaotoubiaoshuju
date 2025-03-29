import mysql from 'mysql2/promise';
import { LRUCache } from 'lru-cache';

// 创建缓存实例，用于缓存查询结果
const queryCache = new LRUCache<string, any>({
  // 最多存储100个查询结果
  max: 100,
  
  // 缓存有效期1小时
  ttl: 1000 * 60 * 60,
  
  // 当缓存被丢弃时的回调函数
  dispose: (value: any, key: string) => {
    console.log(`Cache entry expired: ${key}`);
  },
});

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 20, // 增加连接池大小
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10秒后开始发送keep-alive查询
  namedPlaceholders: true, // 启用命名参数
  dateStrings: true, // 返回日期为字符串
});

// 带缓存的查询函数
export async function cachedQuery(sql: string, params: any[] = [], cacheKey?: string, cacheTTL?: number) {
  // 如果提供了缓存键，检查缓存中是否存在结果
  if (cacheKey) {
    const cachedResult = queryCache.get(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cachedResult;
    }
  }

  // 缓存未命中，执行实际查询
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(sql, params);
    
    // 如果提供了缓存键，将结果存入缓存
    if (cacheKey) {
      queryCache.set(cacheKey, rows, {
        ttl: cacheTTL, // 可选的自定义TTL
      });
      console.log(`Cached query result for key: ${cacheKey}`);
    }
    
    return rows;
  } finally {
    connection.release();
  }
}

// 清除特定前缀的缓存
export function invalidateCache(keyPrefix: string) {
  const keysToDelete: string[] = [];
  
  // 先收集需要删除的键
  queryCache.keys().forEach(key => {
    if (key.startsWith(keyPrefix)) {
      keysToDelete.push(key);
    }
  });
  
  // 然后删除收集到的键
  keysToDelete.forEach(key => {
    queryCache.delete(key);
    console.log(`Invalidated cache for key: ${key}`);
  });
}

// 用于无需缓存的写操作
export async function executeQuery(sql: string, params: any[] = []) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(sql, params);
    return result;
  } finally {
    connection.release();
  }
}

export default pool; 