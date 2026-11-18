import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BuildStatusPage } from "@/components/product/build-status";

const meta = {
  title: "Product Components/Build Status",
  component: BuildStatusPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof BuildStatusPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
