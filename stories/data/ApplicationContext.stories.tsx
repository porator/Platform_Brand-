import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ApplicationContextComposition } from "@/components/data/compositions";

const meta = {
  title: "Data Display/Application Context",
  component: ApplicationContextComposition,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ApplicationContextComposition>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
