import { typography } from '@/theme';
import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

interface BodyProps extends TextProps {
  color?: string;
  align?: TextStyle['textAlign'];
  subdued?: boolean;
  children: React.ReactNode;
}

export const Body: React.FC<BodyProps> = ({ color, align, subdued, style, children, ...rest }) => {
  return (
    <Text
      style={[
        typography.body,
        color && { color },
        subdued && { color: '#B4B4B4' }, // colors.textSecondary
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Body;

