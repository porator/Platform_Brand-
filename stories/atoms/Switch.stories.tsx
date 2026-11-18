import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SwitchPage } from "@/components/atoms/switch";

const meta = {
  title: "Atoms/Switch",
  component: SwitchPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof SwitchPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
