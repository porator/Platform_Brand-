import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconsPage } from "@/components/foundations/icons";

const meta = {
  title: "Foundations/Icons",
  component: IconsPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof IconsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
