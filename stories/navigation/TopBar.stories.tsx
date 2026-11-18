import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TopBarPage } from "@/components/navigation/top-bar";

const meta = {
  title: "Navigation/Top Bar",
  component: TopBarPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof TopBarPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
