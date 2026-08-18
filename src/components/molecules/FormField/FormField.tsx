import type { ReactNode } from 'react';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { useTheme } from '@/theme';

type Properties = {
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly error?: string;
  readonly label: string;
  readonly rightAccessory?: ReactNode;
} & TextInputProps;

function FormField({
  containerStyle = undefined,
  error = undefined,
  label,
  onBlur,
  onFocus,
  placeholderTextColor,
  rightAccessory = undefined,
  style,
  ...props
}: Properties) {
  const { colors, components, fonts, gutters, layout } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[gutters.gap_8, containerStyle]}>
      <Text style={[fonts.size_14, fonts.gray800]}>{label}</Text>
      <View style={[layout.relative]}>
        <TextInput
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={placeholderTextColor ?? colors.inputPlaceholder}
          style={[
            components.formTextInput,
            isFocused ? components.formTextInputFocused : undefined,
            error ? components.formTextInputError : undefined,
            rightAccessory ? { paddingRight: 52 } : undefined,
            style,
          ]}
          {...props}
        />
        {rightAccessory ? (
          <View
            style={[
              layout.absolute,
              layout.justifyCenter,
              { bottom: 0, right: 16, top: 0 },
            ]}
          >
            {rightAccessory}
          </View>
        ) : undefined}
      </View>
      {error ? (
        <Text style={[fonts.size_12, fonts.red500]}>{error}</Text>
      ) : undefined}
    </View>
  );
}

export default FormField;
