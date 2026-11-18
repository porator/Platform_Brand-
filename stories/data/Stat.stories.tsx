import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatPage } from "@/components/data/stat";

const meta = {
  title: "Data Display/Stat",
  component: StatPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof StatPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
