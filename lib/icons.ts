/**
 * Centralized icon definitions using MaterialCommunityIcons
 * Consistent arcade-style iconography throughout the app
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const Icon = MaterialCommunityIcons;

export const tabIcons = {
  home: 'home-variant' as const,
  quests: 'sword-cross' as const,
  leaderboard: 'trophy' as const,
  profile: 'account-circle' as const,
};

export const actionIcons = {
  daily: 'calendar-star' as const,
  continue: 'play-circle' as const,
  toolbox: 'toolbox-outline' as const,
  fab: 'plus-circle' as const,
  fifty: 'percent' as const, // 50/50
  skip: 'skip-next' as const,
  time: 'timer-outline' as const,
  shop: 'shopping-outline' as const,
  settings: 'cog' as const,
  faq: 'help-circle-outline' as const,
  credits: 'star-four-points-outline' as const,
};

