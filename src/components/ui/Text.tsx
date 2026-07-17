import { Text as RNText, StyleSheet, type TextProps } from "react-native";

import { FontFamily } from "@/constants/theme";

const DISPLAY_THRESHOLD = 18;

function resolveFontFamily(fontSize: number, fontWeight?: string | number) {
  const weight = String(fontWeight ?? "400");
  const isBold = weight === "bold" || Number(weight) >= 700;
  const isSemibold = Number(weight) === 600;
  const isMedium = Number(weight) === 500;

  if (fontSize >= DISPLAY_THRESHOLD) {
    return isBold ? FontFamily.display.bold : FontFamily.display.semibold;
  }

  if (isBold) return FontFamily.body.bold;
  if (isSemibold) return FontFamily.body.semibold;
  if (isMedium) return FontFamily.body.medium;
  return FontFamily.body.regular;
}

/**
 * Substituto do `Text` do React Native: escolhe automaticamente a família
 * de fonte (Plus Jakarta Sans para títulos, Inter para o resto) a partir do
 * `fontSize`/`fontWeight` já definidos no style de cada tela — assim a
 * tipografia nova se aplica em todo o app trocando só o import do `Text`,
 * sem reescrever cada estilo. Fontes customizadas ignoram `fontWeight`
 * nativo, então ele é convertido aqui no arquivo certo em vez de sumir.
 */
export function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const fontSize = typeof flat.fontSize === "number" ? flat.fontSize : 15;
  const fontFamily = resolveFontFamily(fontSize, flat.fontWeight);

  return <RNText {...props} style={[style, { fontFamily }]} />;
}
