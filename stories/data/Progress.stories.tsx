import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProgressPage } from "@/components/data/progress";

const meta = {
  title: "Data Display/Progress",
  component: ProgressPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ProgressPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
