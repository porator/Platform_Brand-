import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EnvironmentSelectorPage } from "@/components/product/environment-selector";

const meta = {
  title: "Product Components/Environment Selector",
  component: EnvironmentSelectorPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof EnvironmentSelectorPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
