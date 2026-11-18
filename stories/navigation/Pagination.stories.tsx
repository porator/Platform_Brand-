import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PaginationPage } from "@/components/navigation/pagination";

const meta = {
  title: "Navigation/Pagination",
  component: PaginationPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof PaginationPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
