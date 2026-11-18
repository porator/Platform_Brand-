import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AvatarPage } from "@/components/atoms/avatar";

const meta = {
  title: "Atoms/Avatar",
  component: AvatarPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof AvatarPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
