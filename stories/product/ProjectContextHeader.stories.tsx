import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectContextHeaderPage } from "@/components/product/project-context-header";

const meta = {
  title: "Product Components/Project Context Header",
  component: ProjectContextHeaderPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ProjectContextHeaderPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
