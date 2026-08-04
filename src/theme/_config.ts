import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import type { ThemeConfiguration } from '@/theme/types/config';

export const enum Variant {
  DARK = 'dark',
}

const colorsLight = {
  amber50: '#FEF3C7',
  amber500: '#D97706',
  blue100: '#DBEAFE',
  blue50: '#EFF6FF',
  blue500: '#2F6BFF',
  gray100: '#DFDFDF',
  gray200: '#A1A1A1',
  gray400: '#4D4D4D',
  gray50: '#EFEFEF',
  gray800: '#303030',
  green50: '#E8F7EE',
  green500: '#16A34A',
  purple100: '#E1E1EF',
  purple50: '#1B1A23',
  purple500: '#44427D',
  red50: '#FEE9E9',
  red500: '#C13333',
  skeleton: '#A1A1A1',
  surface: '#FFFFFF',
  surfaceSunken: '#F5F6F8',
} as const;

const colorsDark = {
  amber50: '#3A2E12',
  amber500: '#FBBF24',
  blue100: '#1E2B45',
  blue50: '#16233A',
  blue500: '#5B8CFF',
  gray100: '#000000',
  gray200: '#BABABA',
  gray400: '#969696',
  gray50: '#EFEFEF',
  gray800: '#E0E0E0',
  green50: '#122A1C',
  green500: '#34D399',
  purple100: '#252732',
  purple50: '#1B1A23',
  purple500: '#A6A4F0',
  red50: '#3A1A1A',
  red500: '#C13333',
  skeleton: '#303030',
  surface: '#252732',
  surfaceSunken: '#1B1A23',
} as const;

const sizes = [4, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 80] as const;

export const config = {
  backgrounds: colorsLight,
  borders: {
    colors: colorsLight,
    radius: [4, 8, 12, 16, 20, 24],
    widths: [1, 2],
  },
  colors: colorsLight,
  fonts: {
    colors: colorsLight,
    sizes,
  },
  gutters: sizes,
  navigationColors: {
    ...DefaultTheme.colors,
    background: colorsLight.gray50,
    card: colorsLight.gray50,
  },
  variants: {
    dark: {
      backgrounds: colorsDark,
      borders: {
        colors: colorsDark,
      },
      colors: colorsDark,
      fonts: {
        colors: colorsDark,
      },
      navigationColors: {
        ...DarkTheme.colors,
        background: colorsDark.purple50,
        card: colorsDark.purple50,
      },
    },
  },
} as const satisfies ThemeConfiguration;
