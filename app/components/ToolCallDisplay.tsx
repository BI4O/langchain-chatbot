"use client";

import { Message } from "@langchain/langgraph-sdk";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function isComplexValue(value: any): boolean {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
}

export function ToolCallDisplay({ message }: { message: Message }) {
  if (message.type !== "tool") return null;

  const [isExpanded, setIsExpanded] = useState(false);

  let parsedContent: any;
  let isJsonContent = false;

  try {
    if (typeof message.content === "string") {
      parsedContent = JSON.parse(message.content);
      isJsonContent = true;
    }
  } catch {
    parsedContent = message.content;
  }

  const contentStr = isJsonContent
    ? JSON.stringify(parsedContent, null, 2)
    : String(message.content);
  const contentLines = contentStr.split("\n");
  const shouldTruncate = contentLines.length > 4 || contentStr.length > 500;
  const displayedContent =
    shouldTruncate && !isExpanded
      ? contentStr.length > 500
        ? contentStr.slice(0, 500) + "..."
        : contentLines.slice(0, 4).join("\n") + "\n..."
      : contentStr;

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
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                {(Array.isArray(parsedContent)
                  ? isExpanded
                    ? parsedContent
                    : parsedContent.slice(0, 5)
                  : Object.entries(parsedContent)
                ).map((item, argIdx) => {
                  const [key, value] = Array.isArray(parsedContent)
                    ? [argIdx, item]
                    : [item[0], item[1]];
                  return (
                    <tr key={argIdx}>
                      <td className="px-4 py-2 text-sm font-medium text-cyan-700 whitespace-nowrap">
                        {key}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {isComplexValue(value) ? (
                          <code className="bg-blue-50 text-blue-800 rounded px-2 py-1 font-mono text-sm break-all">
                            {JSON.stringify(value, null, 2)}
                          </code>
                        ) : (
                          <span className="text-emerald-700">{String(value)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <code className="text-sm block text-gray-700 bg-gray-50 p-2 rounded">{displayedContent}</code>
          )}
        </div>
        {((shouldTruncate && !isJsonContent) ||
          (isJsonContent &&
            Array.isArray(parsedContent) &&
            parsedContent.length > 5)) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 flex items-center justify-center border-t-[1px] border-gray-200 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all ease-in-out duration-200 cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}