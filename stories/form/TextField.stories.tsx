import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TextFieldPage } from "@/components/form/text-field";

const meta = {
  title: "Form & Controls/Text Field",
  component: TextFieldPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof TextFieldPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
