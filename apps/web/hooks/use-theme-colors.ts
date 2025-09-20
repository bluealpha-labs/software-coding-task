"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useThemeColors() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === "dark" : false

  const colors = {
    // Primary chart colors that work in both themes
    primary: isDark ? "#60a5fa" : "#2563eb", // blue-400 / blue-600
    secondary: isDark ? "#a78bfa" : "#7c3aed", // violet-400 / violet-600
    success: isDark ? "#34d399" : "#059669", // emerald-400 / emerald-600
    warning: isDark ? "#fbbf24" : "#d97706", // amber-400 / amber-600
    danger: isDark ? "#f87171" : "#dc2626", // red-400 / red-600
    info: isDark ? "#38bdf8" : "#0284c7", // sky-400 / sky-600
    
    // Chart-specific color palettes
    chartColors: isDark 
      ? [
          "#60a5fa", // blue-400
          "#a78bfa", // violet-400
          "#34d399", // emerald-400
          "#fbbf24", // amber-400
          "#f87171", // red-400
          "#38bdf8", // sky-400
          "#fb7185", // rose-400
          "#a3a3a3", // neutral-400
        ]
      : [
          "#2563eb", // blue-600
          "#7c3aed", // violet-600
          "#059669", // emerald-600
          "#d97706", // amber-600
          "#dc2626", // red-600
          "#0284c7", // sky-600
          "#e11d48", // rose-600
          "#525252", // neutral-600
        ],
    
    // Grid and axis colors
    grid: isDark ? "#374151" : "#e5e7eb", // gray-700 / gray-200
    axis: isDark ? "#6b7280" : "#374151", // gray-500 / gray-700
    text: isDark ? "#f3f4f6" : "#111827", // gray-100 / gray-900
    textMuted: isDark ? "#9ca3af" : "#6b7280", // gray-400 / gray-500
    
    // Background colors for tooltips and cards
    tooltipBg: isDark ? "#1f2937" : "#ffffff", // gray-800 / white
    cardBg: isDark ? "#111827" : "#ffffff", // gray-900 / white
  }

  return { colors, isDark, mounted }
}
