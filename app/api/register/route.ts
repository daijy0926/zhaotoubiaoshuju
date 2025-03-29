import { NextRequest, NextResponse } from 'next/server';
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from 'crypto'; // 用于生成用户 ID

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // 1. 基本校验
    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 });
    }

    // 校验邮箱格式 (简单的正则)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
         return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }
    
    // 校验密码强度 (示例：至少6位)
    if (password.length < 6) {
      return NextResponse.json({ error: '密码长度至少为6位' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      // 2. 检查邮箱是否已被注册
      const [existingUsers] = await connection.query(
        'SELECT id FROM User WHERE email = ? LIMIT 1',
        [email]
      );

      if ((existingUsers as any[]).length > 0) {
        return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 }); // 409 Conflict
      }

      // 3. 哈希密码
      const hashedPassword = await bcrypt.hash(password, 10); // 10 是 salt rounds
      
      // 4. 生成用户 ID (使用 UUID)
      const userId = randomUUID();

      // 5. 插入新用户到数据库
      await connection.query(
        'INSERT INTO User (id, email, password, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [userId, email, hashedPassword, name || null] // 如果没有提供 name，则设为 null
      );

      // 6. 注册成功
      // 不要在响应中返回敏感信息
      return NextResponse.json({ success: true, message: '注册成功' }, { status: 201 }); // 201 Created

    } catch (error) {
      console.error("Registration error:", error);
      return NextResponse.json({ error: '注册过程中发生错误' }, { status: 500 });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error("Invalid request body:", error);
    return NextResponse.json({ error: '请求数据格式错误' }, { status: 400 });
  }
} 