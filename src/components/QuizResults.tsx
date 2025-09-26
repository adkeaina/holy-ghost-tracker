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
        color: "#27ae60",
        icon: "trophy" as const,
      };
    } else if (percentage >= 80) {
      return {
        title: "Excellent! ⭐",
        message: "Your spiritual awareness is impressive!",
        color: "#27ae60",
        icon: "star" as const,
      };
    } else if (percentage >= 70) {
      return {
        title: "Well Done! 👏",
        message: "You have a good grasp of your spiritual journey!",
        color: "#3498db",
        icon: "thumbs-up" as const,
      };
    } else if (percentage >= 50) {
      return {
        title: "Good Effort! 💫",
        message: "Keep reflecting on your spiritual experiences!",
        color: "#f39c12",
        icon: "heart" as const,
      };
    } else {
      return {
        title: "Keep Growing! 🌱",
        message: "Every spiritual journey is unique - keep exploring!",
        color: "#e67e22",
        icon: "leaf" as const,
      };
    }
  };

  const performance = getPerformanceMessage();

  const renderConfetti = () => {
    if (!showConfetti) return null;

    const confettiPieces = Array.from({ length: 20 }, (_, i) => (
      <Animated.View
        key={i}
        style={[
          styles.confetti,
          {
            left: Math.random() * width,
            backgroundColor: [
              "#3498db",
              "#27ae60",
              "#f39c12",
              "#e74c3c",
              "#9b59b6",
            ][Math.floor(Math.random() * 5)],
            transform: [
              {
                translateY: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 600],
                }),
              },
              {
                rotate: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          },
        ]}
      />
    ));

    return <View style={styles.confettiContainer}>{confettiPieces}</View>;
  };

  return (
    <ScrollView style={styles.container}>
      {renderConfetti()}

      <Animated.View
        style={[
          styles.resultCard,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
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
          <Text style={styles.message}>{performance.message}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreLabel}>out of</Text>
            <Text style={styles.totalQuestions}>{totalQuestions}</Text>
          </View>
          <Text style={styles.percentage}>{percentage}%</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name='checkmark-circle' size={24} color='#27ae60' />
            <Text style={styles.statNumber}>{score}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name='close-circle' size={24} color='#e74c3c' />
            <Text style={styles.statNumber}>{totalQuestions - score}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name='trending-up' size={24} color='#3498db' />
            <Text style={styles.statNumber}>{percentage}%</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </View>

        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            {percentage >= 70
              ? "Your spiritual insights are growing stronger! 🌟"
              : "Every question helps deepen your spiritual understanding! 💝"}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onRestart}>
          <Ionicons name='refresh' size={20} color='#3498db' />
          <Text style={styles.secondaryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={onBackToHome}>
          <Ionicons name='home' size={20} color='white' />
          <Text style={styles.primaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ecf0f1",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
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
    color: "#7f8c8d",
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
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#3498db",
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
    color: "white",
  },
  scoreLabel: {
    fontSize: 12,
    color: "white",
    opacity: 0.8,
  },
  totalQuestions: {
    fontSize: 24,
    fontWeight: "600",
    color: "white",
  },
  percentage: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 25,
    paddingVertical: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 2,
    fontWeight: "600",
  },
  encouragementContainer: {
    backgroundColor: "#e8f4f8",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  encouragementText: {
    fontSize: 16,
    color: "#2c3e50",
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
    backgroundColor: "#3498db",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 25,
    shadowColor: "#3498db",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#3498db",
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
    color: "#3498db",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
