import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CreateProjectComposition } from "@/components/patterns/compositions";

const meta = {
  title: "Layout + Patterns/Create Project",
  component: CreateProjectComposition,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof CreateProjectComposition>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
