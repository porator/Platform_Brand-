import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TesterListPage } from "@/components/product/tester-list";

const meta = {
  title: "Product Components/Tester List",
  component: TesterListPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof TesterListPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
