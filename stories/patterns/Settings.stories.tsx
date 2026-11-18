import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SettingsPage } from "@/components/patterns/settings";

const meta = {
  title: "Patterns/Settings",
  component: SettingsPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
