import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppShellPage } from "@/components/navigation/shell";

const meta = {
  title: "Navigation/Full Application Shell",
  component: AppShellPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof AppShellPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
