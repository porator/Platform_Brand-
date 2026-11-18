import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ColorsPage } from "@/components/foundations/colors";

const meta = {
  title: "Foundations/Colors",
  component: ColorsPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ColorsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
