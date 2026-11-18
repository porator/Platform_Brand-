import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardPage } from "@/components/pages/dashboard";

const meta = {
  title: "Pages/Dashboard",
  component: DashboardPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
