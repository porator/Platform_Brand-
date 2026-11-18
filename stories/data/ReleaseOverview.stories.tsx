import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReleaseOverviewComposition } from "@/components/data/compositions";

const meta = {
  title: "Data Display/Release Overview",
  component: ReleaseOverviewComposition,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ReleaseOverviewComposition>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
