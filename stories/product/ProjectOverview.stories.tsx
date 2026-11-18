import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectOverviewPage } from "@/components/product/project-overview";

const meta = {
  title: "Product Components/Project Overview",
  component: ProjectOverviewPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ProjectOverviewPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
