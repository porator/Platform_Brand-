import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SpacingPage } from "@/components/foundations/spacing";

const meta = {
  title: "Foundations/Spacing",
  component: SpacingPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof SpacingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
