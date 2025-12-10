"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { env } from "../lib/env";

export default function RedirectWithParams() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if URL already has the required parameters
    if (searchParams.has("apiUrl") && searchParams.has("assistantId")) {
      return; // Already has parameters, no need to redirect
    }

    // Build URL manually to avoid encoding issues
    const newUrl = `/?apiUrl=${encodeURIComponent(env.apiUrl)}&assistantId=${env.assistantId}`;

    // Use window.location.href to force a full navigation
    window.location.href = newUrl;
  }, [searchParams]);

  // Return nothing while redirecting
  return null;
}