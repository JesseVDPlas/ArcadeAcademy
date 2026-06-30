import React from 'react';
import { Image, ImageStyle } from 'react-native';
import { getDefaultSize, getIconModule, IconName, IconScale } from '@/lib/iconPath';

const FALLBACK = require('@/assets/icons/fallback-question.png');

type IconProps = {
  name: IconName;
  size?: number;
  scale?: IconScale;
  style?: ImageStyle;
};

export default function Icon({ name, size, scale = '1x', style }: IconProps) {
  const source = getIconModule(name, scale) ?? FALLBACK;
  const resolvedSize = size ?? getDefaultSize(name);
  return <Image source={source} style={[{ width: resolvedSize, height: resolvedSize }, style]} />;
}
