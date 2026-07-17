import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Icon } from "@/components/ui/icons";

type EmptyStateProps = {
  title: string;
  message: string;
  tone?: "neutral" | "warning";
  icon?: Icon;
};

export function EmptyState({ title, message, tone = "neutral", icon: IconComponent }: EmptyStateProps) {
  const theme = useTheme();
  const background = tone === "warning" ? theme.warningBg : theme.surfaceAlt;
  const titleColor = tone === "warning" ? theme.warning : theme.text;
  const messageColor = tone === "warning" ? theme.warning : theme.textSecondary;

  return (
    <View style={[styles.card, { backgroundColor: background }]}>
      {IconComponent && (
        <View style={styles.iconWrapper}>
          <IconComponent size={26} color={titleColor} weight="regular" />
        </View>
      )}

      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      <Text style={[styles.message, { color: messageColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.large,
    padding: 18,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
});
