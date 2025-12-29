"use client";

import { useEffect, useState } from "react";
import { useThreads } from "../provider/Thread";
import { Thread } from "@langchain/langgraph-sdk";
import { useQueryState, parseAsBoolean } from "nuqs";
import { getContentString } from "../lib/utils";
import { Menu, X, MessageSquarePlus, PanelRightOpen, PanelRightClose } from "lucide-react";
import { UI_CONSTANTS } from "../lib/constants";

function ThreadList({
  threads,
  onThreadClick,
  currentThreadId,
  setThreadId,
}: {
  threads: Thread[];
  onThreadClick?: (threadId: string) => void;
  currentThreadId?: string | null;
  setThreadId: (threadId: string | null) => void;
}) {
  return (
    <div className="h-full flex flex-col w-full max-h-full">
      {/* Thread List */}
      <div className="flex-1 w-full overflow-y-auto space-y-2 p-2 min-h-0">
        {threads.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-700">
            No chat history yet
          </div>
        ) : (
          threads.map((t) => {
            let itemText = `Chat ${t.thread_id.slice(0, 8)}...`;
            if (
              typeof t.values === "object" &&
              t.values &&
              "messages" in t.values &&
              Array.isArray(t.values.messages) &&
              t.values.messages?.length > 0
            ) {
              const firstMessage = t.values.messages[0];
              if (firstMessage.type === "human") {
                itemText = getContentString(firstMessage.content);
                // Limit title length
                if (itemText.length > UI_CONSTANTS.THREAD_TITLE_MAX_LENGTH) {
                  itemText = itemText.slice(0, UI_CONSTANTS.THREAD_TITLE_MAX_LENGTH) + "...";
                }
              }
            }

            return (
              <div key={t.thread_id} className="w-full">
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentThreadId === t.thread_id
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100 text-gray-900"
                  }`}
                  onClick={() => {
                    onThreadClick?.(t.thread_id);
                    if (t.thread_id === currentThreadId) return;
                    // Set the threadId in URL to switch to this thread
                    setThreadId(t.thread_id);
                  }}
                >
                  <p className="truncate text-sm font-medium">{itemText}</p>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ThreadHistoryLoading() {
  return (
    <div className="h-full flex flex-col w-full gap-2 items-start justify-start overflow-y-auto p-2">
      <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={`skeleton-${i}`} className="w-full h-9 bg-gray-100 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
}

export default function ThreadHistory() {
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(true)
  );
  const [apiUrl] = useQueryState("apiUrl");
  const [assistantId] = useQueryState("assistantId");

  const { getThreads, threads, setThreads, threadsLoading, setThreadsLoading } =
    useThreads();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!apiUrl || !assistantId) {
      setThreadsLoading(false);
      return;
    }
    setThreadsLoading(true);
    getThreads()
      .then((threads) => {
        setThreads(threads);
      })
      .catch((error) => {
        console.error("Failed to fetch threads:", error);
      })
      .finally(() => setThreadsLoading(false));
  }, [apiUrl, assistantId, getThreads]);

  
  const [threadId, setThreadId] = useQueryState("threadId");

  return (
    <>
      {/* Desktop Sidebar - Hidden when collapsed */}
      <div className={`hidden lg:flex flex-col border-r border-gray-200 bg-white h-screen fixed left-0 top-0 z-20 transition-transform duration-300 ease-in-out`}
           style={{
             width: UI_CONSTANTS.SIDEBAR_WIDTH,
             transform: chatHistoryOpen ? "translateX(0)" : "translateX(-100%)"
           }}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChatHistoryOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <PanelRightClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-2 min-h-0">
          {threadsLoading ? (
            <ThreadHistoryLoading />
          ) : (
            <ThreadList
              threads={threads}
              currentThreadId={threadId}
              setThreadId={setThreadId}
              onThreadClick={(threadId) => setThreadId(threadId)}
            />
          )}
        </div>
      </div>

      
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-10">
        <button
          onClick={() => setChatHistoryOpen(true)}
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      {chatHistoryOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setChatHistoryOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50">
            <div className="flex items-center justify-between w-full p-4 border-b border-gray-200">
              <h1 className="text-lg font-semibold">Chat History</h1>
              <button
                onClick={() => setChatHistoryOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-2">
              {threadsLoading ? (
                <ThreadHistoryLoading />
              ) : (
                <ThreadList
                  threads={threads}
                  onThreadClick={(threadId) => {
                    setThreadId(threadId);
                    setChatHistoryOpen(false);
                  }}
                  currentThreadId={threadId}
                  setThreadId={setThreadId}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}