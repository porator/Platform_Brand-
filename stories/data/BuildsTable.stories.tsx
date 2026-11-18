import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BuildsTableComposition } from "@/components/data/compositions";

const meta = {
  title: "Data Display/Builds Table",
  component: BuildsTableComposition,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof BuildsTableComposition>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
