# LangChain ChatBot - 极简聊天界面

一个连接本地 LangGraph 后端的极简聊天应用，专为学习和二次改造设计。
本地的 langchain1.0+ 的后端都是支持的，他们用 langgraph cli 来部署都是一样的。

## ✨ 特性

- 🚀 **极简设计** - 专注核心功能，无冗余代码
- 💬 **流式对话** - 实时 AI 响应，流畅体验
- 📝 **对话历史** - 左侧边栏管理多轮对话，支持独立 Assistant 历史记录
- 🛠️ **工具调用** - 可视化展示 AI 工具执行过程
- 🎨 **响应式布局** - 完美适配桌面和移动端
- 🔧 **易于扩展** - 清晰的代码结构，便于二次开发
- 🔄 **智能配置** - 灵活切换 Assistant ID 和 API 端点，实时连接状态检测
- ⚡ **即时切换** - 切换 Assistant 时对话历史立即更新，无需刷新

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
- **多 Assistant 支持** - 独立的 Assistant 配置和对话历史
- **工具调用** - AI 可调用外部工具，可视化展示执行过程
- **对话管理** - 创建、切换、删除对话历史
- **实时流式** - 逐字显示 AI 思考过程
- **智能连接检测** - 实时验证 Assistant ID 有效性和服务状态
- **配置热切换** - 无需重启即可切换不同的 Assistant 和后端服务

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

### 配置界面使用

1. **点击连接状态指示器**（绿点/红点）打开配置界面
2. **修改配置**：
   - **API URL**: LangGraph 后端服务地址（默认：`http://localhost:2024`）
   - **Assistant ID**: 要连接的 Assistant 或 Graph ID（默认：`agent`）
3. **应用配置**：
   - **Apply**: 应用新配置，清空当前对话开始新的会话
   - **Reset & Apply**: 恢复默认配置并应用

### 多 Assistant 管理

- 每个 Assistant 拥有独立的对话历史
- 切换 Assistant 时自动清空当前对话，避免上下文混乱
- 支持通过 URL 参数快速切换：`?assistantId=abc&apiUrl=http://localhost:2024`

### 连接状态说明

- **🟢 绿点**: 服务连接正常，Assistant ID 有效
- **🔴 红点**: 服务不可用或 Assistant ID 无效
- **🟡 黄点**: 正在连接中

---

**极简而不简单** - 专注核心体验，为开发者提供清晰的学习和改造基础。
