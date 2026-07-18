import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet } from "react-native";

import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { BusIcon } from "@/components/ui/icons";
import { useTheme } from "@/hooks/use-theme";

export function BemVindoScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <StatusBar style="light" />

      <ScreenHeader
        variant="hero"
        icon={BusIcon}
        title="Rota CMB"
        subtitle="Tavares Transportes"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.welcome, { color: theme.text }]}>Bem-vindo!</Text>

        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Acompanhe confirmações, embarques e informações do transporte
          escolar.
        </Text>

        <Button label="Entrar no aplicativo" onPress={() => router.push("/perfil")} />

        <Text style={[styles.footer, { color: theme.textMuted }]}>
          Transporte escolar com organização e segurança
        </Text>

        <Text style={[styles.footerCredit, { color: theme.textMuted }]}>
          Desenvolvido por EDS
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 28,
  },
  footer: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  footerCredit: {
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
});
