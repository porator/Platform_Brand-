import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyProjectsComposition } from "@/components/data/compositions";

const meta = {
  title: "Data Display/Empty Projects",
  component: EmptyProjectsComposition,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof EmptyProjectsComposition>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
