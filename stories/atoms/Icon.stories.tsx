import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconPage } from "@/components/atoms/icon";

const meta = {
  title: "Atoms/Icon",
  component: IconPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof IconPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
