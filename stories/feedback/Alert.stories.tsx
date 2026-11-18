import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AlertPage } from "@/components/feedback/alert";

const meta = {
  title: "Feedback/Alert",
  component: AlertPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof AlertPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
