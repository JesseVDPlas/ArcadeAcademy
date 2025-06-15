import { Meta, StoryObj } from '@storybook/react-native';
import { BitByte } from './BitByte';

const meta: Meta<typeof BitByte> = {
  title: 'UI/BitByte',
  component: BitByte,
};
export default meta;

export const Idle: StoryObj<typeof BitByte> = {
  args: { mood: 'idle' },
};
export const Happy: StoryObj<typeof BitByte> = {
  args: { mood: 'happy' },
};
export const Sad: StoryObj<typeof BitByte> = {
  args: { mood: 'sad' },
}; 