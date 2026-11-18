import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TabsPage } from "@/components/navigation/tabs";

const meta = {
  title: "Navigation/Tabs",
  component: TabsPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof TabsPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
