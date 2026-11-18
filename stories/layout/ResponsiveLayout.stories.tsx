import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ResponsiveLayoutPage } from "@/components/layout/responsive-layout";

const meta = {
  title: "Layout/Responsive Layout",
  component: ResponsiveLayoutPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ResponsiveLayoutPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
