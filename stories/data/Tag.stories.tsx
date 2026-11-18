import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TagPage } from "@/components/data/tag";

const meta = {
  title: "Data Display/Tag",
  component: TagPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof TagPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
