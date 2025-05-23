# 招标数据分析平台

这是一个基于Next.js 14和MySQL的招标数据分析平台，提供招标数据的导入、分析和可视化功能。

## 功能特点

- **数据导入**：支持JSON格式招标数据的拖放上传和校验
- **数据分析**：提供多维度的招标数据分析（时间、地域、行业等）
- **数据可视化**：使用D3.js和Chart.js提供Apple风格的数据可视化
- **响应式设计**：适配各种设备的界面设计

## 技术栈

- **前端框架**：Next.js 14 (App Router)
- **UI设计**：Tailwind CSS (Apple风格)
- **数据库**：MySQL
- **ORM**：Prisma
- **数据可视化**：D3.js / Chart.js

## 开始使用

1. 安装依赖：
```bash
npm install
```

2. 设置环境变量：
创建`.env`文件并添加MySQL数据库连接信息：
```
DATABASE_URL="mysql://username:password@localhost:3306/tender_db"
```

3. 初始化数据库：
```bash
npx prisma migrate dev --name init
```

4. 启动开发服务器：
```bash
npm run dev
```

5. 访问 [http://localhost:3000](http://localhost:3000) 查看应用

## 数据结构

招标数据包含以下主要字段：
- `id`: 唯一标识符
- `title`: 招标标题
- `area`: 地区（省份）
- `city`: 城市
- `district`: 区县
- `buyer`: 采购方
- `industry`: 行业
- `publishTime`: 发布时间
- `budget`: 预算金额
- `bidAmount`: 中标金额
- 等等

## 主要功能模块

1. **数据导入与存储**
   - JSON文件上传
   - 数据校验和去重
   - MySQL数据存储

2. **数据分析与可视化**
   - 招标趋势分析
   - 地域分布热力图
   - 行业占比分析
   - 预算与实际成交价对比

3. **详情页面**
   - 项目详情展示
   - 关联项目推荐
   - 数据导出功能 #   z h a o t o u b i a o s h u j u  
 