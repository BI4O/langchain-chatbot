"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { env } from "../lib/env";

export default function RedirectWithParams() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only redirect if the URL has NO query parameters at all
    // This ensures we only redirect from plain localhost:3000 or localhost:3000/
    const hasAnyParams = Array.from(searchParams.keys()).length > 0;

    if (hasAnyParams) {
      return; // URL already has some parameters, don't redirect
    }

    // Build URL with default parameters only for clean URLs
    const newUrl = `/?apiUrl=${encodeURIComponent(env.apiUrl)}&assistantId=${env.assistantId}`;
    window.location.href = newUrl;
  }, [searchParams]);

  // Return nothing while redirecting
  return null;
}