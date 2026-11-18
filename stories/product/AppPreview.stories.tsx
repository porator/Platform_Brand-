import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppPreviewPage } from "@/components/product/app-preview";

const meta = {
  title: "Product Components/App Preview",
  component: AppPreviewPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof AppPreviewPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
