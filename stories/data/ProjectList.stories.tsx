import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectListComposition } from "@/components/data/compositions";

const meta = {
  title: "Data Display/Project List",
  component: ProjectListComposition,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ProjectListComposition>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
