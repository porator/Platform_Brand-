import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MotionPage } from "@/components/foundations/motion";

const meta = {
  title: "Foundations/Motion",
  component: MotionPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof MotionPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
