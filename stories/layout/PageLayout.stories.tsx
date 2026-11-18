import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageLayoutPage } from "@/components/layout/page-layout";

const meta = {
  title: "Layout/Page Layout",
  component: PageLayoutPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof PageLayoutPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
