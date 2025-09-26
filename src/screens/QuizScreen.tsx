import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QuizQuestion } from "../types";
import QuizSetup from "../components/QuizSetup";
import QuizQuestionScreen from "../components/QuizQuestionScreen";
import QuizResults from "../components/QuizResults";

export default function QuizScreen() {
  const [quizState, setQuizState] = useState<"setup" | "question" | "result">(
    "setup"
  );
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  const handleQuizGenerated = (questions: QuizQuestion[]) => {
    setQuizQuestions(questions);
    setQuizState("question");
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex === quizQuestions.length - 1) {
      setQuizState("result");
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleRestart = () => {
    setQuizState("setup");
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizQuestions([]);
  };

  const handleBackToHome = () => {
    setQuizState("setup");
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizQuestions([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {quizState === "setup" && (
        <QuizSetup onQuizGenerated={handleQuizGenerated} />
      )}
      {quizState === "question" && (
        <QuizQuestionScreen
          question={quizQuestions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quizQuestions.length}
          onNext={handleNext}
          onAnswer={handleAnswer}
        />
      )}
      {quizState === "result" && (
        <QuizResults
          score={score}
          totalQuestions={quizQuestions.length}
          onRestart={handleRestart}
          onBackToHome={handleBackToHome}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 30,
  },
});
