import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ApplicationContextPage } from "@/components/product/application-context";

const meta = {
  title: "Product Components/Application Context",
  component: ApplicationContextPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ApplicationContextPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
