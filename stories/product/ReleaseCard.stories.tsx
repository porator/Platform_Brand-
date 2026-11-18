import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReleaseCardPage } from "@/components/product/release-card";

const meta = {
  title: "Product Components/Release Card",
  component: ReleaseCardPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ReleaseCardPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
