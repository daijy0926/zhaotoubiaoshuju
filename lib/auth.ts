import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // Provider 配置
      name: "Credentials", // 显示在登录页上的名称
      credentials: {
        email: { label: "邮箱", type: "email", placeholder: "user@example.com" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials, req) {
        // 这里的逻辑是验证用户凭证
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        const connection = await pool.getConnection();
        try {
          // 1. 根据邮箱查询用户
          const [rows] = await connection.query(
            'SELECT id, email, password, name FROM User WHERE email = ? LIMIT 1',
            [credentials.email]
          );

          const users = rows as any[];
          if (users.length === 0) {
            throw new Error("用户不存在");
          }

          const user = users[0];

          // 2. 比较密码哈希值
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password // 数据库中存储的是哈希值
          );

          if (!isPasswordValid) {
            throw new Error("密码错误");
          }

          // 3. 验证成功，返回用户信息（不要返回密码）
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          if (error instanceof Error) {
            throw new Error(error.message || "认证时发生错误");
          }
          throw new Error("认证时发生未知错误");
        } finally {
          connection.release();
        }
      },
    }),
  ],
  // Session 配置
  session: {
    strategy: "jwt",
  },
  // Callbacks 配置
  callbacks: {
    async jwt({ token, user }) {
      // 当用户登录时，将用户ID添加到JWT token中
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // 将JWT token中的用户ID添加到session对象中
      if (token && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  // 可以添加自定义页面配置
  // pages: {
  //   signIn: '/auth/signin',
  // },
  secret: process.env.NEXTAUTH_SECRET,
}; 