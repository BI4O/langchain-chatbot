// 应用常量集中管理
// 所有硬编码数值统一定义在此处

export const UI_CONSTANTS = {
  // 屏幕断点
  LARGE_SCREEN_BREAKPOINT: 1024,

  // 侧边栏
  SIDEBAR_WIDTH: "256px",

  // 延迟时间（毫秒）
  THREAD_REFRESH_DELAY: 3000,
  SLEEP_DELAY: 4000,
  TOAST_DURATION: 10000,

  // 分页限制
  THREAD_SEARCH_LIMIT: 100,

  // 文本长度限制
  THREAD_TITLE_MAX_LENGTH: 40,
} as const;

// 动画相关常量
export const ANIMATION_CONSTANTS = {
  PULSE_DURATION: "1.5s",
  TRANSITION_DURATION: "300ms",
} as const;