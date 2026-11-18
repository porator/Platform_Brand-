import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DividerPage } from "@/components/atoms/divider";

const meta = {
  title: "Atoms/Divider",
  component: DividerPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof DividerPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
