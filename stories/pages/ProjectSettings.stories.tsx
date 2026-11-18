import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectSettingsPage } from "@/components/pages/project-settings";

const meta = {
  title: "Pages/Project Settings",
  component: ProjectSettingsPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof ProjectSettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
