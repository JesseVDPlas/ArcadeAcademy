import { configure, getStorybookUI } from '@storybook/react-native';
import { AppRegistry } from 'react-native';

configure(() => {
  require('../components/ui/BitByte.stories');
  require('../components/ui/XPBar.stories');
  require('../components/shared/RetroButton.stories');
}, module);

const StorybookUIRoot = getStorybookUI({});
AppRegistry.registerComponent('main', () => StorybookUIRoot);
export default StorybookUIRoot; 