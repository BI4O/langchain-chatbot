import type { Message } from "@langchain/langgraph-sdk";

export function getContentString(content: Message["content"]): string {
  if (typeof content === "string") return content;
  const texts = content
    .filter((c): c is { type: "text"; text: string } => c.type === "text")
    .map((c) => c.text);
  return texts.join(" ");
}

export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

// URL 工具函数
// 统一管理 URL 参数的构建和导航逻辑

export interface UrlParams {
  apiUrl?: string;
  assistantId?: string;
  threadId?: string | null;
  [key: string]: string | null | undefined;
}

/**
 * 构建带参数的 URL
 */
export function buildUrlWithParams(baseUrl: string, params: UrlParams): string {
  const url = new URL(baseUrl);

  // Set all provided parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

/**
 * 导航到新的配置
 * @param params - URL 参数
 * @param currentUrl - 当前 URL，可选
 */
export function navigateToConfig(params: UrlParams, currentUrl?: string): void {
  const baseUrl = currentUrl || window.location.href;
  const newUrl = buildUrlWithParams(baseUrl, params);

  if (newUrl !== window.location.href) {
    window.location.href = newUrl;
  }
}

/**
 * 获取当前 URL 参数
 */
export function getCurrentUrlParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
}