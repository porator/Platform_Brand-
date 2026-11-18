import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectSelectorPage } from "@/components/product/project-selector";

const meta = {
  title: "Product Components/Project Selector",
  component: ProjectSelectorPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ProjectSelectorPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
