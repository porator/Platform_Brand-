import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ElevationPage } from "@/components/foundations/elevation";

const meta = {
  title: "Foundations/Elevation",
  component: ElevationPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ElevationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
