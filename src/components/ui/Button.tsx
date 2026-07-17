import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { type Icon } from "@/components/ui/icons";
import { Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ButtonVariant = "primary" | "accent" | "secondary" | "success" | "danger" | "ghost";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: Icon;
};

// react-native-web adds `hovered`/`focused` to Pressable's style callback;
// core React Native types only know about `pressed`.
type WebPressableState = { pressed: boolean; hovered?: boolean; focused?: boolean };

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon: IconComponent,
}: ButtonProps) {
  const theme = useTheme();

  const appearanceByVariant: Record<
    ButtonVariant,
    { bg: string; bgHover: string; text: string; border?: string }
  > = {
    primary: { bg: theme.primary, bgHover: theme.primaryDeep, text: theme.onPrimary },
    accent: { bg: theme.accent, bgHover: theme.primaryDeep, text: theme.onPrimary },
    secondary: {
      bg: "transparent",
      bgHover: theme.infoBg,
      text: theme.primary,
      border: theme.primary,
    },
    success: { bg: theme.successBg, bgHover: theme.successBg, text: theme.success },
    danger: { bg: theme.dangerBg, bgHover: theme.dangerBg, text: theme.danger },
    ghost: { bg: "transparent", bgHover: theme.surfaceAlt, text: theme.primary },
  };

  const appearance = appearanceByVariant[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed, hovered, focused }: WebPressableState) => [
        styles.button,
        {
          backgroundColor: pressed || hovered ? appearance.bgHover : appearance.bg,
          borderWidth: appearance.border ? 1.5 : 0,
          borderColor: appearance.border,
        },
        focused && { outlineWidth: 2, outlineColor: theme.primary, outlineOffset: 2 },
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={appearance.text} />
      ) : (
        <View style={styles.content}>
          {IconComponent && <IconComponent size={18} color={appearance.text} weight="bold" />}
          <Text style={[styles.label, { color: appearance.text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radii.medium,
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
});
