import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, radius } from "../../theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
      gap: 8,
    };

    // Sizes
    if (size === "sm") {
      base.paddingVertical = 8;
      base.paddingHorizontal = 12;
    } else if (size === "lg") {
      base.paddingVertical = 16;
      base.paddingHorizontal = 24;
    } else {
      base.paddingVertical = 12;
      base.paddingHorizontal = 18;
    }

    // Variants
    if (variant === "primary") {
      base.backgroundColor = colors.navy[900];
    } else if (variant === "secondary") {
      base.backgroundColor = colors.amber[400];
    } else if (variant === "outline") {
      base.backgroundColor = "transparent";
      base.borderWidth = 1.5;
      base.borderColor = colors.navy[900];
    } else if (variant === "ghost") {
      base.backgroundColor = "transparent";
    } else if (variant === "danger") {
      base.backgroundColor = colors.status.danger;
    }

    if (disabled || loading) {
      base.opacity = 0.55;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: "700",
    };

    if (size === "sm") {
      base.fontSize = 12;
    } else if (size === "lg") {
      base.fontSize = 16;
    } else {
      base.fontSize = 14;
    }

    if (variant === "primary") {
      base.color = colors.amber[400];
    } else if (variant === "secondary") {
      base.color = colors.navy[900];
    } else if (variant === "outline" || variant === "ghost") {
      base.color = colors.navy[900];
    } else if (variant === "danger") {
      base.color = colors.white;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? colors.amber[400] : colors.navy[900]}
        />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};
