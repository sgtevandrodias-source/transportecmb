import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import { MaxContentWidth } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ScreenContainerProps = {
  children: ReactNode;
  keyboardAvoiding?: boolean;
};

/**
 * Moldura comum a toda tela: SafeAreaView + coluna central com largura
 * máxima. Não aplica padding interno — cabeçalho e conteúdo (normalmente um
 * ScrollView) cuidam do próprio espaçamento, já que o cabeçalho precisa
 * ocupar a largura total.
 */
export function ScreenContainer({
  children,
  keyboardAvoiding = false,
}: ScreenContainerProps) {
  const theme = useTheme();

  const inner = (
    <View style={[styles.inner, { backgroundColor: theme.surfaceAlt }]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.page }]}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.keyboardArea}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
  },
  keyboardArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  inner: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
  },
});
