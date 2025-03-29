import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// 创建处理程序
const handler = NextAuth(authOptions);

// 导出GET和POST处理函数
export { handler as GET, handler as POST };