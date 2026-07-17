import { StyleSheet, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Viagem } from "@/domain/types";
import { useTheme } from "@/hooks/use-theme";

type TripHeaderProps = {
  viagemAtual: Viagem | null;
  viagemIniciada: boolean;
  totalConfirmados: number;
  totalEmbarcados: number;
  totalSemResposta: number;
  totalOcorrencias: number;
};

export function TripHeader({
  viagemAtual,
  viagemIniciada,
  totalConfirmados,
  totalEmbarcados,
  totalSemResposta,
  totalOcorrencias,
}: TripHeaderProps) {
  const theme = useTheme();

  const titulo = !viagemAtual
    ? "Nenhuma viagem disponível"
    : viagemAtual.sentido === "ida"
      ? "Ida para o CMB"
      : "Volta do CMB";

  const informacoes = !viagemAtual
    ? "Aguardando programação do gestor"
    : `${viagemAtual.turno} • ${viagemAtual.data} • ${viagemAtual.horario}`;

  const textoStatus = !viagemAtual
    ? "Não iniciada"
    : viagemAtual.status === "finalizada"
      ? "Finalizada"
      : viagemAtual.status === "cancelada"
        ? "Cancelada"
        : viagemIniciada
          ? "Em andamento"
          : "Não iniciada";

  return (
    <Card>
      <View style={styles.tripHeader}>
        <View style={styles.tripTextArea}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Viagem atual</Text>
          <Text style={[styles.tripTitle, { color: theme.text }]}>{titulo}</Text>
          <Text style={[styles.tripInfo, { color: theme.textSecondary }]}>{informacoes}</Text>
        </View>

        <Badge label={textoStatus} tone={viagemIniciada ? "success" : "warning"} />
      </View>

      <View style={[styles.summaryRow, { borderTopColor: theme.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{totalConfirmados}</Text>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Confirmados</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{totalEmbarcados}</Text>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Embarcados</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{totalSemResposta}</Text>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Sem resposta</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{totalOcorrencias}</Text>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Ocorrências</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  tripTextArea: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 13,
  },
  tripTitle: {
    fontSize: 21,
    fontWeight: "bold",
    marginTop: 4,
  },
  tripInfo: {
    fontSize: 14,
    marginTop: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: "bold",
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
});
