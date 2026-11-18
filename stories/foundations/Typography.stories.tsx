import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TypographyPage } from "@/components/foundations/typography";

const meta = {
  title: "Foundations/Typography",
  component: TypographyPage,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof TypographyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
