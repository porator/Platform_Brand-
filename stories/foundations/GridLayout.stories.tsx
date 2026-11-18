import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GridLayoutPage } from "@/components/foundations/grid";

const meta = {
  title: "Foundations/Grid & Layout",
  component: GridLayoutPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof GridLayoutPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
