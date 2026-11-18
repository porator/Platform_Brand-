import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BannerPage } from "@/components/feedback/banner";

const meta = {
  title: "Feedback/Banner",
  component: BannerPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof BannerPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
