import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type BadgeTone = "success" | "danger" | "warning" | "info" | "neutral";

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const theme = useTheme();

  const colorsByTone: Record<BadgeTone, { bg: string; text: string }> = {
    success: { bg: theme.successBg, text: theme.success },
    danger: { bg: theme.dangerBg, text: theme.danger },
    warning: { bg: theme.warningBg, text: theme.warning },
    info: { bg: theme.infoBg, text: theme.info },
    neutral: { bg: theme.surfaceAlt, text: theme.textSecondary },
  };

  const { bg, text } = colorsByTone[tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: text }]} />
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
  },
});
