import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BuildsPage } from "@/components/pages/builds";

const meta = {
  title: "Pages/Builds",
  component: BuildsPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof BuildsPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
