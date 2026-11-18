import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BulkActionsPage } from "@/components/patterns/bulk-actions";

const meta = {
  title: "Patterns/Bulk Actions",
  component: BulkActionsPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof BulkActionsPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
