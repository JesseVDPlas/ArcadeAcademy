import { Meta, StoryObj } from '@storybook/react-native';
import { XPBar } from './XPBar';

const meta: Meta<typeof XPBar> = {
  title: 'UI/XPBar',
  component: XPBar,
};
export default meta;

export const HalfFilled: StoryObj<typeof XPBar> = {
  args: {
    progress: 0.5,
  },
};
export const LevelUp: StoryObj<typeof XPBar> = {
  args: {
    progress: 1,
    showLevelUp: true,
  },
}; 