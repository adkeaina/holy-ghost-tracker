import React, { useState } from "react";
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

import { QuizQuestion, SpiritualImpression } from "../types";
import { useImpressions } from "../context/ImpressionsContext";
import CategoryList from "./CategoryList";
import { generateQuiz } from "../utils/quizGenerator";
import { useTheme } from "../theme";

interface QuizSetupProps {
  onQuizGenerated?: (questions: QuizQuestion[]) => void;
}

export default function QuizSetup({ onQuizGenerated }: QuizSetupProps) {
  const { theme } = useTheme();
  const { impressions, categories } = useImpressions();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(0); // 0 for unlimited
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizType, setQuizType] = useState<"impressions" | "custom">(
    "impressions"
  );
  const [customPrompt, setCustomPrompt] = useState("");

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
        <Text style={[styles.title, { color: theme.colors.text }]}>
          AI Quiz Setup
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Test your knowledge of past spiritual impressions with AI
        </Text>

        <View>
          {/* Quiz Type */}
          <View style={styles.section}>
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  quizType === "impressions" && [
                    styles.segmentButtonActive,
                    { backgroundColor: theme.colors.primary },
                  ],
                ]}
                onPress={() => setQuizType("impressions")}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    quizType === "impressions"
                      ? [
                          styles.segmentButtonTextActive,
                          { color: theme.colors.buttonText },
                        ]
                      : { color: theme.colors.textMuted },
                  ]}
                >
                  Impressions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  quizType === "custom" && [
                    styles.segmentButtonActive,
                    { backgroundColor: theme.colors.primary },
                  ],
                ]}
                onPress={() => setQuizType("custom")}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    quizType === "custom"
                      ? [
                          styles.segmentButtonTextActive,
                          { color: theme.colors.buttonText },
                        ]
                      : { color: theme.colors.textMuted },
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
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Categories
              </Text>
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
                placeholder="Quiz me on Lehi's vision..."
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
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Number of Questions
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={30}
            step={5}
            value={questionCount}
            onValueChange={(value) => setQuestionCount(Math.round(value))}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
          <View style={styles.sliderLabels}>
            <Text
              style={[styles.sliderEndLabel, { color: theme.colors.textMuted }]}
            >
              5
            </Text>
            <Text
              style={[styles.sliderEndLabel, { color: theme.colors.textMuted }]}
            >
              10
            </Text>
            <Text
              style={[styles.sliderEndLabel, { color: theme.colors.textMuted }]}
            >
              15
            </Text>
            <Text
              style={[styles.sliderEndLabel, { color: theme.colors.textMuted }]}
            >
              20
            </Text>
            <Text
              style={[styles.sliderEndLabel, { color: theme.colors.textMuted }]}
            >
              25
            </Text>
            <Text
              style={[styles.sliderEndLabel, { color: theme.colors.textMuted }]}
            >
              30
            </Text>
          </View>
        </View>

        {/* Time Limit */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Time Limit
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={20}
            step={1}
            value={timeLimit}
            onValueChange={(value) => setTimeLimit(Math.round(value))}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
          <View style={styles.sliderLabels}>
            <Text
              style={[styles.sliderEndLabel, { color: theme.colors.textMuted }]}
            >
              No limit
            </Text>
            <Text style={[styles.sliderEndLabel, { color: theme.colors.text }]}>
              {timeLimit > 0
                ? `${timeLimit} minute${timeLimit !== 1 ? "s" : ""}`
                : "No limit"}
            </Text>
            <Text
              style={[styles.sliderEndLabel, { color: theme.colors.textMuted }]}
            >
              20 min
            </Text>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            { backgroundColor: theme.colors.primary },
            isGeneratingQuiz && [
              styles.startButtonDisabled,
              { backgroundColor: theme.colors.border },
            ],
          ]}
          onPress={handleStartQuiz}
          disabled={isGeneratingQuiz}
        >
          {isGeneratingQuiz ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.colors.buttonText} size='small' />
              <Text
                style={[
                  styles.startButtonText,
                  { color: theme.colors.buttonText, marginLeft: 10 },
                ]}
              >
                Generating Quiz...
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.startButtonText,
                { color: theme.colors.buttonText },
              ]}
            >
              Start Quiz
            </Text>
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
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
    marginBottom: 15,
  },
  categoryList: {
    marginBottom: 0,
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
  },
  startButton: {
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  startButtonDisabled: {
    shadowOpacity: 0.1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentContainer: {
    flexDirection: "row",
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
    shadowColor: "#000",
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
  },
  segmentButtonTextActive: {
    fontWeight: "700",
  },
  customQuestionsInput: {
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: "transparent",
  },
});
