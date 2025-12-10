"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStreamContext } from "../provider/Stream";
import { type Message } from "@langchain/langgraph-sdk";
import { v4 as uuidv4 } from "uuid";
import { useQueryState, parseAsBoolean } from "nuqs";
import ThreadHistory from "./ThreadHistory";
import { ToolCallDisplay } from "./ToolCallDisplay";
import { PanelRightOpen, MessageSquarePlus } from "lucide-react";
import { useScreenSize } from "../hooks/useScreenSize";
import { UI_CONSTANTS } from "../lib/constants";

export default function Chat() {
  const stream = useStreamContext();
  const { messages, isLoading } = stream;
  const [input, setInput] = useState("");
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hideToolCalls, setHideToolCalls] = useQueryState(
    "hideToolCalls",
    parseAsBoolean.withDefault(false)
  );
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(true)
  );
  const [threadId, setThreadId] = useQueryState("threadId");
  const isLargeScreen = useScreenSize();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Track if we've received the first token of the current AI response
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const hasAIMessage = messages.length > 0 && lastMessage?.type === "ai";

    if (hasAIMessage && !firstTokenReceived) {
      setFirstTokenReceived(true);
    } else if (!isLoading && firstTokenReceived) {
      setFirstTokenReceived(false);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newHumanMessage: Message = {
      id: uuidv4(),
      type: "human",
      content: input,
    };

    setInput("");
    setFirstTokenReceived(false);

    try {
      await stream.submit(
        { messages: [...messages, newHumanMessage] },
        {
          streamMode: ["values"],
          optimisticValues: (prev) => ({
            ...prev,
            messages: [...(prev.messages ?? []), newHumanMessage],
          }),
        },
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex w-full h-screen bg-gray-50 overflow-hidden">
      {/* Thread History Sidebar */}
      <ThreadHistory />

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300`}
           style={{ marginLeft: isLargeScreen ? (chatHistoryOpen ? UI_CONSTANTS.SIDEBAR_WIDTH : "0px") : "0" }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Toggle Sidebar Button - Only show when sidebar is collapsed */}
            {!chatHistoryOpen && isLargeScreen && (
              <button
                onClick={() => setChatHistoryOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                title="Open Chat History"
              >
                <PanelRightOpen className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              // Clear threadId to start new chat
              setThreadId(null);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            title="New Chat"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
        </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Start a conversation with the AI assistant</p>
            </div>
          ) : (
            messages.map((message, index) => {
              // Skip empty content messages
              const content = typeof message.content === "string"
                ? message.content
                : JSON.stringify(message.content);

              if (!content || content.trim() === '') {
                return null;
              }

              // Handle tool messages with custom display
              if (message.type === 'tool') {
                return hideToolCalls ? null : <ToolCallDisplay key={index} message={message} />;
              }

              return (
                <div
                  key={index}
                  className={`flex ${message.type === 'human' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-lg px-4 py-2 rounded-lg ${
                      message.type === 'human'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {content}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {/* Loading indicator - only show when loading and no AI message has appeared yet */}
          {isLoading && !firstTokenReceived && (
            <div className="flex items-start mr-auto gap-2">
              <div className="flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-2 h-8">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[pulse_1.5s_ease-in-out_0.5s_infinite]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[pulse_1.5s_ease-in-out_1s_infinite]"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="bg-gray-50 rounded-lg border p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.metaKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border-none bg-transparent resize-none outline-none focus:outline-none text-gray-900 placeholder:text-gray-500"
              disabled={isLoading}
              rows={1}
            />

            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hide-tool-calls"
                  checked={hideToolCalls}
                  onChange={(e) => setHideToolCalls(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="hide-tool-calls" className="text-sm text-gray-600">
                  Hide Tool Calls
                </label>
              </div>

              {isLoading ? (
                <button
                  type="button"
                  onClick={() => stream.stop?.()}
                  className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center gap-2"
                >
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Cancel
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Send
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}