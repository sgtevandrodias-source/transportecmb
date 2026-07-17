import { StyleSheet, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { type Icon } from "@/components/ui/icons";
import { Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  titulo: string;
  mensagem: string;
  horario?: string;
  icone: Icon;
  cor: string;
};

export function TripStatusCard({ titulo, mensagem, horario, icone: IconComponent, cor }: Props) {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { borderLeftColor: cor }]}>
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: theme.surfaceAlt }]}>
          <IconComponent size={24} color={cor} weight="bold" />
        </View>

        <View style={styles.textArea}>
          <Text style={[styles.title, { color: theme.text }]}>{titulo}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{mensagem}</Text>

          {horario && <Text style={[styles.time, { color: theme.primary }]}>{horario}</Text>}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 18,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radii.medium,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textArea: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  time: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
});
