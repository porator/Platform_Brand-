import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ContainerPage } from "@/components/layout/container";

const meta = {
  title: "Layout/Container",
  component: ContainerPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ContainerPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
