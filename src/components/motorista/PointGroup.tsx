import { StyleSheet, View } from "react-native";

import { StudentCard } from "@/components/motorista/StudentCard";
import { Text } from "@/components/ui/Text";
import { MapPinIcon } from "@/components/ui/icons";
import { Radii } from "@/constants/theme";
import { AlunoMotorista, SentidoViagem, SituacaoEmbarque } from "@/domain/types";
import { useTheme } from "@/hooks/use-theme";

type PointGroupProps = {
  ponto: string;
  alunos: AlunoMotorista[];
  sentidoViagem: SentidoViagem;
  permitirAcoes?: boolean;
  onAlterarSituacao: (alunoId: number, novaSituacao: SituacaoEmbarque) => void;
};

export function PointGroup({
  ponto,
  alunos,
  sentidoViagem,
  permitirAcoes = true,
  onAlterarSituacao,
}: PointGroupProps) {
  const theme = useTheme();

  return (
    <View style={styles.pointGroup}>
      <View style={[styles.pointGroupHeader, { backgroundColor: theme.infoBg }]}>
        <View style={[styles.pointGroupIcon, { backgroundColor: theme.surface }]}>
          <MapPinIcon size={16} color={theme.primary} weight="bold" />
        </View>

        <View style={styles.pointTextArea}>
          <Text style={[styles.pointGroupTitle, { color: theme.primary }]}>{ponto}</Text>
          <Text style={[styles.pointGroupCount, { color: theme.textSecondary }]}>
            {alunos.length} aluno(s)
          </Text>
        </View>
      </View>

      {alunos.map((aluno) => (
        <StudentCard
          key={aluno.id}
          aluno={aluno}
          permitirAcoes={permitirAcoes}
          sentidoViagem={sentidoViagem}
          onAlterarSituacao={onAlterarSituacao}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pointGroup: {
    marginBottom: 18,
  },
  pointGroupHeader: {
    borderRadius: Radii.medium,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  pointGroupIcon: {
    width: 32,
    height: 32,
    borderRadius: Radii.small,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  pointTextArea: {
    flex: 1,
  },
  pointGroupTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  pointGroupCount: {
    fontSize: 12,
    marginTop: 3,
  },
});
