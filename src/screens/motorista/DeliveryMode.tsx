import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import {
  BackpackIcon,
  CaretLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  MapPinIcon,
  WarningCircleIcon,
} from "@/components/ui/icons";
import { Radii } from "@/constants/theme";
import { AlunoMotorista, SituacaoEmbarque, Viagem } from "@/domain/types";
import { useTheme } from "@/hooks/use-theme";

type DeliveryModeProps = {
  viagemAtual: Viagem;
  alunosDaVolta: AlunoMotorista[];
  onVoltar: () => void;
  onAlterarSituacao: (alunoId: number, novaSituacao: SituacaoEmbarque) => void;
  onFinalizarViagem: () => void;
};

export function DeliveryMode({
  viagemAtual,
  alunosDaVolta,
  onVoltar,
  onAlterarSituacao,
  onFinalizarViagem,
}: DeliveryModeProps) {
  const theme = useTheme();

  const alunosABordo = alunosDaVolta.filter((aluno) => aluno.situacao === "embarcou");
  const alunosDesembarcados = alunosDaVolta.filter((aluno) => aluno.situacao === "desembarcou");
  const totalPassageiros = alunosABordo.length + alunosDesembarcados.length;
  const progresso =
    totalPassageiros > 0
      ? Math.round((alunosDesembarcados.length / totalPassageiros) * 100)
      : 0;

  const alunosPorPonto = alunosABordo.reduce<Record<string, AlunoMotorista[]>>((grupos, aluno) => {
    if (!grupos[aluno.ponto]) {
      grupos[aluno.ponto] = [];
    }
    grupos[aluno.ponto].push(aluno);
    return grupos;
  }, {});

  const pontosPendentes = Object.keys(alunosPorPonto);
  const proximoPonto = pontosPendentes.length > 0 ? pontosPendentes[0] : null;
  const alunosDoProximoPonto = proximoPonto ? alunosPorPonto[proximoPonto] : [];
  const todosEntregues = totalPassageiros > 0 && alunosABordo.length === 0;

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.page }]}>
      <View style={[styles.container, { backgroundColor: theme.surfaceAlt }]}>
        <View style={[styles.header, { backgroundColor: theme.primaryDeep }]}>
          <TouchableOpacity style={styles.backButton} onPress={onVoltar}>
            <CaretLeftIcon size={16} color={theme.onPrimary} weight="bold" />
            <Text style={[styles.backButtonText, { color: theme.onPrimary }]}>Voltar</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.onPrimary }]}>Modo Entrega</Text>
          <Text style={[styles.subtitle, { color: theme.onPrimaryMuted }]}>Volta do CMB</Text>
          <Text style={[styles.tripInfo, { color: theme.onPrimaryMuted }]}>
            {viagemAtual.data} • {viagemAtual.turno} • {viagemAtual.horario}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, { color: theme.textSecondary }]}>
                Progresso das entregas
              </Text>
              <Text style={[styles.progressNumbers, { color: theme.text }]}>
                {alunosDesembarcados.length} de {totalPassageiros}
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

          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: theme.primary }]}>
                {alunosABordo.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Ainda no ônibus</Text>
            </Card>

            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: theme.primary }]}>
                {alunosDesembarcados.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Entregues</Text>
            </Card>
          </View>

          {todosEntregues ? (
            <View style={[styles.completedCard, { backgroundColor: theme.successBg }]}>
              <CheckCircleIcon size={48} color={theme.success} weight="fill" />
              <Text style={[styles.completedTitle, { color: theme.success }]}>
                Todos os alunos foram entregues
              </Text>
              <Text style={[styles.completedText, { color: theme.text }]}>
                Não há mais passageiros dentro do veículo. A viagem já pode ser finalizada.
              </Text>

              <TouchableOpacity
                style={[styles.finishButton, { backgroundColor: theme.primary }]}
                onPress={onFinalizarViagem}
              >
                <Text style={[styles.finishButtonText, { color: theme.onPrimary }]}>
                  Finalizar viagem
                </Text>
              </TouchableOpacity>
            </View>
          ) : proximoPonto ? (
            <>
              <Card style={[styles.nextPointCard, { backgroundColor: theme.infoBg }]}>
                <Text style={[styles.nextPointLabel, { color: theme.textSecondary }]}>
                  PRÓXIMO PONTO
                </Text>
                <View style={styles.nextPointIconWrapper}>
                  <MapPinIcon size={30} color={theme.primary} weight="bold" />
                </View>
                <Text style={[styles.nextPointName, { color: theme.primary }]}>{proximoPonto}</Text>
                <Text style={[styles.nextPointCount, { color: theme.textSecondary }]}>
                  {alunosDoProximoPonto.length} aluno(s) para entrega
                </Text>
              </Card>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Alunos deste ponto</Text>

              {alunosDoProximoPonto.map((aluno) => (
                <Card key={aluno.id} style={styles.studentCard}>
                  <View style={styles.studentHeader}>
                    <View style={[styles.studentIcon, { backgroundColor: theme.infoBg }]}>
                      <BackpackIcon size={20} color={theme.primary} weight="bold" />
                    </View>

                    <View style={styles.studentInfo}>
                      <Text style={[styles.studentName, { color: theme.text }]}>{aluno.nome}</Text>
                      <Text style={[styles.studentDetails, { color: theme.textMuted }]}>
                        {aluno.serie} • {aluno.ponto}
                      </Text>

                      {aluno.horarioSituacao && (
                        <Text style={[styles.boardedTime, { color: theme.primary }]}>
                          Embarcou às {aluno.horarioSituacao}
                        </Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.deliverButton, { backgroundColor: theme.success }]}
                    onPress={() => onAlterarSituacao(aluno.id, "desembarcou")}
                  >
                    <CheckIcon size={18} color="#FFFFFF" weight="bold" />
                    <Text style={styles.deliverButtonText}>Confirmar entrega</Text>
                  </TouchableOpacity>
                </Card>
              ))}

              {pontosPendentes.length > 1 && (
                <Card>
                  <Text style={[styles.remainingPointsTitle, { color: theme.text }]}>
                    Próximos pontos
                  </Text>

                  {pontosPendentes.slice(1).map((ponto) => (
                    <View key={ponto} style={[styles.remainingPointRow, { borderBottomColor: theme.border }]}>
                      <View style={styles.remainingPointNameRow}>
                        <MapPinIcon size={14} color={theme.textSecondary} weight="bold" />
                        <Text style={[styles.remainingPointName, { color: theme.text }]}>{ponto}</Text>
                      </View>
                      <Text style={[styles.remainingPointCount, { color: theme.textMuted }]}>
                        {alunosPorPonto[ponto].length} aluno(s)
                      </Text>
                    </View>
                  ))}
                </Card>
              )}
            </>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: theme.warningBg }]}>
              <WarningCircleIcon size={26} color={theme.warning} weight="regular" />
              <Text style={[styles.emptyTitle, { color: theme.warning }]}>Nenhum aluno a bordo</Text>
              <Text style={[styles.emptyText, { color: theme.warning }]}>
                Ainda não existem alunos embarcados para iniciar as entregas.
              </Text>
            </View>
          )}

          {alunosDesembarcados.length > 0 && (
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Alunos já entregues</Text>

              {alunosDesembarcados.map((aluno) => (
                <Card key={aluno.id} style={styles.deliveredRow}>
                  <View>
                    <Text style={[styles.deliveredName, { color: theme.text }]}>{aluno.nome}</Text>
                    <Text style={[styles.deliveredPoint, { color: theme.textMuted }]}>
                      {aluno.ponto}
                    </Text>
                  </View>

                  <Badge label="Entregue" tone="success" />
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 480 },
  header: { paddingTop: 42, paddingBottom: 24, paddingHorizontal: 20 },
  backButton: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingVertical: 6, paddingRight: 16 },
  backButtonText: { fontSize: 15, fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "800", marginTop: 12 },
  subtitle: { fontSize: 16, fontWeight: "600", marginTop: 4 },
  tripInfo: { fontSize: 13, marginTop: 5 },
  content: { padding: 20, paddingBottom: 36, gap: 16 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { fontSize: 14 },
  progressNumbers: { fontSize: 14, fontWeight: "700" },
  progressTrack: { height: 13, borderRadius: 10, marginTop: 14, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 10 },
  progressPercentage: { fontSize: 13, fontWeight: "700", textAlign: "right", marginTop: 8 },
  summaryRow: { flexDirection: "row", gap: 12 },
  summaryCard: { flex: 1, alignItems: "center" },
  summaryNumber: { fontSize: 24, fontWeight: "800" },
  summaryLabel: { fontSize: 12, marginTop: 4, textAlign: "center" },
  nextPointCard: { alignItems: "center" },
  nextPointLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  nextPointIconWrapper: { marginTop: 12 },
  nextPointName: { fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: 8 },
  nextPointCount: { fontSize: 14, marginTop: 5 },
  sectionTitle: { fontSize: 19, fontWeight: "700", marginTop: 6 },
  studentCard: {},
  studentHeader: { flexDirection: "row", alignItems: "center" },
  studentIcon: {
    width: 40,
    height: 40,
    borderRadius: Radii.small,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 17, fontWeight: "700" },
  studentDetails: { fontSize: 13, marginTop: 3 },
  boardedTime: { fontSize: 12, fontWeight: "600", marginTop: 5 },
  deliverButton: {
    borderRadius: Radii.medium,
    paddingVertical: 16,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  deliverButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  remainingPointsTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  remainingPointRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  remainingPointNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  remainingPointName: { fontSize: 14, fontWeight: "600" },
  remainingPointCount: { fontSize: 13 },
  completedCard: { borderRadius: Radii.xlarge, padding: 24, alignItems: "center" },
  completedTitle: { fontSize: 20, fontWeight: "800", textAlign: "center", marginTop: 12 },
  completedText: { fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 8 },
  finishButton: { borderRadius: Radii.medium, paddingVertical: 15, paddingHorizontal: 24, marginTop: 20 },
  finishButtonText: { fontSize: 16, fontWeight: "700" },
  emptyCard: { borderRadius: Radii.large, padding: 20, gap: 4 },
  emptyTitle: { fontSize: 17, fontWeight: "700", marginTop: 8 },
  emptyText: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  deliveredRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  deliveredName: { fontSize: 15, fontWeight: "700" },
  deliveredPoint: { fontSize: 13, marginTop: 3 },
});
