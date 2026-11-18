import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BreadcrumbsPage } from "@/components/navigation/breadcrumbs";

const meta = {
  title: "Navigation/Breadcrumbs",
  component: BreadcrumbsPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof BreadcrumbsPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
