import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

import { Text, TextInput, View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly error?: string;
  readonly label: string;
} & TextInputProps;

function FormField({
  containerStyle = undefined,
  error = undefined,
  label,
  style,
  ...props
}: Properties) {
  const { colors, components, fonts, gutters } = useTheme();

  return (
    <View style={[gutters.gap_8, containerStyle]}>
      <Text style={[fonts.size_14, fonts.gray800]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.gray200}
        style={[components.textInput, style]}
        {...props}
      />
      {error ? (
        <Text style={[fonts.size_12, fonts.red500]}>{error}</Text>
      ) : undefined}
    </View>
  );
}

export default FormField;
