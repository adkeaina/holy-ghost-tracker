import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SpiritualImpression } from "../types";
import { getLastImpression } from "../utils/storage";
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

  return (
    <SafeAreaView style={styles.container}>
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
});
