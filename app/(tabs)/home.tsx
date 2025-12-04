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
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { SpiritualImpression } from "@/src/types";
import {
  resetCategoriesToDefault,
  getEnv,
  resetUserInfo,
} from "@/src/utils/storage";
import { useImpressions } from "@/src/context/ImpressionsContext";
import {
  formatTimeDuration,
  getTimeSinceLastImpression,
} from "@/src/utils/time";
import NewImpressionForm from "@/src/components/NewImpressionForm";
import Impression from "@/src/components/Impression";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import GlassyCard from "@/src/components/GlassyCard";
import FeedbackFAB from "@/src/components/FeedbackFAB";
import { useTheme, getTabBarPadding } from "@/src/theme";

const environment = getEnv("EXPO_PUBLIC_NODE_ENV");

export default function Home() {
  const {
    getLastImpression: getLastImpressionFromContext,
    refreshImpressions,
    isLoading,
  } = useImpressions();
  const lastImpression = getLastImpressionFromContext();
  const [timeSince, setTimeSince] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [expandedImpression, setExpandedImpression] = useState<boolean>(false);
  const [testingToolsExpanded, setTestingToolsExpanded] =
    useState<boolean>(false);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Refresh impressions when screen focuses
  useFocusEffect(
    useCallback(() => {
      refreshImpressions();
    }, [refreshImpressions])
  );

  // Update timer every second
  useEffect(() => {
    if (lastImpression) {
      setTimeSince(getTimeSinceLastImpression(lastImpression.dateTime));
    }
    const interval = setInterval(() => {
      if (lastImpression) {
        setTimeSince(getTimeSinceLastImpression(lastImpression.dateTime));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastImpression]);

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
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: getTabBarPadding(insets.bottom) },
            ]}
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
              {!lastImpression && isLoading ? (
                <GlassyCard style={styles.loadingCard}>
                  <View style={styles.loadingSection}>
                    <ActivityIndicator
                      size='small'
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.loadingText,
                        { color: theme.colors.textMuted },
                      ]}
                    >
                      Loading impressions...
                    </Text>
                  </View>
                </GlassyCard>
              ) : (
                <Impression
                  impression={lastImpression}
                  expanded={expandedImpression}
                  onPress={() => setExpandedImpression((prev) => !prev)}
                />
              )}
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
              <GlassyCard style={styles.newImpressionFormCard}>
                <NewImpressionForm
                  onSuccess={refreshImpressions}
                  onDescriptionFocus={scrollToBottom}
                />
              </GlassyCard>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Feedback FAB */}
        <FeedbackFAB />
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
  newImpressionFormCard: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  loadingCard: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSection: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    marginTop: 10,
  },
});
