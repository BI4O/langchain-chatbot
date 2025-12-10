"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { env } from "../lib/env";
import { X, Settings, Check, AlertCircle } from "lucide-react";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus: 'connected' | 'error';
}

export default function ConfigModal({ isOpen, onClose, initialStatus }: ConfigModalProps) {
  const [apiUrl, setApiUrl] = useQueryState("apiUrl", env.apiUrl);
  const [assistantId, setAssistantId] = useQueryState("assistantId", env.assistantId);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [tempAssistantId, setTempAssistantId] = useState(assistantId);

  const handleApply = () => {
    setApiUrl(tempApiUrl);
    setAssistantId(tempAssistantId);
    onClose();
  };

  const handleReset = () => {
    setTempApiUrl(env.apiUrl);
    setTempAssistantId(env.assistantId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {initialStatus === 'connected' ? 'Configuration' : 'Service Configuration'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Status */}
        <div className="mb-4 p-3 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2">
            {initialStatus === 'connected' ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-700">Service is connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">Service connection failed</span>
              </>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">
              API URL
            </label>
            <input
              id="apiUrl"
              type="text"
              value={tempApiUrl}
              onChange={(e) => setTempApiUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
              placeholder="http://localhost:2024"
            />
          </div>

          <div>
            <label htmlFor="assistantId" className="block text-sm font-medium text-gray-700 mb-1">
              Assistant ID
            </label>
            <input
              id="assistantId"
              type="text"
              value={tempAssistantId}
              onChange={(e) => setTempAssistantId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
              placeholder="agent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Reset to defaults
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-xs text-gray-500">
          <p>Start LangGraph service: <code className="bg-gray-100 px-1 rounded">langgraph up --port 2024</code></p>
        </div>
      </div>
    </div>
  );
}