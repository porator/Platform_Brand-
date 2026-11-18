import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ModalPage } from "@/components/feedback/modal";

const meta = {
  title: "Feedback/Modal",
  component: ModalPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ModalPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
