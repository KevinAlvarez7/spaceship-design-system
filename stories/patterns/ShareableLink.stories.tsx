import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ShareableLink } from '@/components/patterns';

function ShareableLinkDemo() {
  const [value, setValue] = useState('my-awesome-dashboard');
  return (
    <div className="w-96">
      <ShareableLink
        value={value}
        onChange={setValue}
        onShare={() => alert(`Sharing: ${value}.on.spaceship.gov.sg`)}
      />
    </div>
  );
}

const meta = {
  title: 'Playground/Components/ShareableLink',
  component: ShareableLinkDemo,
  tags: ['experimental'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ShareableLinkDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function CustomSuffixDemo() {
  const [value, setValue] = useState('my-project');
  return (
    <div className="w-96">
      <ShareableLink
        value={value}
        onChange={setValue}
        suffix=".example.com"
        shareLabel="Publish"
      />
    </div>
  );
}

export const CustomSuffix: Story = {
  render: () => <CustomSuffixDemo />,
};

function EmptyDemo() {
  const [value, setValue] = useState('');
  return (
    <div className="w-96">
      <ShareableLink
        value={value}
        onChange={setValue}
        placeholder="your-project-name"
      />
    </div>
  );
}

export const Empty: Story = {
  render: () => <EmptyDemo />,
};
