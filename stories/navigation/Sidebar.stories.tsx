import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SidebarPage } from "@/components/navigation/sidebar";

const meta = {
  title: "Navigation/Sidebar",
  component: SidebarPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof SidebarPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
