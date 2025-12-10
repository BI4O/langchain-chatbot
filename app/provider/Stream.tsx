"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";
import {
  uiMessageReducer,
  type UIMessage,
  type RemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { useQueryState } from "nuqs";
import { env } from "../lib/env";
import { UI_CONSTANTS } from "../lib/constants";
import { toast } from "sonner";
import { useThreads } from "./Thread";

// 类型定义
export type StateType = {
  messages: Message[];
  ui?: UIMessage[];
};

const useTypedStream = useStream<
  StateType,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
    };
    CustomEventType: UIMessage | RemoveUIMessage;
  }
>;

type StreamContextType = ReturnType<typeof useTypedStream>;
const StreamContext = createContext<StreamContextType | undefined>(undefined);

async function sleep(ms = UI_CONSTANTS.SLEEP_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 健康检查函数
async function checkGraphStatus(apiUrl: string, apiKey: string | null): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/info`, {
      ...(apiKey && { headers: { "X-Api-Key": apiKey } }),
    });
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// Stream Session 组件
const StreamSession = ({
  children,
  apiKey,
  apiUrl,
  assistantId,
}: {
  children: ReactNode;
  apiKey: string | null;
  apiUrl: string;
  assistantId: string;
}) => {
  const [threadId, setThreadId] = useQueryState("threadId");
  const { getThreads, setThreads } = useThreads();

  const streamValue = useTypedStream({
    apiUrl,
    apiKey: apiKey ?? undefined,
    assistantId,
    threadId: threadId ?? null,
    onCustomEvent: (event, options) => {
      options.mutate((prev) => {
        const ui = uiMessageReducer(prev.ui ?? [], event);
        return { ...prev, ui };
      });
    },
    onThreadId: (id) => {
      setThreadId(id);
      // Refetch threads list when thread ID changes.
      // Wait for some seconds before fetching so we're able to get the new thread that was created.
      sleep().then(() => getThreads().then(setThreads).catch(console.error));
    },
  });

  // 监听消息变化，更新线程列表
  useEffect(() => {
    const messages = streamValue.values?.messages;
    if (messages && messages.length > 0 && threadId) {
      // 当有新消息时，延迟刷新线程列表以更新标题
      const timeoutId = setTimeout(() => {
        getThreads().then(setThreads).catch(console.error);
      }, UI_CONSTANTS.THREAD_REFRESH_DELAY); // 延迟刷新

      return () => clearTimeout(timeoutId);
    }
  }, [streamValue.values?.messages, threadId, getThreads, setThreads]);

  // 健康检查
  useEffect(() => {
    checkGraphStatus(apiUrl, apiKey).then((ok) => {
      if (!ok) {
        toast.error("Failed to connect to LangGraph server", {
          description: `Unable to connect to ${apiUrl}`,
          duration: UI_CONSTANTS.TOAST_DURATION,
          richColors: true,
          closeButton: true,
        });
      }
    });
  }, [apiUrl, apiKey]);

  return (
    <StreamContext.Provider value={streamValue}>
      {children}
    </StreamContext.Provider>
  );
};

// Stream Provider 组件
export const StreamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Read from environment variables via env module
  const [apiUrl] = useQueryState("apiUrl", env.apiUrl);
  const [assistantId] = useQueryState("assistantId", env.assistantId);

  // API key from environment variables
  const apiKey = env.apiKey;

  return (
    <StreamSession apiKey={apiKey} apiUrl={apiUrl} assistantId={assistantId}>
      {children}
    </StreamSession>
  );
};

// 自定义Hook
export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};

export default StreamContext;