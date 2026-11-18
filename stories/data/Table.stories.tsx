import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TablePage } from "@/components/data/table";

const meta = {
  title: "Data Display/Table",
  component: TablePage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof TablePage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
