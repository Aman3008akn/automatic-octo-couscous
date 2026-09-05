import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, radius } from "../../theme";

interface BadgeProps {
  label: string;
  variant?: "success" | "danger" | "warning" | "info" | "navy" | "outline";
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "navy",
  style,
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case "success":
        return { bg: colors.status.successBg, text: colors.status.success, border: colors.status.success };
      case "danger":
        return { bg: colors.status.dangerBg, text: colors.status.danger, border: colors.status.danger };
      case "warning":
        return { bg: colors.status.warningBg, text: colors.amber[600], border: colors.amber[400] };
      case "info":
        return { bg: colors.status.infoBg, text: colors.status.info, border: colors.status.info };
      case "outline":
        return { bg: "transparent", text: colors.text.secondary, border: colors.line };
      case "navy":
      default:
        return { bg: colors.navy[50], text: colors.navy[900], border: colors.navy[100] };
    }
  };

  const { bg, text, border } = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
