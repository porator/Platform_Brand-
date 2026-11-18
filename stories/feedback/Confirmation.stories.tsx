import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ConfirmationPage } from "@/components/feedback/confirmation";

const meta = {
  title: "Feedback/Confirmation",
  component: ConfirmationPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ConfirmationPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
