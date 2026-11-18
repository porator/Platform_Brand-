"use client"

import * as React from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  IconCircleCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertOctagon,
  IconLoader,
} from "@/lib/icons"

/**
 * This design system themes via the `.dark` class on <html> (see globals.css),
 * not next-themes. Detect that class so toasts match the active theme.
 */
function useThemeClass(): "light" | "dark" {
  const [theme, setTheme] = React.useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  )

  React.useEffect(() => {
    const el = document.documentElement
    const obs = new MutationObserver(() => {
      setTheme(el.classList.contains("dark") ? "dark" : "light")
    })
    obs.observe(el, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  return theme
}

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useThemeClass()

  return (
    <Sonner
      theme={theme}
      // The dashboard's own font (Sonner otherwise uses the system font).
      className="toaster group font-sans!"
      icons={{
        success: <IconCircleCheck className="size-4" />,
        info: <IconInfoCircle className="size-4" />,
        warning: <IconAlertTriangle className="size-4" />,
        error: <IconAlertOctagon className="size-4" />,
        loading: <IconLoader className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      toastOptions={{
        // Matched to the dashboard: its font, 16px corners and a soft shadow like its cards and menus; the title in
        // medium weight, the description muted; the action is the dashboard's dark pill button (gradient, shadow/md).
        classNames: {
          toast: "cn-toast font-sans! gap-3! rounded-2xl! p-4! shadow-lg!",
          title: "text-sm! font-medium! text-foreground!",
          description: "mt-0.5! text-[13px]! leading-snug! text-muted-foreground!",
          actionButton:
            "h-8.5! shrink-0! rounded-[200px]! bg-linear-to-b! from-[#272727]! to-[#302F2F]! px-3.5! text-sm! font-medium! text-white! shadow-md! hover:opacity-90!",
          cancelButton: "h-8.5! rounded-full! px-3.5! text-sm! font-medium!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
