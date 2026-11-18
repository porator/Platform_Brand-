import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReleasesPage } from "@/components/pages/releases";

const meta = {
  title: "Pages/Releases",
  component: ReleasesPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ReleasesPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
