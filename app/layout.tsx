import type { Metadata } from "next";
// The fonts are the design system's own (newgen-system-design/src/styles/fonts.css, vendored with its files):
// Manrope for the UI, Geist Mono for code, Gellix (font-brand) for the onboarding and Create project screens.
import "@/components/newgen-system-design/styles/fonts.css";
import "./globals.css";
import { cn } from "@/lib/utils";
import { MeasureTool } from "@/components/dev/measure-tool";

export const metadata: Metadata = {
  title: "Usability Test · Projects & Navigation",
  description: "Appcharge New Gen dashboard prototype: a first-time user's view, for usability testing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Pixel Measurement Mode: local development, or ?measure=1 only (never shown to participants otherwise). */}
        <MeasureTool />
      </body>
    </html>
  );
}
