import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OnboardingComposition } from "@/components/patterns/compositions";

const meta = {
  title: "Layout + Patterns/Onboarding",
  component: OnboardingComposition,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof OnboardingComposition>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
