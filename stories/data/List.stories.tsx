import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ListPage } from "@/components/data/list";

const meta = {
  title: "Data Display/List",
  component: ListPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ListPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
