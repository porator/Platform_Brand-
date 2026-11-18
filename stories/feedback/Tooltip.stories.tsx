import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TooltipPage } from "@/components/feedback/tooltip";

const meta = {
  title: "Feedback/Tooltip",
  component: TooltipPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof TooltipPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
