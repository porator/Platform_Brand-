import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FiltersPage } from "@/components/patterns/filters";

const meta = {
  title: "Patterns/Filters",
  component: FiltersPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof FiltersPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
