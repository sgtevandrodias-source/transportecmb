import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import {
  BusIcon,
  CheckCircleIcon,
  HourglassIcon,
  MapPinIcon,
  UserCircleIcon,
  UsersThreeIcon,
  XCircleIcon,
  type Icon,
} from "@/components/ui/icons";
import { useAuth } from "@/auth/session-context";
import { useRequireAuth } from "@/auth/with-auth-guard";
import { Radii } from "@/constants/theme";
import { AlunoMotorista, Viagem } from "@/domain/types";
import { useAlunos } from "@/hooks/use-alunos";
import { usePontos } from "@/hooks/use-pontos";
import { useViagens } from "@/hooks/use-viagens";
import { rosterService } from "@/services/roster-service";
import { viagensRepository } from "@/data/repositories/viagens.repository";
import { useTheme } from "@/hooks/use-theme";

type MenuItem = {
  icone: Icon;
  titulo: string;
  descricao: string;
  href: "/alunos" | "/pontos" | "/viagens" | "/responsaveis";
};

const menu: MenuItem[] = [
  { icone: UsersThreeIcon, titulo: "Alunos", descricao: "Cadastrar e consultar alunos", href: "/alunos" },
  { icone: MapPinIcon, titulo: "Pontos", descricao: "Organizar pontos de embarque", href: "/pontos" },
  { icone: BusIcon, titulo: "Viagens", descricao: "Criar e acompanhar viagens", href: "/viagens" },
  { icone: UserCircleIcon, titulo: "Responsáveis", descricao: "Cadastrar pais e responsáveis", href: "/responsaveis" },
];

function textoStatusViagem(status: Viagem["status"]) {
  switch (status) {
    case "em-andamento":
      return "Em andamento";
    case "finalizada":
      return "Finalizada";
    case "cancelada":
      return "Cancelada";
    default:
      return "Programada";
  }
}

export function GestorHomeScreen() {
  const { carregando: carregandoSessao } = useRequireAuth("gestor");
  const { logout } = useAuth();
  const theme = useTheme();

  const { items: alunos } = useAlunos();
  const { items: pontos } = usePontos();
  const { items: viagens } = useViagens();

  const [viagemDestaque, setViagemDestaque] = useState<Viagem | null>(null);
  const [roster, setRoster] = useState<AlunoMotorista[]>([]);

  useEffect(() => {
    async function calcularDestaque() {
      const destaque =
        viagensRepository.encontrarAtualPorSentido(viagens, "ida") ??
        viagensRepository.encontrarAtualPorSentido(viagens, "volta");

      setViagemDestaque(destaque);

      if (!destaque) {
        setRoster([]);
        return;
      }

      setRoster(await rosterService.montarRoster(destaque, alunos, pontos));
    }

    calcularDestaque();
  }, [viagens, alunos, pontos]);

  const confirmados = roster.filter((a) => a.confirmacaoResponsavel === "vai");
  const semResposta = roster.filter(
    (a) => a.confirmacaoResponsavel === "aguardando" || a.confirmacaoResponsavel === "nao-sei",
  );
  const naoUtilizarao = roster.filter((a) => a.confirmacaoResponsavel === "nao-vai");
  const embarcados = confirmados.filter((a) => a.situacao === "embarcou");
  const progresso =
    confirmados.length > 0 ? Math.round((embarcados.length / confirmados.length) * 100) : 0;

  if (carregandoSessao) {
    return null;
  }

  const resumo: { icone: Icon; valor: number; label: string; tone: "info" | "success" | "warning" | "danger" }[] = [
    { icone: UsersThreeIcon, valor: alunos.length, label: "Alunos cadastrados", tone: "info" },
    { icone: CheckCircleIcon, valor: confirmados.length, label: "Confirmados", tone: "success" },
    { icone: HourglassIcon, valor: semResposta.length, label: "Sem resposta", tone: "warning" },
    { icone: XCircleIcon, valor: naoUtilizarao.length, label: "Não utilizarão", tone: "danger" },
  ];

  const bgToneMap = { info: theme.infoBg, success: theme.successBg, warning: theme.warningBg, danger: theme.dangerBg };
  const fgToneMap = { info: theme.primary, success: theme.success, warning: theme.warning, danger: theme.danger };

  return (
    <ScreenContainer>
      <ScreenHeader
        variant="dashboard"
        title="Olá, gestor"
        subtitle="Rota CMB - Tavares Transportes"
        rightActionLabel="Sair"
        onRightAction={async () => {
          await logout();
          router.replace("/");
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Visão geral de hoje</Text>

        <View style={styles.summaryGrid}>
          {resumo.map((item) => (
            <Card key={item.label} style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: bgToneMap[item.tone] }]}>
                <item.icone size={20} color={fgToneMap[item.tone]} weight="bold" />
              </View>
              <Text style={[styles.summaryNumber, { color: theme.text }]}>{item.valor}</Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{item.label}</Text>
            </Card>
          ))}
        </View>

        <Card style={styles.tripCard}>
          {viagemDestaque ? (
            <>
              <View style={styles.tripHeader}>
                <View style={styles.tripHeaderText}>
                  <Text style={[styles.cardLabel, { color: theme.textMuted }]}>
                    Viagem em destaque
                  </Text>
                  <Text style={[styles.tripTitle, { color: theme.text }]}>
                    {viagemDestaque.sentido === "ida" ? "Ida para o CMB" : "Volta do CMB"}
                  </Text>
                  <Text style={[styles.tripInfo, { color: theme.textSecondary }]}>
                    Turno da {viagemDestaque.turno.toLowerCase()} • Saída prevista às{" "}
                    {viagemDestaque.horario}
                  </Text>
                </View>

                <Badge
                  label={textoStatusViagem(viagemDestaque.status)}
                  tone={viagemDestaque.status === "em-andamento" ? "success" : "warning"}
                />
              </View>

              <View style={styles.progressArea}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                    Embarques realizados
                  </Text>
                  <Text style={[styles.progressValue, { color: theme.text }]}>
                    {embarcados.length} de {confirmados.length}
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
              </View>
            </>
          ) : (
            <Text style={[styles.tripInfo, { color: theme.textSecondary }]}>
              Nenhuma viagem programada no momento.
            </Text>
          )}
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Gestão rápida</Text>

        <View style={styles.menuGrid}>
          {menu.map((item) => (
            <TouchableOpacity key={item.href} onPress={() => router.push(item.href)}>
              <Card style={styles.menuCard}>
                <View style={[styles.menuIcon, { backgroundColor: theme.infoBg }]}>
                  <item.icone size={22} color={theme.primary} weight="bold" />
                </View>
                <Text style={[styles.menuTitle, { color: theme.text }]}>{item.titulo}</Text>
                <Text style={[styles.menuDescription, { color: theme.textSecondary }]}>
                  {item.descricao}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },
  summaryCard: {
    width: "48%",
    minHeight: 135,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: Radii.small,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryNumber: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 10,
  },
  summaryLabel: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  tripCard: {
    marginBottom: 22,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tripHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  cardLabel: {
    fontSize: 13,
  },
  tripTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginTop: 4,
  },
  tripInfo: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  progressArea: {
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 13,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressTrack: {
    height: 10,
    borderRadius: 10,
    marginTop: 9,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  menuCard: {
    width: "48%",
    minHeight: 145,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: Radii.small,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },
  menuDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
