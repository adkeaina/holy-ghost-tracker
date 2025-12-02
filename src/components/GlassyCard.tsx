import React from "react";
import { StyleSheet, ViewStyle, View, ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme";
import { Platform } from "react-native";

interface GlassyCardProps extends ViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: "light" | "dark" | "default";
  borderRadius?: number;
  padding?: number;
}

export default function GlassyCard({
  children,
  style,
  intensity = 20,
  tint = "light",
  borderRadius = 20,
  padding = 20,
  ...props
}: GlassyCardProps) {
  const { theme } = useTheme();

  // Adjust tint based on theme mode
  const blurTint = theme.colors.background === "#FAFAFA" ? "light" : "dark";

  // iOS: Use liquid glass effect
  if (Platform.OS === "ios") {
    return (
      <View style={[styles.container, { borderRadius }, style]} {...props}>
        <BlurView
          intensity={intensity}
          tint={blurTint}
          style={[styles.blurView, { borderRadius }]}
        >
          <LinearGradient
            colors={[
              theme.colors.background === "#FAFAFA"
                ? "rgba(255, 255, 255, 0.4)"
                : "rgba(255, 255, 255, 0.1)",
              theme.colors.background === "#FAFAFA"
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(255, 255, 255, 0.05)",
              theme.colors.background === "#FAFAFA"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.02)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientOverlay, { borderRadius }]}
          />
          <View style={[styles.content, { borderRadius, padding }]}>
            {children}
          </View>
        </BlurView>
      </View>
    );
  }

  // Other platforms: Simple white background
  return (
    <View
      style={[
        styles.container,
        styles.simpleBackground,
        { borderRadius, padding },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  blurView: {
    overflow: "hidden",
    width: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  content: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    // Inner shadow effect using text shadow for depth
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  simpleBackground: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
