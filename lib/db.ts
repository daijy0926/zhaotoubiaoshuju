import mysql from 'mysql2/promise';

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST ,
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool; 