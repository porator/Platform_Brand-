import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchFilterPage } from "@/components/patterns/search-filter";

const meta = {
  title: "Patterns/Search & Filter",
  component: SearchFilterPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof SearchFilterPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
