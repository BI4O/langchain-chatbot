"use client";

import { useEffect, useState } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { env } from "../lib/env";
import ConfigModal from "./ConfigModal";

// 健康检查函数 - 验证服务可用性和Assistant ID有效性
async function checkGraphStatus(apiUrl: string, apiKey: string | null, assistantId: string): Promise<boolean> {
  // 静默处理网络错误
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    // 首先检查服务是否运行
    const infoRes = await fetch(`${apiUrl}/info`, {
      ...(apiKey && { headers: { "X-Api-Key": apiKey } }),
    });

    if (!infoRes.ok) {
      return false;
    }

    // 创建一个测试thread来验证assistant ID是否有效
    const threadRes = await fetch(`${apiUrl}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { "X-Api-Key": apiKey }),
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        messages: [{ role: "user", content: "test" }]
      })
    });

    if (!threadRes.ok) {
      return false;
    }

    const threadData = await threadRes.json();
    const threadId = threadData.thread_id;

    // 尝试运行一个简单请求来真正验证assistant ID
    const runRes = await fetch(`${apiUrl}/threads/${threadId}/runs/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { "X-Api-Key": apiKey }),
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        input: { messages: [{ role: "user", content: "test" }] }
      })
    });

    // 清理测试thread
    try {
      await fetch(`${apiUrl}/threads/${threadId}`, {
        method: 'DELETE',
        ...(apiKey && { headers: { "X-Api-Key": apiKey } }),
      });
    } catch (e) {
      // 忽略清理错误
    }

    return runRes.ok;
  } catch (e) {
    return false;
  } finally {
    console.error = originalConsoleError;
  }
}

export default function ConnectionStatus() {
  const [apiUrl] = useQueryState("apiUrl", parseAsString.withDefault(env.apiUrl));
  const [apiKey] = useQueryState("apiKey");
  const [assistantId] = useQueryState("assistantId", parseAsString.withDefault(env.assistantId));
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!apiUrl || !assistantId) return;

    setStatus('loading');

    const checkConnection = async () => {
      const ok = await checkGraphStatus(apiUrl, apiKey, assistantId);
      setStatus(ok ? 'connected' : 'error');
    };

    checkConnection();

    // 每30秒检查一次连接状态
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [apiUrl, apiKey, assistantId]);

  const handleStatusClick = () => {
    setIsModalOpen(true);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-1 cursor-pointer group" onClick={handleStatusClick} title="Click to configure service">
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse group-hover:scale-110 transition-all duration-200"></div>
        <span className="text-xs text-gray-500">connecting...</span>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <>
        <div className="flex items-center gap-1 cursor-pointer group" onClick={handleStatusClick} title="Click to configure service">
          <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-all duration-200 group-hover:scale-110"></div>
        </div>
        <ConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialStatus="connected"
        />
      </>
    );
  }

  if (status === 'error') {
    return (
      <>
        <div className="flex items-center gap-2 cursor-pointer group" onClick={handleStatusClick} title="Click to configure service">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse hover:bg-red-600 transition-all duration-200 group-hover:scale-110"></div>
          <span className="text-xs text-red-600">Connection failed - check service or Assistant ID</span>
        </div>
        <ConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialStatus="error"
        />
      </>
    );
  }

  return null;
}