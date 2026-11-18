import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SelectPage } from "@/components/form/select";

const meta = {
  title: "Form & Controls/Select",
  component: SelectPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof SelectPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
