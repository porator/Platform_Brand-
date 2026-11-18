import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BreakpointsPage } from "@/components/foundations/breakpoints";

const meta = {
  title: "Foundations/Breakpoints",
  component: BreakpointsPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof BreakpointsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
