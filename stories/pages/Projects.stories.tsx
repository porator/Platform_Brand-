import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectsPage } from "@/components/pages/projects";

const meta = {
  title: "Pages/Projects",
  component: ProjectsPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ProjectsPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
