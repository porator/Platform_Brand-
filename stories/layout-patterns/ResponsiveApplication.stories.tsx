import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ResponsiveApplicationComposition } from "@/components/patterns/compositions";

const meta = {
  title: "Layout + Patterns/Responsive Application",
  component: ResponsiveApplicationComposition,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ResponsiveApplicationComposition>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
