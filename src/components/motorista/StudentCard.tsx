import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { BackpackIcon, CheckCircleIcon, WarningCircleIcon } from "@/components/ui/icons";
import { Radii } from "@/constants/theme";
import { AlunoMotorista, ConfirmacaoResponsavel, SentidoViagem, SituacaoEmbarque } from "@/domain/types";
import { useTheme } from "@/hooks/use-theme";

type BadgeTone = "success" | "danger" | "warning" | "info" | "neutral";

type StudentCardProps = {
  aluno: AlunoMotorista;
  permitirAcoes: boolean;
  sentidoViagem: SentidoViagem;
  onAlterarSituacao: (alunoId: number, novaSituacao: SituacaoEmbarque) => void;
};

const toneDaSituacao: Record<SituacaoEmbarque, BadgeTone> = {
  aguardando: "warning",
  embarcou: "success",
  desembarcou: "info",
  ausente: "danger",
  revisitar: "info",
  "nao-localizado": "warning",
  cancelado: "neutral",
};

const textoDaSituacao: Record<SituacaoEmbarque, string> = {
  aguardando: "Aguardando",
  embarcou: "Embarcou",
  desembarcou: "Desembarcou",
  ausente: "Ausente",
  revisitar: "Revisitar ponto",
  "nao-localizado": "Não localizado",
  cancelado: "Cancelado",
};

const toneDaConfirmacao: Record<ConfirmacaoResponsavel, BadgeTone> = {
  aguardando: "neutral",
  vai: "success",
  "nao-vai": "danger",
  "nao-sei": "warning",
};

export function StudentCard({
  aluno,
  permitirAcoes,
  sentidoViagem,
  onAlterarSituacao,
}: StudentCardProps) {
  const theme = useTheme();

  const textoDaConfirmacao: Record<ConfirmacaoResponsavel, string> = {
    aguardando: "Aguardando resposta",
    vai: sentidoViagem === "ida" ? "Ida confirmada" : "Volta confirmada",
    "nao-vai": sentidoViagem === "ida" ? "Não vai na ida" : "Não volta no ônibus",
    "nao-sei": "Responsável ainda não sabe",
  };

  return (
    <Card style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.studentMainInfo}>
          <View style={[styles.studentIcon, { backgroundColor: theme.infoBg }]}>
            <BackpackIcon size={20} color={theme.primary} weight="bold" />
          </View>

          <View style={styles.studentTextArea}>
            <Text style={[styles.studentName, { color: theme.text }]}>{aluno.nome}</Text>

            <Text style={[styles.studentPoint, { color: theme.textMuted }]}>
              {aluno.ponto} • {aluno.serie}
            </Text>

            {aluno.horarioSituacao && (
              <Text style={[styles.studentTime, { color: theme.primary }]}>
                Atualizado às {aluno.horarioSituacao}
              </Text>
            )}

            <View style={styles.badgeWrapper}>
              <Badge
                label={textoDaConfirmacao[aluno.confirmacaoResponsavel]}
                tone={toneDaConfirmacao[aluno.confirmacaoResponsavel]}
              />
            </View>
          </View>
        </View>

        <Badge label={textoDaSituacao[aluno.situacao]} tone={toneDaSituacao[aluno.situacao]} />
      </View>

      {permitirAcoes && (
        <View style={styles.studentActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.successBg }]}
            onPress={() => onAlterarSituacao(aluno.id, "embarcou")}
          >
            <CheckCircleIcon size={15} color={theme.success} weight="bold" />
            <Text style={[styles.actionButtonText, { color: theme.success }]}>Embarcou</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.dangerBg }]}
            onPress={() => onAlterarSituacao(aluno.id, "ausente")}
          >
            <WarningCircleIcon size={15} color={theme.danger} weight="bold" />
            <Text style={[styles.actionButtonText, { color: theme.danger }]}>Ausente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.warningBg }]}
            onPress={() => onAlterarSituacao(aluno.id, "nao-localizado")}
          >
            <WarningCircleIcon size={15} color={theme.warning} weight="bold" />
            <Text style={[styles.actionButtonText, { color: theme.warning }]}>Não localizado</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  studentCard: {
    padding: 16,
    marginBottom: 12,
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  studentMainInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    paddingRight: 8,
  },
  studentIcon: {
    width: 38,
    height: 38,
    borderRadius: Radii.small,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  studentTextArea: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "700",
  },
  studentPoint: {
    fontSize: 13,
    marginTop: 3,
  },
  studentTime: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  badgeWrapper: {
    marginTop: 8,
  },
  studentActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: Radii.small,
    paddingHorizontal: 5,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
});
