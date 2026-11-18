import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyStatePage } from "@/components/data/empty-state";

const meta = {
  title: "Data Display/Empty State",
  component: EmptyStatePage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof EmptyStatePage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
