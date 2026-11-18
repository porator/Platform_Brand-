import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SliderPage } from "@/components/form/slider";

const meta = {
  title: "Form & Controls/Slider",
  component: SliderPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof SliderPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
