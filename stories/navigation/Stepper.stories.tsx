import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StepperPage } from "@/components/navigation/stepper";

const meta = {
  title: "Navigation/Stepper",
  component: StepperPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof StepperPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
