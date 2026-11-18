import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectOverviewPage } from "@/components/pages/project-overview";

const meta = {
  title: "Pages/Project Overview",
  component: ProjectOverviewPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ProjectOverviewPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
