import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BadgePage } from "@/components/atoms/badge";

const meta = {
  title: "Atoms/Badge",
  component: BadgePage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof BadgePage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
