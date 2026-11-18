import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectManagementComposition } from "@/components/patterns/compositions";

const meta = {
  title: "Layout + Patterns/Project Management",
  component: ProjectManagementComposition,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ProjectManagementComposition>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
