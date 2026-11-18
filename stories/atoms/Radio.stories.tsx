import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RadioPage } from "@/components/atoms/radio";

const meta = {
  title: "Atoms/Radio",
  component: RadioPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof RadioPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
