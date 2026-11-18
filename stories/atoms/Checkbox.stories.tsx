import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CheckboxPage } from "@/components/atoms/checkbox";

const meta = {
  title: "Atoms/Checkbox",
  component: CheckboxPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof CheckboxPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
