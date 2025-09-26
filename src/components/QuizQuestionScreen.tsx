import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { QuizQuestion } from "../types";

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
      return styles.option;
    }

    if (index === question.correctAnswer) {
      // Always highlight correct answer in green after answering
      return [styles.option, styles.correctOption];
    }

    if (index === selectedAnswer && selectedAnswer !== question.correctAnswer) {
      // Highlight incorrect selected answer in red
      return [styles.option, styles.incorrectOption];
    }

    return [styles.option, styles.unselectedOption];
  };

  const getOptionTextStyle = (index: number) => {
    if (!hasAnswered) {
      return styles.optionText;
    }

    if (
      index === question.correctAnswer ||
      (index === selectedAnswer && selectedAnswer !== question.correctAnswer)
    ) {
      return [styles.optionText, styles.highlightedText];
    }

    return [styles.optionText, styles.fadedText];
  };

  const isLastQuestion = questionNumber === totalQuestions;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.questionNumber}>
          Question {questionNumber} of {totalQuestions}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(questionNumber / totalQuestions) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(index)}
            onPress={() => handleOptionPress(index)}
            disabled={hasAnswered}
          >
            <View style={styles.optionContent}>
              <Text style={getOptionTextStyle(index)}>{option}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {hasAnswered && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={async () => {
              await setHasAnswered(false);
              onNext();
            }}
          >
            <Text style={styles.nextButtonText}>
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
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
  },
  questionNumber: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#ecf0f1",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 2,
  },
  questionContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#ecf0f1",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    lineHeight: 28,
    textAlign: "center",
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#ecf0f1",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  correctOption: {
    borderColor: "#27ae60",
    backgroundColor: "#d5f4e6",
  },
  incorrectOption: {
    borderColor: "#e74c3c",
    backgroundColor: "#fadbd8",
  },
  unselectedOption: {
    opacity: 0.6,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
    flex: 1,
    lineHeight: 22,
  },
  highlightedText: {
    fontWeight: "600",
  },
  fadedText: {
    color: "#7f8c8d",
  },
  bottomContainer: {
    paddingBottom: 20,
  },
  nextButton: {
    backgroundColor: "#3498db",
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#3498db",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
