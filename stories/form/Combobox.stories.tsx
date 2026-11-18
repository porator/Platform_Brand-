import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ComboboxPage } from "@/components/form/combobox";

const meta = {
  title: "Form & Controls/Combobox",
  component: ComboboxPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ComboboxPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
