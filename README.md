# 环境变量配置（重要）

请在项目根目录下创建 `.env.local` 文件，内容如下：

```
NEXT_PUBLIC_API_BASE=https://api.funsoccer.app
```

这样所有API请求都会自动走HTTPS，避免混合内容报错。

# soccer-heatmap-next

本项目为“足球热力图展示前端”，基于 Next.js + Tailwind CSS 实现，主要功能为：
- 通过后端API动态获取设备ID和热力图数据，展示足球场热力图。
- 页面风格现代、响应式，主色调为红白。
- 其他球员信息、统计等内容全部为静态数据。

## 技术栈
- Next.js (App Router)
- TypeScript
- Tailwind CSS

## 依赖后端API接口
- `/api/device_ids` 获取设备ID列表
- `/api/heatmap?device_id=xxx` 获取热力图数据

## 目录结构
- `src/app`：页面与全局布局
- `src/components`：可复用UI组件
- `src/utils`：工具函数
- `public/`：静态资源

## 本地开发与部署

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发环境
```bash
npm run dev
```
默认访问地址：http://localhost:3000

### 3. 生产环境构建与启动
```bash
npm run build
npm start
```

### 4. API联调说明
- 请确保后端API服务已启动，并允许前端通过 `/api/device_ids` 和 `/api/heatmap?device_id=xxx` 访问。
- 如前后端分离部署，需配置Next.js的代理或将API地址改为完整后端URL。
- 若API跨域报错，可在开发环境下配置代理，或让后端支持CORS。

### 5. 常见问题排查
- **设备下拉菜单无数据**：请检查后端 `/api/device_ids` 是否正常返回。
- **热力图无显示**：请检查 `/api/heatmap?device_id=xxx` 是否有数据，或后端数据库是否有有效数据。
- **样式异常**：请确认Tailwind CSS已正确安装，或尝试重启开发服务。
- **图片不显示**：请将 `public/player-avatar.png` 替换为实际球员头像图片。

## 说明
- 仅实现热力图展示和设备切换功能。
- 其他内容全部静态，无需后端接口。
- 适合初学者和产品快速上手。

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
