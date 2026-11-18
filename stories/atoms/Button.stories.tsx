import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ButtonPage } from "@/components/atoms/button";

const meta = {
  title: "Atoms/Button",
  component: ButtonPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ButtonPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
