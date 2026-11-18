import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DatePickerPage } from "@/components/form/date-picker";

const meta = {
  title: "Form & Controls/Date Picker",
  component: DatePickerPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof DatePickerPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
