import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EditorPage } from "@/components/pages/editor";

const meta = {
  title: "Pages/Editor",
  component: EditorPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof EditorPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
