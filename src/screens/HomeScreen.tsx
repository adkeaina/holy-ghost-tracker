import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { SpiritualImpression } from "../types";
import {
  getLastImpression,
  resetCategoriesToDefault,
  getEnv,
  resetUserInfo,
} from "../utils/storage";
import { formatTimeDuration, getTimeSinceLastImpression } from "../utils/time";
import NewImpressionForm from "../components/NewImpressionForm";
import Impression from "../components/Impression";
import BackgroundGradient from "../components/BackgroundGradient";
import GlassyCard from "../components/GlassyCard";
import { useTheme } from "../theme";

const environment = getEnv("EXPO_PUBLIC_NODE_ENV");

export default function HomeScreen() {
  const [lastImpression, setLastImpression] =
    useState<SpiritualImpression | null>(null);
  const [timeSince, setTimeSince] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [expandedImpression, setExpandedImpression] = useState<boolean>(false);
  const [testingToolsExpanded, setTestingToolsExpanded] =
    useState<boolean>(false);
  const { theme } = useTheme();

  // Load last impression when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadLastImpression();
    }, [])
  );

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastImpression) {
        setTimeSince(getTimeSinceLastImpression(lastImpression.dateTime));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastImpression]);

  const loadLastImpression = async () => {
    try {
      const impression = await getLastImpression();
      setLastImpression(impression);
      if (impression) {
        setTimeSince(getTimeSinceLastImpression(impression.dateTime));
      }
    } catch (error) {
      console.error("Error loading last impression:", error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleResetCategories = () => {
    Alert.alert(
      "Reset Categories",
      "This will reset all categories to default (Church, BYU) and remove all categories from existing impressions. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await resetCategoriesToDefault();
              Alert.alert("Success", "Categories have been reset to default!");
            } catch (error) {
              console.error("Error resetting categories:", error);
              Alert.alert(
                "Error",
                "Failed to reset categories. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleResetUserInfo = async () => {
    Alert.alert(
      "Reset User Info",
      "This will clear your name, email, and reset the app to show onboarding again. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetUserInfo();
              Alert.alert(
                "Reset Complete",
                "User info has been reset. Please restart the app to see onboarding again.",
                [
                  {
                    text: "OK",
                  },
                ]
              );
            } catch (error) {
              console.error("Error resetting user info:", error);
              Alert.alert(
                "Error",
                "Failed to reset user info. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Holy Ghost Tracker
              </Text>
              <Text
                style={[styles.subtitle, { color: theme.colors.textMuted }]}
              >
                Track your spiritual impressions
              </Text>
            </View>

            {/* Test Section */}
            {environment === "dev" && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => setTestingToolsExpanded(!testingToolsExpanded)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.sectionTitle, { color: theme.colors.text }]}
                  >
                    Testing Tools
                  </Text>
                  <Ionicons
                    name={
                      testingToolsExpanded ? "chevron-down" : "chevron-forward"
                    }
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
                {testingToolsExpanded && (
                  <View style={styles.testButtonContainer}>
                    <TouchableOpacity
                      style={styles.testButton}
                      onPress={handleResetCategories}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.testButtonText}>
                        Reset Categories
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.testButton}
                      onPress={handleResetUserInfo}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.testButtonText}>Reset User Info</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Last Impression */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Last Spiritual Impression
              </Text>
              <Impression
                impression={lastImpression}
                expanded={expandedImpression}
                onPress={() => setExpandedImpression((prev) => !prev)}
              />
            </View>

            {/* Stopwatch */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Time Since Last Impression
              </Text>
              <GlassyCard style={styles.stopwatchCard}>
                <Text
                  style={[styles.stopwatchTime, { color: theme.colors.text }]}
                >
                  {lastImpression ? formatTimeDuration(timeSince) : "0s"}
                </Text>
              </GlassyCard>
            </View>

            {/* Add New Impression Form */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Add New Impression
              </Text>
              <NewImpressionForm
                onSuccess={loadLastImpression}
                onDescriptionFocus={scrollToBottom}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stopwatchCard: {
    alignItems: "center",
  },
  stopwatchTime: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  testButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#c0392b",
  },
  testButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  testButtonContainer: {
    gap: 10,
  },
});
