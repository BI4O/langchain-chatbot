import { useState, useEffect } from "react";
import { UI_CONSTANTS } from "../lib/constants";

/**
 * 检测屏幕尺寸的自定义Hook
 * @returns isLargeScreen - 是否为大屏幕（宽度 >= 1024px）
 */
export function useScreenSize(): boolean {
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= UI_CONSTANTS.LARGE_SCREEN_BREAKPOINT);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return isLargeScreen;
}