import React, { useState, useEffect, useCallback, useRef } from "react";
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
import * as Haptics from "expo-haptics";
import { SpiritualImpression } from "../types";
import { getLastImpression, resetCategoriesToDefault } from "../utils/storage";
import {
  formatTimeDuration,
  formatDateTime,
  getTimeSinceLastImpression,
} from "../utils/time";
import NewImpressionForm from "../components/NewImpressionForm";
import Impression from "../components/Impression";

export default function HomeScreen() {
  const [lastImpression, setLastImpression] =
    useState<SpiritualImpression | null>(null);
  const [timeSince, setTimeSince] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [expandedImpression, setExpandedImpression] = useState<boolean>(false);

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

  return (
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
            <Text style={styles.title}>Holy Ghost Tracker</Text>
            <Text style={styles.subtitle}>
              Track your spiritual impressions
            </Text>
          </View>

          {/* Test Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Testing Tools</Text>
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleResetCategories}
              activeOpacity={0.7}
            >
              <Text style={styles.testButtonText}>Reset Categories</Text>
            </TouchableOpacity>
          </View>

          {/* Last Impression */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Spiritual Impression</Text>
            <Impression
              impression={lastImpression}
              expanded={expandedImpression}
              onPress={() => setExpandedImpression((prev) => !prev)}
            />
          </View>

          {/* Stopwatch */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time Since Last Impression</Text>
            <View style={styles.stopwatchCard}>
              <Text style={styles.stopwatchTime}>
                {lastImpression ? formatTimeDuration(timeSince) : "0s"}
              </Text>
            </View>
          </View>

          {/* Add New Impression Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add New Impression</Text>
            <NewImpressionForm
              onSuccess={loadLastImpression}
              onDescriptionFocus={scrollToBottom}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    color: "#2c3e50",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 15,
  },

  stopwatchCard: {
    backgroundColor: "#3498db",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stopwatchTime: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
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
});
