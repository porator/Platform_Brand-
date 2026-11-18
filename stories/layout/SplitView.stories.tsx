import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SplitViewPage } from "@/components/layout/split-view";

const meta = {
  title: "Layout/Split View",
  component: SplitViewPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof SplitViewPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
