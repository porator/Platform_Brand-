import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectHierarchyPage } from "@/components/navigation/hierarchy";

const meta = {
  title: "Navigation/Project Hierarchy",
  component: ProjectHierarchyPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ProjectHierarchyPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
