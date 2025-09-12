import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";
import { UserProfile, NotificationSettings } from "../types";
import { getUserProfile, updateNotificationSettings } from "../utils/storage";
import {
  scheduleNotification,
  requestNotificationPermissions,
} from "../utils/notifications";

const NOTIFICATION_INTERVALS = [
  { label: "1 Day", value: 1 as const },
  { label: "3 Days", value: 3 as const },
  { label: "1 Week", value: 7 as const },
  { label: "2 Weeks", value: 14 as const },
  { label: "1 Month", value: 30 as const },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!profile) return;

    if (enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to receive reminders."
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      const newSettings: NotificationSettings = {
        ...profile.notificationSettings,
        enabled,
      };

      await updateNotificationSettings(newSettings);
      await scheduleNotification(newSettings);

      setProfile({
        ...profile,
        notificationSettings: newSettings,
      });

      if (enabled) {
        Alert.alert(
          "Notifications Enabled",
          `You'll receive reminders every ${
            profile.notificationSettings.intervalDays
          } day${
            profile.notificationSettings.intervalDays > 1 ? "s" : ""
          } to track your spiritual impressions.`
        );
      } else {
        Alert.alert(
          "Notifications Disabled",
          "You will no longer receive reminders."
        );
      }
    } catch (error) {
      console.error("Error updating notifications:", error);
      Alert.alert(
        "Error",
        "Failed to update notification settings. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntervalChange = async (intervalDays: 1 | 3 | 7 | 14 | 30) => {
    if (!profile) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const newSettings: NotificationSettings = {
        ...profile.notificationSettings,
        intervalDays,
      };

      await updateNotificationSettings(newSettings);

      if (newSettings.enabled) {
        await scheduleNotification(newSettings);
      }

      setProfile({
        ...profile,
        notificationSettings: newSettings,
      });

      if (newSettings.enabled) {
        Alert.alert(
          "Reminder Updated",
          `You'll now receive reminders every ${intervalDays} day${
            intervalDays > 1 ? "s" : ""
          }.`
        );
      }
    } catch (error) {
      console.error("Error updating interval:", error);
      Alert.alert(
        "Error",
        "Failed to update reminder interval. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Information</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{profile.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable Reminders</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications when you haven't logged a spiritual
                  impression
                </Text>
              </View>
              <Switch
                value={profile.notificationSettings.enabled}
                onValueChange={handleNotificationToggle}
                disabled={isLoading}
                trackColor={{ false: "#bdc3c7", true: "#3498db" }}
                thumbColor={
                  profile.notificationSettings.enabled ? "#2980b9" : "#95a5a6"
                }
              />
            </View>

            {profile.notificationSettings.enabled && (
              <View style={styles.intervalSection}>
                <Text style={styles.intervalTitle}>Reminder Frequency</Text>
                <Text style={styles.intervalDescription}>
                  How often would you like to receive reminders?
                </Text>

                {NOTIFICATION_INTERVALS.map((interval) => (
                  <TouchableOpacity
                    key={interval.value}
                    style={[
                      styles.intervalOption,
                      profile.notificationSettings.intervalDays ===
                        interval.value && styles.intervalOptionSelected,
                    ]}
                    onPress={() => handleIntervalChange(interval.value)}
                    disabled={isLoading}
                  >
                    <Text
                      style={[
                        styles.intervalOptionText,
                        profile.notificationSettings.intervalDays ===
                          interval.value && styles.intervalOptionTextSelected,
                      ]}
                    >
                      {interval.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>
              Holy Ghost Tracker helps you remember and track the spiritual
              impressions in your life. As a member of The Church of Jesus
              Christ of Latter-day Saints, keeping track of when you feel the
              Holy Ghost can strengthen your testimony and help you recognize
              the Spirit's influence more readily.
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#7f8c8d",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
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
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7f8c8d",
  },
  infoValue: {
    fontSize: 16,
    color: "#2c3e50",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 18,
  },
  intervalSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
  },
  intervalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 5,
  },
  intervalDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 15,
  },
  intervalOption: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  intervalOptionSelected: {
    backgroundColor: "#e8f4fd",
    borderColor: "#3498db",
  },
  intervalOptionText: {
    fontSize: 16,
    color: "#2c3e50",
    textAlign: "center",
    fontWeight: "500",
  },
  intervalOptionTextSelected: {
    color: "#2980b9",
    fontWeight: "600",
  },
  aboutText: {
    fontSize: 16,
    color: "#2c3e50",
    lineHeight: 22,
    marginBottom: 15,
  },
  versionText: {
    fontSize: 14,
    color: "#95a5a6",
    textAlign: "center",
    fontStyle: "italic",
  },
});
