import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InputPage } from "@/components/atoms/input";

const meta = {
  title: "Atoms/Input",
  component: InputPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof InputPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
