import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PopoverPage } from "@/components/feedback/popover";

const meta = {
  title: "Feedback/Popover",
  component: PopoverPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof PopoverPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
