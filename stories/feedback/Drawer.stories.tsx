import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DrawerPage } from "@/components/feedback/drawer";

const meta = {
  title: "Feedback/Drawer",
  component: DrawerPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof DrawerPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
