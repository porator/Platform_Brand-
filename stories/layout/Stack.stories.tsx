import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StackPage } from "@/components/layout/stack";

const meta = {
  title: "Layout/Stack",
  component: StackPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof StackPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
