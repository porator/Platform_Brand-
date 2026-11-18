import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardPage } from "@/components/data/card";

const meta = {
  title: "Data Display/Card",
  component: CardPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof CardPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
