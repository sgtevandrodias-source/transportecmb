import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type OptionRowProps = {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
};

/** Linha de opções em formato de pílula — mesmo visual do seletor de sentido (Ida/Volta) de ViagensScreen. */
export function OptionRow({ options, value, onChange }: OptionRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selecionado = value === option;

        return (
          <TouchableOpacity key={option} style={styles.wrapper} onPress={() => onChange(option)}>
            <View
              style={[
                styles.pill,
                {
                  borderColor: selecionado ? theme.primary : theme.border,
                  borderWidth: selecionado ? 2 : 1,
                  backgroundColor: selecionado ? theme.infoBg : theme.surfaceAlt,
                },
              ]}
            >
              <Text style={[styles.pillText, { color: selecionado ? theme.primary : theme.textSecondary }]}>
                {option}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  wrapper: {
    flexGrow: 1,
  },
  pill: {
    borderRadius: Radii.small,
    paddingVertical: 13,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
