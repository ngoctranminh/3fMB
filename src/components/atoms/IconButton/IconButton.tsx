import type { TouchableOpacityProps } from 'react-native';

import { TouchableOpacity } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';

type Properties = {
  readonly iconPath: string;
} & TouchableOpacityProps;

const ICON_SIZE = 20;

function IconButton({ iconPath, style, ...props }: Properties) {
  const { colors, components } = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      {...props}
      style={[components.iconButtonSquare, style]}
    >
      <IconByVariant
        height={ICON_SIZE}
        path={iconPath}
        stroke={colors.gray400}
        width={ICON_SIZE}
      />
    </TouchableOpacity>
  );
}

export default IconButton;
