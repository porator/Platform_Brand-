import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchPage } from "@/components/form/search";

const meta = {
  title: "Form & Controls/Search",
  component: SearchPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof SearchPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
