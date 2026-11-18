import * as React from "react";
import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import { Manrope, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "../components/ui/tooltip";
import { Toaster } from "../components/ui/sonner";

// Load the same fonts the Next.js app uses so Storybook typography matches
// the production design system 1:1.
const fontSans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// Design tokens + Tailwind layer. This is the single source of truth for the
// Appcharge Design System theme (light + dark), shared with the Next.js app.
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Surface a11y findings in the panel without failing the build.
      test: "todo",
    },
    options: {
      storySort: {
        order: [
          "Introduction",
          "Foundations",
          [
            "Colors",
            "Typography",
            "Spacing",
            "Grid & Layout",
            "Icons",
            "Elevation",
            "Motion",
            "Breakpoints",
          ],
          "Atoms",
          [
            "Button",
            "Icon",
            "Badge",
            "Avatar",
            "Divider",
            "Checkbox",
            "Radio",
            "Switch",
            "Input",
          ],
          "Form & Controls",
          [
            "Text Field",
            "Select",
            "Combobox",
            "Date Picker",
            "Slider",
            "Search",
            "Form Field",
          ],
          "Navigation",
          [
            "Sidebar",
            "Top Bar",
            "Tabs",
            "Breadcrumbs",
            "Pagination",
            "Stepper",
            "Full Application Shell",
            "Project Hierarchy",
          ],
          "Data Display",
          [
            "Table",
            "List",
            "Card",
            "Stat",
            "Tag",
            "Progress",
            "Empty State",
            "Project List",
            "Builds Table",
            "Release Overview",
            "Empty Projects",
            "Application Context",
          ],
          "Feedback",
          [
            "Alert",
            "Toast",
            "Banner",
            "Tooltip",
            "Popover",
            "Modal",
            "Drawer",
            "Confirmation",
          ],
          "Layout",
          [
            "Container",
            "Stack",
            "Grid",
            "Split View",
            "Page Layout",
            "Responsive Layout",
          ],
          "Patterns",
          [
            "Filters",
            "Search & Filter",
            "Create / Edit",
            "Bulk Actions",
            "Settings",
            "Onboarding",
            "Confirmation Flows",
          ],
          "Layout + Patterns",
          [
            "Project Management",
            "Create Project",
            "Editor Workflow",
            "Onboarding",
            "Responsive Application",
          ],
          "Product Components",
          [
            "Project Selector",
            "Environment Selector",
            "Project Context Header",
            "Build Status",
            "Release Card",
            "Tester List",
            "App Preview",
            "Resource Navigation",
            "Project Overview",
            "Application Context",
          ],
          "Pages",
          [
            "Dashboard",
            "Projects",
            "Project Overview",
            "Builds",
            "Testers",
            "Releases",
            "Editor",
            "Project Settings",
          ],
        ],
      },
    },
  },

  decorators: [
    // Toolbar toggle for light / dark. Applies the `.dark` class (which the
    // token CSS keys off) to the preview <html> element.
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
    // Apply the font variables + base canvas styling to every story so the
    // story surface reads like a real page in the product.
    (Story) => (
      <div
        className={`${fontSans.variable} ${fontMono.variable} font-sans bg-background text-foreground min-h-svh w-full`}
      >
        <TooltipProvider>
          <Story />
          <Toaster />
        </TooltipProvider>
      </div>
    ),
  ],

  tags: ["autodocs"],
};

export default preview;
