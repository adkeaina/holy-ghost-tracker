import React from "react";
import { StyleSheet, ViewStyle, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTheme } from "../theme";

interface BackgroundGradientProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  colors?: [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  enableMist?: boolean;
}

export default function BackgroundGradient({
  children,
  style,
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  enableMist = true,
}: BackgroundGradientProps) {
  const { theme } = useTheme();

  // Use theme colors if not provided
  const gradientColors = colors || [
    theme.colors.paleSkyBlue,
    theme.colors.softLavender,
    theme.colors.pearlWhite,
  ];
  return (
    <LinearGradient
      colors={gradientColors}
      start={start}
      end={end}
      style={[styles.container, style]}
    >
      {enableMist && (
        <View style={styles.mistOverlay}>
          <BlurView intensity={15} tint='light' style={styles.blurLayer} />
          <View style={styles.mistLayer1} />
          <View style={styles.mistLayer2} />
          <View style={styles.whiteOverlay} />
        </View>
      )}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mistOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  blurLayer: {
    flex: 1,
    opacity: 0.4,
  },
  mistLayer1: {
    position: "absolute",
    top: "10%",
    left: "5%",
    right: "15%",
    height: "30%",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 50,
    transform: [{ rotate: "15deg" }],
  },
  mistLayer2: {
    position: "absolute",
    bottom: "20%",
    left: "20%",
    right: "5%",
    height: "25%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 40,
    transform: [{ rotate: "-10deg" }],
  },
  whiteOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});
