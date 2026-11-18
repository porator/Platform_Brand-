import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ToastPage } from "@/components/feedback/toast";

const meta = {
  title: "Feedback/Toast",
  component: ToastPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ToastPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
