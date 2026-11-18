import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GridPage } from "@/components/layout/grid";

const meta = {
  title: "Layout/Grid",
  component: GridPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof GridPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
