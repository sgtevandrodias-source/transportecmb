import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { CaretLeftIcon, CheckCircleIcon, CheckIcon, MapPinIcon } from "@/components/ui/icons";
import { Radii } from "@/constants/theme";
import { AlunoMotorista, SituacaoEmbarque, Viagem } from "@/domain/types";
import { useTheme } from "@/hooks/use-theme";

type OperationalModeProps = {
  viagemAtual: Viagem;
  alunosConfirmados: AlunoMotorista[];
  alunoAtual: AlunoMotorista | null;
  totalResolvidos: number;
  totalEmbarcados: number;
  totalRevisitar: number;
  totalOcorrencias: number;
  progresso: number;
  onVoltar: () => void;
  onAlterarSituacao: (alunoId: number, novaSituacao: SituacaoEmbarque) => void;
  onFinalizarEmbarque: () => void;
};

export function OperationalMode({
  viagemAtual,
  alunosConfirmados,
  alunoAtual,
  totalResolvidos,
  totalEmbarcados,
  totalRevisitar,
  totalOcorrencias,
  progresso,
  onVoltar,
  onAlterarSituacao,
  onFinalizarEmbarque,
}: OperationalModeProps) {
  const theme = useTheme();
  const totalFaltando = alunosConfirmados.length - totalResolvidos;
  const alunoEstaEmRevisita = alunoAtual?.situacao === "revisitar";

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.page }]}>
      <View style={[styles.container, { backgroundColor: theme.surfaceAlt }]}>
        <View style={[styles.header, { backgroundColor: theme.primaryDeep }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onVoltar}>
            <CaretLeftIcon size={16} color={theme.onPrimary} weight="bold" />
            <Text style={[styles.closeButtonText, { color: theme.onPrimary }]}>Voltar</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.onPrimary }]}>Modo Viagem</Text>

          <Text style={[styles.subtitle, { color: theme.onPrimaryMuted }]}>
            {viagemAtual.sentido === "ida" ? "Ida para o CMB" : "Volta do CMB"}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                Progresso do embarque
              </Text>
              <Text style={[styles.progressValue, { color: theme.text }]}>
                {totalResolvidos} de {alunosConfirmados.length}
              </Text>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: theme.surfaceAlt }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progresso}%`, backgroundColor: theme.primary },
                ]}
              />
            </View>

            <Text style={[styles.progressPercentage, { color: theme.primary }]}>
              {progresso}% concluído
            </Text>
          </Card>

          {alunoAtual ? (
            <Card style={styles.currentStudentCard}>
              <Text style={[styles.currentStudentLabel, { color: theme.textMuted }]}>
                {alunoEstaEmRevisita ? "RETORNO AO PONTO" : "PRÓXIMO EMBARQUE"}
              </Text>

              <View style={styles.currentPointRow}>
                <MapPinIcon size={16} color={theme.primary} weight="bold" />
                <Text style={[styles.currentPoint, { color: theme.primary }]}>
                  {alunoAtual.ponto}
                </Text>
              </View>

              <Text style={[styles.currentStudentName, { color: theme.text }]}>
                {alunoAtual.nome}
              </Text>

              <Text style={[styles.currentStudentInfo, { color: theme.textSecondary }]}>
                {alunoAtual.serie} • Turno {alunoAtual.turno}
              </Text>

              {alunoEstaEmRevisita && (
                <View style={[styles.revisitNotice, { backgroundColor: theme.infoBg }]}>
                  <Text style={[styles.revisitNoticeText, { color: theme.info }]}>
                    Este aluno não estava no ponto na primeira passagem.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.bigBoardButton, { backgroundColor: theme.success }]}
                onPress={() => onAlterarSituacao(alunoAtual.id, "embarcou")}
              >
                <CheckIcon size={30} color="#FFFFFF" weight="bold" />
                <Text style={styles.bigBoardButtonText}>EMBARCOU</Text>
              </TouchableOpacity>

              <View style={styles.secondaryActions}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: theme.dangerBg }]}
                  onPress={() => onAlterarSituacao(alunoAtual.id, "ausente")}
                >
                  <Text style={[styles.secondaryActionText, { color: theme.danger }]}>Ausente</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: theme.warningBg }]}
                  onPress={() =>
                    onAlterarSituacao(
                      alunoAtual.id,
                      alunoEstaEmRevisita ? "nao-localizado" : "revisitar",
                    )
                  }
                >
                  <Text style={[styles.secondaryActionText, { color: theme.warning }]}>
                    {alunoEstaEmRevisita ? "Não localizado definitivamente" : "Revisitar depois"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <View style={[styles.completedCard, { backgroundColor: theme.successBg }]}>
              <CheckCircleIcon size={48} color={theme.success} weight="fill" />

              <Text style={[styles.completedTitle, { color: theme.success }]}>
                Todos os confirmados foram verificados
              </Text>

              <Text style={[styles.completedText, { color: theme.text }]}>
                Você já registrou a situação de todos os alunos confirmados.
              </Text>

              <TouchableOpacity
                style={[styles.completeTripButton, { backgroundColor: theme.primary }]}
                onPress={onFinalizarEmbarque}
              >
                <Text style={[styles.completeTripButtonText, { color: theme.onPrimary }]}>
                  Finalizar embarque
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, { color: theme.text }]}>Resumo</Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.primary }]}>
                  {totalEmbarcados}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Embarcados</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.primary }]}>
                  {totalRevisitar}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Para retornar</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.primary }]}>
                  {totalOcorrencias}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Ocorrências</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.primary }]}>
                  {totalFaltando}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Faltando</Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 480 },
  header: {
    paddingTop: 42,
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  closeButton: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingVertical: 6, paddingRight: 15 },
  closeButtonText: { fontSize: 15, fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "800", marginTop: 12 },
  subtitle: { fontSize: 15, marginTop: 4 },
  content: { padding: 20, paddingBottom: 36, gap: 18 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 14 },
  progressValue: { fontSize: 14, fontWeight: "700" },
  progressTrack: { height: 13, borderRadius: 10, marginTop: 14, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 10 },
  progressPercentage: { fontSize: 13, fontWeight: "700", textAlign: "right", marginTop: 8 },
  currentStudentCard: { alignItems: "center" },
  currentStudentLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  currentPointRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
  currentPoint: { fontSize: 17, fontWeight: "700" },
  currentStudentName: { fontSize: 28, fontWeight: "800", textAlign: "center", marginTop: 14 },
  currentStudentInfo: { fontSize: 15, marginTop: 6 },
  revisitNotice: { borderRadius: Radii.medium, padding: 12, width: "100%", marginTop: 18 },
  revisitNoticeText: { fontSize: 13, lineHeight: 19, textAlign: "center", fontWeight: "600" },
  bigBoardButton: {
    borderRadius: Radii.xlarge,
    minHeight: 100,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    gap: 4,
  },
  bigBoardButtonText: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  secondaryActions: { flexDirection: "row", gap: 12, marginTop: 14, width: "100%" },
  secondaryButton: { flex: 1, borderRadius: Radii.medium, paddingVertical: 20, alignItems: "center" },
  secondaryActionText: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  completedCard: { borderRadius: Radii.xlarge, padding: 24, alignItems: "center" },
  completedTitle: { fontSize: 20, fontWeight: "800", textAlign: "center", marginTop: 14 },
  completedText: { fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 8 },
  completeTripButton: { borderRadius: Radii.medium, paddingVertical: 15, paddingHorizontal: 24, marginTop: 20 },
  completeTripButtonText: { fontSize: 16, fontWeight: "700" },
  summaryCard: {},
  summaryTitle: { fontSize: 17, fontWeight: "700" },
  summaryRow: { flexDirection: "row", marginTop: 16 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryNumber: { fontSize: 24, fontWeight: "800" },
  summaryLabel: { fontSize: 12, marginTop: 4, textAlign: "center" },
});
