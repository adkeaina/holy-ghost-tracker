import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Slider from "@react-native-community/slider";

import {
  ImpressionCategory,
  QuizQuestion,
  SpiritualImpression,
} from "../types";
import { getCategories, getImpressions } from "../utils/storage";
import CategoryList from "./CategoryList";
import { generateQuiz } from "../utils/quizGenerator";

interface QuizSetupProps {
  onQuizGenerated?: (questions: QuizQuestion[]) => void;
}

export default function QuizSetup({ onQuizGenerated }: QuizSetupProps) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<ImpressionCategory[]>([]);
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(0); // 0 for unlimited
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [impressions, setImpressions] = useState<SpiritualImpression[]>([]);
  const [quizType, setQuizType] = useState<"impressions" | "custom">(
    "impressions"
  );
  const [customPrompt, setCustomPrompt] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedCategories, loadedImpressions] = await Promise.all([
        getCategories(),
        getImpressions(),
      ]);
      setCategories(loadedCategories);
      setImpressions(loadedImpressions);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleCategorySelection = (categories: number[]) => {
    setSelectedCategories(categories);
  };

  const handleStartQuiz = async () => {
    try {
      setIsGeneratingQuiz(true);

      let quizInput: SpiritualImpression[] | string;

      if (quizType === "custom") {
        // Validate custom prompt
        if (!customPrompt.trim()) {
          Alert.alert(
            "Custom Prompt Required",
            "Please enter a topic or subject for your custom quiz."
          );
          return;
        }
        quizInput = customPrompt.trim();
      } else {
        // Handle impressions quiz
        const filteredImpressions =
          selectedCategories.length > 0
            ? impressions.filter((impression) =>
                impression.categories.some((catId) =>
                  selectedCategories.includes(catId)
                )
              )
            : impressions;

        if (filteredImpressions.length === 0) {
          Alert.alert(
            "No Impressions Found",
            "No impressions found in the selected categories. Please add some impressions first or select different categories."
          );
          return;
        }

        if (filteredImpressions.length < 3) {
          Alert.alert(
            "Not Enough Impressions",
            "You need at least 3 impressions to generate a meaningful quiz. Please add more impressions or include more categories."
          );
          return;
        }

        quizInput = filteredImpressions;
      }

      // Try real AI quiz generation first
      const result = await generateQuiz(quizInput, questionCount);

      let questionsToUse: QuizQuestion[];

      if ("questions" in result && result.questions.length > 0) {
        // Use AI-generated questions
        questionsToUse = result.questions;
      } else {
        // Fall back to mock questions if AI generation fails
        console.warn(
          "AI generation failed, using mock questions:",
          "error" in result ? result.error : "Unknown error"
        );

        // Mock response for demonstration purposes
        questionsToUse = [
          {
            question:
              "What was the main theme of your most recent spiritual impression?",
            options: [
              "Personal growth and development",
              "Service to others",
              "Gratitude and thankfulness",
              "Faith and trust in God",
            ],
            correctAnswer: 0,
          },
          {
            question:
              "Which location is most commonly associated with your spiritual impressions?",
            options: ["Church", "Home", "Nature/Outdoors", "BYU Campus"],
            correctAnswer: 0,
          },
          {
            question:
              "What time of day do you typically record your spiritual impressions?",
            options: ["Morning", "Afternoon", "Evening", "Late night"],
            correctAnswer: 2,
          },
        ].slice(0, questionCount); // Limit to requested question count
      }

      if (onQuizGenerated) {
        onQuizGenerated(questionsToUse);
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      Alert.alert("Error", "Failed to generate quiz. Please try again.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>AI Quiz Setup</Text>
        <Text style={styles.subtitle}>
          Test your knowledge of past spiritual impressions with AI
        </Text>

        <View>
          {/* Quiz Type */}
          <View style={styles.section}>
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  quizType === "impressions" && styles.segmentButtonActive,
                ]}
                onPress={() => setQuizType("impressions")}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    quizType === "impressions" &&
                      styles.segmentButtonTextActive,
                  ]}
                >
                  Impressions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  quizType === "custom" && styles.segmentButtonActive,
                ]}
                onPress={() => setQuizType("custom")}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    quizType === "custom" && styles.segmentButtonTextActive,
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Selection */}
          {quizType === "impressions" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <CategoryList
                selectedCategories={selectedCategories}
                onSelectionChange={handleCategorySelection}
                style={styles.categoryList}
              />
            </View>
          )}
          {quizType === "custom" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Custom</Text>
              <TextInput
                style={styles.customQuestionsInput}
                placeholder='Enter your topic of interest...'
                value={customPrompt}
                onChangeText={setCustomPrompt}
                multiline
                numberOfLines={6}
                textAlignVertical='top'
              />
            </View>
          )}
        </View>

        {/* Question Count */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Questions</Text>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={30}
            step={5}
            value={questionCount}
            onValueChange={(value) => setQuestionCount(Math.round(value))}
            minimumTrackTintColor='#3498db'
            maximumTrackTintColor='#bdc3c7'
            thumbTintColor='#3498db'
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderEndLabel}>5</Text>
            <Text style={styles.sliderEndLabel}>10</Text>
            <Text style={styles.sliderEndLabel}>15</Text>
            <Text style={styles.sliderEndLabel}>20</Text>
            <Text style={styles.sliderEndLabel}>25</Text>
            <Text style={styles.sliderEndLabel}>30</Text>
          </View>
        </View>

        {/* Time Limit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Limit</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={20}
            step={1}
            value={timeLimit}
            onValueChange={(value) => setTimeLimit(Math.round(value))}
            minimumTrackTintColor='#3498db'
            maximumTrackTintColor='#bdc3c7'
            thumbTintColor='#3498db'
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderEndLabel}>No limit</Text>
            <Text style={styles.sliderLabel}>
              {timeLimit > 0
                ? `${timeLimit} minute${timeLimit !== 1 ? "s" : ""}`
                : "No limit"}
            </Text>

            <Text style={styles.sliderEndLabel}>20 min</Text>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            isGeneratingQuiz && styles.startButtonDisabled,
          ]}
          onPress={handleStartQuiz}
          disabled={isGeneratingQuiz}
        >
          {isGeneratingQuiz ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color='white' size='small' />
              <Text style={[styles.startButtonText, { marginLeft: 10 }]}>
                Generating Quiz...
              </Text>
            </View>
          ) : (
            <Text style={styles.startButtonText}>Start Quiz</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 30,
  },
  section: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 15,
  },
  allCategoriesButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ecf0f1",
    borderRadius: 15,
  },
  allCategoriesButtonText: {
    fontSize: 12,
    color: "#3498db",
    fontWeight: "600",
  },
  selectedText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 15,
    fontStyle: "italic",
  },
  categoryList: {
    marginBottom: 0,
  },
  selectedOption: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  selectedOptionText: {
    color: "white",
  },
  unlimitedButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#ecf0f1",
    alignItems: "center",
    marginTop: 10,
  },
  unlimitedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  orText: {
    textAlign: "center",
    fontSize: 14,
    color: "#7f8c8d",
    marginVertical: 15,
    fontStyle: "italic",
  },
  sliderContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingHorizontal: 7,
  },
  sliderEndLabel: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  startButton: {
    backgroundColor: "#3498db",
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#3498db",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  startButtonDisabled: {
    backgroundColor: "#bdc3c7",
    shadowOpacity: 0.1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#ecf0f1",
    borderRadius: 25,
    padding: 4,
    alignSelf: "center",
    width: 200,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#3498db",
    shadowColor: "#3498db",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f8c8d",
  },
  segmentButtonTextActive: {
    color: "white",
  },
  customQuestionsInput: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ecf0f1",
    fontSize: 16,
    color: "#2c3e50",
    minHeight: 120,
  },
});
