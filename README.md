# LangChain ChatBot - 极简聊天界面

一个连接本地 LangGraph 后端的极简聊天应用，专为学习和二次改造设计。
本地的 langchain1.0 + 的后端都是支持的，他们用langgraph cli来部署都是一样的。

## ✨ 特性

- 🚀 **极简设计** - 专注核心功能，无冗余代码
- 💬 **流式对话** - 实时 AI 响应，流畅体验
- 📝 **对话历史** - 左侧边栏管理多轮对话
- 🛠️ **工具调用** - 可视化展示 AI 工具执行过程
- 🎨 **响应式布局** - 完美适配桌面和移动端
- 🔧 **易于扩展** - 清晰的代码结构，便于二次开发

## 🚀 快速开始

### 1. 启动 LangGraph 后端

```bash
# 确保你的 LangGraph 服务运行在默认端口
langgraph up --port 2024

# 或者开发模式
langgraph dev
```

### 2. 配置环境变量

复制环境变量模板文件：

```bash
cp .env.example .env
```

然后根据需要编辑 `.env` 文件配置你的服务地址和认证信息。

### 3. 启动项目

```bash
pnpm i
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始聊天。

## 🎯 核心功能

- **智能对话** - 支持多轮对话，上下文理解
- **工具调用** - AI 可调用外部工具，可视化展示执行过程
- **对话管理** - 创建、切换、删除对话历史
- **实时流式** - 逐字显示 AI 思考过程

## 🛠️ 技术栈

- **前端框架**: Next.js 16 + React 19
- **AI 集成**: LangGraph SDK
- **状态管理**: React Context + nuqs
- **样式**: Tailwind CSS
- **类型安全**: TypeScript

## 📁 项目结构

```
app/
├── components/          # UI 组件
│   ├── Chat.tsx              # 主聊天界面
│   ├── ThreadHistory.tsx     # 对话历史侧边栏
│   ├── ToolCallDisplay.tsx   # 工具调用展示
│   ├── ConnectionStatus.tsx  # 服务连接状态
│   └── RedirectWithParams.tsx # URL 参数重定向
├── provider/            # 状态管理
│   ├── Stream.tsx            # 流式数据管理
│   ├── Thread.tsx            # 对话管理
│   └── client.ts             # LangGraph 客户端
├── lib/                # 工具函数
│   ├── constants.ts          # 常量配置
│   ├── env.ts               # 环境变量管理
│   └── utils.ts             # 通用工具函数
├── hooks/              # 自定义 Hook
│   └── useScreenSize.ts      # 屏幕尺寸检测
├── layout.tsx          # 根布局组件
├── page.tsx            # 主页面组件
└── globals.css         # 全局样式
```

## 🎨 自定义配置

所有配置通过环境变量管理，查看 `app/lib/env.ts` 了解完整配置选项。

---

**极简而不简单** - 专注核心体验，为开发者提供清晰的学习和改造基础。
