import { router } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import {
  BriefcaseIcon,
  CaretRightIcon,
  SteeringWheelIcon,
  UsersThreeIcon,
  type Icon,
} from "@/components/ui/icons";
import { Radii } from "@/constants/theme";
import { Perfil } from "@/domain/types";
import { useTheme } from "@/hooks/use-theme";

type OpcaoPerfil = {
  perfil: Perfil;
  icone: Icon;
  titulo: string;
  descricao: string;
};

const opcoes: OpcaoPerfil[] = [
  {
    perfil: "responsavel",
    icone: UsersThreeIcon,
    titulo: "Responsável",
    descricao: "Confirmar ida, volta e acompanhar o embarque do aluno.",
  },
  {
    perfil: "motorista",
    icone: SteeringWheelIcon,
    titulo: "Motorista",
    descricao: "Conferir passageiros, embarques e finalizar viagens.",
  },
  {
    perfil: "gestor",
    icone: BriefcaseIcon,
    titulo: "Gestor",
    descricao: "Administrar alunos, responsáveis, viagens e avisos.",
  },
];

export function PerfilScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <ScreenHeader
        variant="hero"
        title="Rota CMB"
        subtitle="Tavares Transportes"
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.question, { color: theme.text }]}>
          Como você deseja entrar?
        </Text>

        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Escolha o perfil correspondente à sua função no transporte escolar.
        </Text>

        {opcoes.map((opcao) => (
          <TouchableOpacity
            key={opcao.perfil}
            onPress={() => router.push(`/login?perfil=${opcao.perfil}`)}
          >
            <Card style={styles.profileCard}>
              <View style={[styles.profileIcon, { backgroundColor: theme.infoBg }]}>
                <opcao.icone size={26} color={theme.primary} weight="bold" />
              </View>

              <View style={styles.profileTextArea}>
                <Text style={[styles.profileTitle, { color: theme.text }]}>
                  {opcao.titulo}
                </Text>

                <Text
                  style={[styles.profileDescription, { color: theme.textSecondary }]}
                >
                  {opcao.descricao}
                </Text>
              </View>

              <CaretRightIcon size={20} color={theme.textMuted} />
            </Card>
          </TouchableOpacity>
        ))}

        <Text style={[styles.footer, { color: theme.textMuted }]}>
          Acesso restrito aos usuários autorizados
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    paddingBottom: 36,
  },
  question: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  profileCard: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: Radii.medium,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  profileTextArea: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  profileDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  footer: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
