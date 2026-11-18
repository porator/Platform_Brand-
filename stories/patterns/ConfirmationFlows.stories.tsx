import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ConfirmationFlowsPage } from "@/components/patterns/confirmation-flows";

const meta = {
  title: "Patterns/Confirmation Flows",
  component: ConfirmationFlowsPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ConfirmationFlowsPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
