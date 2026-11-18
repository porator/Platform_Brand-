import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TestersPage } from "@/components/pages/testers";

const meta = {
  title: "Pages/Testers",
  component: TestersPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof TestersPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
