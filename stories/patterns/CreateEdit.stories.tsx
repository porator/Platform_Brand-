import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CreateEditPage } from "@/components/patterns/create-edit";

const meta = {
  title: "Patterns/Create / Edit",
  component: CreateEditPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof CreateEditPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
