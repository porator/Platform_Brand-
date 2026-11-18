import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FormFieldPage } from "@/components/form/form-field";

const meta = {
  title: "Form & Controls/Form Field",
  component: FormFieldPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof FormFieldPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
