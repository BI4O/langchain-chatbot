// 环境变量管理
// 所有环境变量的统一入口

export const env = {
  // API 配置
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:2024",
  assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID || "agent",

  // API Key（可选，如果 LangGraph 服务需要认证）
  apiKey: process.env.NEXT_PUBLIC_API_KEY,

  // 可选：LangSmith API key（用于监控）
  langsmithApiKey: process.env.NEXT_PUBLIC_LANGSMITH_API_KEY,

  // 获取所有配置（用于调试）
  getAll: () => ({
    apiUrl: env.apiUrl,
    assistantId: env.assistantId,
    apiKey: env.apiKey,
    langsmithApiKey: env.langsmithApiKey,
  }),
} as const;