import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { QuizQuestion } from "../types";
import GlassyCard from "./GlassyCard";
import { useTheme } from "../theme";

interface QuizQuestionScreenProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export default function QuizQuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
}: QuizQuestionScreenProps) {
  const { theme } = useTheme();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleOptionPress = (selectedIndex: number) => {
    if (hasAnswered) return;

    setSelectedAnswer(selectedIndex);
    setHasAnswered(true);

    const isCorrect = selectedIndex === question.correctAnswer;

    // Provide haptic feedback
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    onAnswer(isCorrect);
  };

  const getOptionStyle = (index: number) => {
    if (!hasAnswered) {
      return { ...styles.option, borderColor: theme.colors.border };
    }

    if (index === question.correctAnswer) {
      // Always highlight correct answer in green after answering
      return {
        ...styles.option,
        borderColor: theme.colors.success,
        backgroundColor: `${theme.colors.success}20`,
      };
    }

    if (index === selectedAnswer && selectedAnswer !== question.correctAnswer) {
      // Highlight incorrect selected answer in red
      return {
        ...styles.option,
        borderColor: theme.colors.error,
        backgroundColor: `${theme.colors.error}20`,
      };
    }

    return { ...styles.option, borderColor: theme.colors.border, opacity: 0.6 };
  };

  const getOptionTextStyle = (index: number) => {
    if (!hasAnswered) {
      return { ...styles.optionText, color: theme.colors.text };
    }

    if (
      index === question.correctAnswer ||
      (index === selectedAnswer && selectedAnswer !== question.correctAnswer)
    ) {
      return {
        ...styles.optionText,
        color: theme.colors.text,
        fontWeight: "600" as const,
      };
    }

    return { ...styles.optionText, color: theme.colors.textMuted };
  };

  const isLastQuestion = questionNumber === totalQuestions;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[styles.questionNumber, { color: theme.colors.textMuted }]}
        >
          Question {questionNumber} of {totalQuestions}
        </Text>
        <View
          style={[styles.progressBar, { backgroundColor: theme.colors.border }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.colors.primary,
                width: `${(questionNumber / totalQuestions) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <GlassyCard style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: theme.colors.text }]}>
          {question.question}
        </Text>
      </GlassyCard>

      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <GlassyCard key={index} style={getOptionStyle(index)} padding={0}>
            <TouchableOpacity
              style={styles.optionTouchable}
              onPress={() => handleOptionPress(index)}
              disabled={hasAnswered}
            >
              <View style={styles.optionContent}>
                <Text style={getOptionTextStyle(index)}>{option}</Text>
              </View>
            </TouchableOpacity>
          </GlassyCard>
        ))}
      </View>

      {hasAnswered && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={async () => {
              await setHasAnswered(false);
              onNext();
            }}
          >
            <Text
              style={[
                styles.nextButtonText,
                { color: theme.colors.buttonText },
              ]}
            >
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
  },
  questionNumber: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  questionContainer: {
    marginBottom: 25,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
    textAlign: "center",
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    marginBottom: 12,
    borderWidth: 2,
  },
  optionTouchable: {
    width: "100%",
    padding: 16,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    lineHeight: 22,
  },
  bottomContainer: {
    paddingBottom: 20,
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
