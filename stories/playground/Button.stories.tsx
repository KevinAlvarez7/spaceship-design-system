import type { Meta, StoryObj } from '@storybook/react';
import { Button as ButtonV1 } from '@/components/playground/button/v1';
import { Button as ButtonV2 } from '@/components/playground/button/v2';

// ─── V1 ────────────────────────────────────────────────────────────────────

const metaV1 = {
  title: 'Playground/Button/V1',
  component: ButtonV1,
  parameters: { layout: 'centered' },
  args: {
    children: 'Button V1',
    variant: 'primary',
  },
} satisfies Meta<typeof ButtonV1>;

// ─── V2 ────────────────────────────────────────────────────────────────────

export default metaV1;
type StoryV1 = StoryObj<typeof metaV1>;

export const V1Default: StoryV1 = {};

export const V1AllVariants: StoryV1 = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonV1 variant="primary">Primary V1</ButtonV1>
      <ButtonV1 variant="secondary">Secondary V1</ButtonV1>
      <ButtonV1 variant="ghost">Ghost V1</ButtonV1>
    </div>
  ),
};

export const V2Default: StoryObj = {
  render: () => <ButtonV2>Button V2</ButtonV2>,
};

export const V2AllVariants: StoryObj = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonV2 variant="primary">Primary V2</ButtonV2>
      <ButtonV2 variant="secondary">Secondary V2</ButtonV2>
      <ButtonV2 variant="ghost">Ghost V2</ButtonV2>
    </div>
  ),
};
