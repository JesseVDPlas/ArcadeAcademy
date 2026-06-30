import manifest from '@/app/assets/icons/pixel/icons.manifest';

export type IconName = keyof typeof manifest;
export type IconScale = '1x' | '2x' | '3x';

export const getIconModule = (name: IconName, scale: IconScale = '1x') =>
  manifest[name]?.png?.[scale];

export const getIconMeta = (name: IconName) => manifest[name];

export const getDefaultSize = (name: IconName) => manifest[name]?.baseSize ?? 24;
