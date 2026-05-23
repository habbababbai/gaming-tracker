import type { TextStyle } from 'react-native';

export const fontSizes = {
  sm: 15,
  base: 16,
  lg: 22,
} as const;

export const fontWeights = {
  regular: '400',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;
