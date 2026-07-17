import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { Text } from "@/components/ui/Text";
import { FontFamily, Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type FormFieldProps = TextInputProps & {
  label: string;
};

export function FormField({ label, style, ...inputProps }: FormFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surfaceAlt,
            borderColor: theme.border,
            color: theme.text,
            fontFamily: FontFamily.body.regular,
          },
          style,
        ]}
        placeholderTextColor={theme.textMuted}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.small,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
});
