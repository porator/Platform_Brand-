import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OnboardingPage } from "@/components/patterns/onboarding";

const meta = {
  title: "Patterns/Onboarding",
  component: OnboardingPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof OnboardingPage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
