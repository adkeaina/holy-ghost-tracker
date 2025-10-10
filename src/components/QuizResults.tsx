import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import GlassyCard from "./GlassyCard";
import { useTheme } from "../theme";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onBackToHome: () => void;
}

export default function QuizResults({
  score,
  totalQuestions,
  onRestart,
  onBackToHome,
}: QuizResultsProps) {
  const { theme } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.3));
  const [confettiAnim] = useState(new Animated.Value(0));
  const [showConfetti, setShowConfetti] = useState(false);

  const percentage = Math.round((score / totalQuestions) * 100);
  const { width } = Dimensions.get("window");

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger celebration effects
    if (percentage >= 70) {
      setShowConfetti(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, []);

  const getPerformanceMessage = () => {
    if (percentage === 100) {
      return {
        title: "Perfect! 🎉",
        message: "You have incredible spiritual insight!",
        color: theme.colors.success,
        icon: "trophy" as const,
      };
    } else if (percentage >= 80) {
      return {
        title: "Excellent! ⭐",
        message: "Your spiritual awareness is impressive!",
        color: theme.colors.success,
        icon: "star" as const,
      };
    } else if (percentage >= 70) {
      return {
        title: "Well Done! 👏",
        message: "You have a good grasp of your spiritual journey!",
        color: theme.colors.primary,
        icon: "thumbs-up" as const,
      };
    } else if (percentage >= 50) {
      return {
        title: "Good Effort! 💫",
        message: "Keep reflecting on your spiritual experiences!",
        color: theme.colors.warning,
        icon: "heart" as const,
      };
    } else {
      return {
        title: "Keep Growing! 🌱",
        message: "Every spiritual journey is unique - keep exploring!",
        color: theme.colors.warning,
        icon: "leaf" as const,
      };
    }
  };

  const performance = getPerformanceMessage();

  return (
    <ScrollView style={styles.container}>
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <GlassyCard style={styles.resultCard}>
          <View style={styles.header}>
            <Ionicons
              name={performance.icon}
              size={60}
              color={performance.color}
              style={styles.icon}
            />
            <Text style={[styles.title, { color: performance.color }]}>
              {performance.title}
            </Text>
            <Text style={[styles.message, { color: theme.colors.textMuted }]}>
              {performance.message}
            </Text>
          </View>

          <View style={styles.scoreContainer}>
            <View
              style={[
                styles.scoreCircle,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                style={[styles.scoreNumber, { color: theme.colors.buttonText }]}
              >
                {score}
              </Text>
              <Text
                style={[styles.scoreLabel, { color: theme.colors.buttonText }]}
              >
                out of
              </Text>
              <Text
                style={[
                  styles.totalQuestions,
                  { color: theme.colors.buttonText },
                ]}
              >
                {totalQuestions}
              </Text>
            </View>
            <Text style={[styles.percentage, { color: theme.colors.text }]}>
              {percentage}%
            </Text>
          </View>

          <View
            style={[
              styles.statsContainer,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.statItem}>
              <Ionicons
                name='checkmark-circle'
                size={24}
                color={theme.colors.success}
              />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {score}
              </Text>
              <Text
                style={[styles.statLabel, { color: theme.colors.textMuted }]}
              >
                Correct
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name='close-circle'
                size={24}
                color={theme.colors.error}
              />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {totalQuestions - score}
              </Text>
              <Text
                style={[styles.statLabel, { color: theme.colors.textMuted }]}
              >
                Incorrect
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name='trending-up'
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {percentage}%
              </Text>
              <Text
                style={[styles.statLabel, { color: theme.colors.textMuted }]}
              >
                Score
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.encouragementContainer,
              {
                backgroundColor: `${theme.colors.primary}20`,
                borderLeftColor: theme.colors.primary,
              },
            ]}
          >
            <Text
              style={[styles.encouragementText, { color: theme.colors.text }]}
            >
              {percentage >= 70
                ? "Your spiritual insights are growing stronger! 🌟"
                : "Every question helps deepen your spiritual understanding! 💝"}
            </Text>
          </View>
        </GlassyCard>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { borderColor: theme.colors.primary },
          ]}
          onPress={onRestart}
        >
          <Ionicons name='refresh' size={20} color={theme.colors.primary} />
          <Text
            style={[
              styles.secondaryButtonText,
              { color: theme.colors.primary },
            ]}
          >
            Try Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={onBackToHome}
        >
          <Ionicons name='home' size={20} color={theme.colors.buttonText} />
          <Text
            style={[
              styles.primaryButtonText,
              { color: theme.colors.buttonText },
            ]}
          >
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    zIndex: 1000,
    pointerEvents: "none",
  },
  confetti: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  resultCard: {
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 24,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  totalQuestions: {
    fontSize: 24,
    fontWeight: "600",
  },
  percentage: {
    fontSize: 28,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 25,
    paddingVertical: 20,
    borderRadius: 15,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  encouragementContainer: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  encouragementText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    gap: 15,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 25,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
