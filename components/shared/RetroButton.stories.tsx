import { Meta, StoryObj } from '@storybook/react-native';
import RetroButton from './RetroButton';

const meta: Meta<typeof RetroButton> = {
  title: 'Shared/RetroButton',
  component: RetroButton,
};
export default meta;

export const Primary: StoryObj<typeof RetroButton> = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
};
export const Danger: StoryObj<typeof RetroButton> = {
  args: {
    variant: 'danger',
    children: 'Danger',
  },
}; 