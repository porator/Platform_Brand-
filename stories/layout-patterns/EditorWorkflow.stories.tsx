import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EditorWorkflowComposition } from "@/components/patterns/compositions";

const meta = {
  title: "Layout + Patterns/Editor Workflow",
  component: EditorWorkflowComposition,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof EditorWorkflowComposition>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
