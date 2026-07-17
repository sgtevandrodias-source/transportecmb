import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Carregando..." }: LoadingStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceAlt }]}>
      <ActivityIndicator color={theme.primary} />
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.large,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontSize: 14,
  },
});
