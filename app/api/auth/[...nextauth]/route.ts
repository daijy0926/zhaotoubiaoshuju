import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db"; // 引入我们的数据库连接池
import bcrypt from "bcryptjs"; // 用于密码比较
// import { randomUUID } from 'crypto'; // 不在此处需要
// import { NextRequest, NextResponse } from 'next/server'; // 不在此处需要

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
             // console.log("User not found for email:", credentials.email); // 调试日志
            throw new Error("用户不存在");
          }

          const user = users[0];

          // 2. 比较密码哈希值
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password // 数据库中存储的是哈希值
          );

          if (!isPasswordValid) {
            // console.log("Password mismatch for user:", user.email); // 调试日志
            throw new Error("密码错误");
          }

          // console.log("Authorization successful for:", user.email); // 调试日志
          // 3. 验证成功，返回用户信息（不要返回密码）
          // 返回的对象将存储在 JWT 或数据库会话中
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
           console.error("Authorize error:", error); // 打印详细错误
           // 抛出错误以便 NextAuth 知道授权失败
           if (error instanceof Error) {
               throw new Error(error.message || "认证时发生错误");
           }
           throw new Error("认证时发生未知错误");
        } finally {
          connection.release();
        }
      },
    }),
    // 可以添加其他 Provider，例如 Google, GitHub 等
  ],
  // Session 配置
  session: {
    strategy: "jwt", // 使用 JWT 存储会话信息，也可以用 'database'
  },
  // Callbacks 配置
  callbacks: {
    async jwt({ token, user }) {
      // 当用户登录时 (user 对象存在)，将用户 ID 添加到 JWT token 中
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // 将 JWT token 中的用户 ID 添加到 session 对象中
      // 这样在客户端可以通过 useSession() 或 getServerSession() 访问用户 ID
      if (token && session.user) {
         // 需要扩展 Session 类型以包含 id
         (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  // Pages 配置 (可选，自定义登录页等)
  // pages: {
  //   signIn: '/auth/signin',
  //   // signOut: '/auth/signout',
  //   // error: '/auth/error', // Error code passed in query string as ?error=
  //   // verifyRequest: '/auth/verify-request', // (used for email/magic link sign in)
  //   // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  // },
  // 数据库适配器 (如果 session strategy 是 'database' 或需要持久化 OAuth 账户)
  // adapter: PrismaAdapter(prisma), // 需要安装 @next-auth/prisma-adapter
  secret: process.env.NEXTAUTH_SECRET, // 从环境变量读取密钥
  // Debugging (开发时有用)
  // debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; // 导出 GET 和 POST 处理程序

// --- 移除下方错误添加的注册逻辑 ---
// export async function POST(request: NextRequest) { ... } 
// --- 移除结束 --- 