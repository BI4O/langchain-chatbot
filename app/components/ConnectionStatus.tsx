"use client";

import { useEffect, useState } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { env } from "../lib/env";
import ConfigModal from "./ConfigModal";

// 健康检查函数
async function checkGraphStatus(apiUrl: string, apiKey: string | null): Promise<boolean> {
  // 静默处理网络错误
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const res = await fetch(`${apiUrl}/info`, {
      ...(apiKey && { headers: { "X-Api-Key": apiKey } }),
    });
    return res.ok;
  } catch (e) {
    return false;
  } finally {
    console.error = originalConsoleError;
  }
}

export default function ConnectionStatus() {
  const [apiUrl] = useQueryState("apiUrl", parseAsString.withDefault(env.apiUrl));
  const [apiKey] = useQueryState("apiKey");
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!apiUrl) return;

    setStatus('loading');

    const checkConnection = async () => {
      const ok = await checkGraphStatus(apiUrl, apiKey);
      setStatus(ok ? 'connected' : 'error');
    };

    checkConnection();

    // 每30秒检查一次连接状态
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [apiUrl, apiKey]);

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
          <span className="text-xs text-red-600">Please start LangGraph service first</span>
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