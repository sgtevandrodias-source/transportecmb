import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { type ReactNode } from "react";

import { CardShadow, Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.large,
    borderWidth: 1,
    padding: 18,
    ...CardShadow,
  },
});
