import { typography } from '@/theme';
import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

interface TitleProps extends TextProps {
  color?: string;
  align?: TextStyle['textAlign'];
  children: React.ReactNode;
}

export const Title: React.FC<TitleProps> = ({ color, align, style, children, ...rest }) => {
  return (
    <Text
      style={[
        typography.title,
        color && { color },
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Title;

