import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ResourceNavigationPage } from "@/components/product/resource-navigation";

const meta = {
  title: "Product Components/Resource Navigation",
  component: ResourceNavigationPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ResourceNavigationPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
