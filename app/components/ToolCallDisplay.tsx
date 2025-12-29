"use client";

import { Message } from "@langchain/langgraph-sdk";
import { useState } from "react";

// 统一的显示阈值常量
const DISPLAY_LIMITS = {
  MAX_LINES: 3,           // 最大显示行数
  MIN_CHARS_FOR_TOGGLE: 100, // 最少字符数才显示折叠按钮
  TRUNCATE_LINES: 3,      // 截断行数
} as const;

function isComplexValue(value: any): boolean {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
}

// 统一的内容处理函数
function processContent(content: any): {
  processedContent: string;
  shouldShowToggle: boolean;
  isJsonContent: boolean;
  parsedContent?: any;
} {
  let isJsonContent = false;
  let parsedContent: any;

  // 尝试解析 JSON
  try {
    if (typeof content === "string") {
      parsedContent = JSON.parse(content);
      isJsonContent = true;
    }
  } catch {
    parsedContent = content;
  }

  // 统一转换为字符串进行行数计算
  const contentStr = isJsonContent
    ? JSON.stringify(parsedContent, null, 2)
    : String(content);

  const contentLines = contentStr.split("\n");

  // 统一判断是否需要折叠 - 降低阈值，更容易展示折叠功能
  const shouldShowToggle = contentLines.length > DISPLAY_LIMITS.MAX_LINES ||
                          contentStr.length > DISPLAY_LIMITS.MIN_CHARS_FOR_TOGGLE;

  return {
    processedContent: contentStr,
    shouldShowToggle,
    isJsonContent,
    parsedContent
  };
}

// 新的折叠按钮组件
function ExpandButton({ isExpanded, onClick }: {
  isExpanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2 px-4 flex items-center justify-center gap-1
               border-t border-gray-200 text-indigo-600 hover:text-indigo-700
               hover:bg-indigo-50 transition-all duration-200 text-sm font-medium"
    >
      <span>{isExpanded ? "Collapse" : "Show more"}</span>
      {!isExpanded && <span className="text-xs text-gray-500 ml-1">↓</span>}
    </button>
  );
}

// JSON 表格渲染函数
function renderJsonTable(parsedContent: any, isExpanded: boolean) {
  const items = Array.isArray(parsedContent) ? parsedContent : Object.entries(parsedContent);
  const displayItems = isExpanded ? items : items.slice(0, DISPLAY_LIMITS.MAX_LINES);

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <tbody className="divide-y divide-gray-200">
        {displayItems.map((item, idx) => {
          const [key, value] = Array.isArray(parsedContent)
            ? [idx, item]
            : [item[0], item[1]];

          return (
            <tr key={idx}>
              <td className="px-4 py-2 text-sm font-medium text-cyan-700 whitespace-nowrap">
                {key}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {isComplexValue(value) ? (
                  <code className="bg-blue-50 text-blue-800 rounded px-2 py-1
                               font-mono text-sm break-all max-w-xs overflow-hidden">
                    {JSON.stringify(value, null, 2)}
                  </code>
                ) : (
                  <span className="text-emerald-700 break-words">
                    {String(value)}
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ToolCallDisplay({ message }: { message: Message }) {
  if (message.type !== "tool") return null;

  const [isExpanded, setIsExpanded] = useState(false);

  // 处理内容
  const { processedContent, shouldShowToggle, isJsonContent, parsedContent } =
    processContent(message.content);

  // 计算显示内容 - 如果需要折叠且未展开，总是显示前3行 + "..."
  const displayedContent = shouldShowToggle && !isExpanded && !isJsonContent
    ? processedContent.split('\n').slice(0, DISPLAY_LIMITS.TRUNCATE_LINES).join('\n') + '\n...'
    : processedContent;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden my-2">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {message.name ? (
            <h3 className="font-medium text-indigo-700 text-sm">
              Tool Result:{" "}
              <code className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">
                {message.name}
              </code>
            </h3>
          ) : (
            <h3 className="font-medium text-indigo-700 text-sm">Tool Result</h3>
          )}
          {message.tool_call_id && (
            <code className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
              {message.tool_call_id}
            </code>
          )}
        </div>
      </div>
      <div className="min-w-full bg-gray-100">
        <div className="p-3">
          {isJsonContent ? (
            renderJsonTable(parsedContent, isExpanded)
          ) : (
            <code className="text-sm block text-gray-700 bg-gray-50 p-2 rounded">{displayedContent}</code>
          )}
        </div>
        {/* 折叠按钮 - 只在需要时显示 */}
        {shouldShowToggle && (
          <ExpandButton
            isExpanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        )}
      </div>
    </div>
  );
}