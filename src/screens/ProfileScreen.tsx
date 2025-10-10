import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";
import { UserProfile, NotificationSettings } from "../types";
import {
  getUserProfile,
  updateNotificationSettings,
  saveUserProfile,
} from "../utils/storage";
import {
  scheduleNotification,
  requestNotificationPermissions,
} from "../utils/notifications";
import BackgroundGradient from "../components/BackgroundGradient";
import GlassyCard from "../components/GlassyCard";
import FeedbackFAB from "../components/FeedbackFAB";
import { useTheme } from "../theme";

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
  const [editingName, setEditingName] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const { theme, themeMode, toggleTheme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
      setEditingName(userProfile.name);
      setEditingEmail(userProfile.email);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNameBlur = async () => {
    if (!profile) return;

    const trimmedName = editingName.trim();
    if (!trimmedName) {
      // Revert to original name if empty
      setEditingName(profile.name);
      return;
    }

    if (trimmedName !== profile.name) {
      try {
        const updatedProfile = { ...profile, name: trimmedName };
        await saveUserProfile(updatedProfile);
        setProfile(updatedProfile);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error("Error updating name:", error);
        setEditingName(profile.name); // Revert on error
        Alert.alert("Error", "Failed to update name. Please try again.");
      }
    }
  };

  const handleEmailBlur = async () => {
    if (!profile) return;

    const trimmedEmail = editingEmail.trim();
    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      // Revert to original email if empty or invalid
      setEditingEmail(profile.email);
      if (trimmedEmail && !validateEmail(trimmedEmail)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
      }
      return;
    }

    if (trimmedEmail !== profile.email) {
      try {
        const updatedProfile = { ...profile, email: trimmedEmail };
        await saveUserProfile(updatedProfile);
        setProfile(updatedProfile);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error("Error updating email:", error);
        setEditingEmail(profile.email); // Revert on error
        Alert.alert("Error", "Failed to update email. Please try again.");
      }
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
      <BackgroundGradient>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Loading profile...
            </Text>
          </View>
        </SafeAreaView>
      </BackgroundGradient>
    );
  }

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Profile
            </Text>
          </View>

          {/* User Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              User Information
            </Text>
            <GlassyCard style={styles.userInfoCard}>
              <View style={styles.userInfoContent}>
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    Name
                  </Text>
                  <TextInput
                    style={[styles.infoValue, { color: theme.colors.text }]}
                    value={editingName}
                    onChangeText={setEditingName}
                    onBlur={handleNameBlur}
                    placeholder='Enter your name'
                    placeholderTextColor={theme.colors.textMuted}
                    autoCapitalize='words'
                    autoCorrect={false}
                    returnKeyType='next'
                    editable={!isLoading}
                  />
                </View>
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    Email
                  </Text>
                  <TextInput
                    style={[styles.infoValue, { color: theme.colors.text }]}
                    value={editingEmail}
                    onChangeText={setEditingEmail}
                    onBlur={handleEmailBlur}
                    placeholder='Enter your email'
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    autoCorrect={false}
                    returnKeyType='done'
                    editable={!isLoading}
                  />
                </View>
              </View>
            </GlassyCard>
          </View>

          {/* Theme Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Appearance
            </Text>
            <GlassyCard style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text
                    style={[styles.settingLabel, { color: theme.colors.text }]}
                  >
                    Dark Mode
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    Switch between light and dark themes
                  </Text>
                </View>
                <Switch
                  value={themeMode === "dark"}
                  onValueChange={toggleTheme}
                  disabled={isLoading}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={
                    themeMode === "dark"
                      ? theme.colors.celestialGold
                      : theme.colors.textMuted
                  }
                />
              </View>
            </GlassyCard>
          </View>

          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Notification Preferences
            </Text>
            <GlassyCard style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text
                    style={[styles.settingLabel, { color: theme.colors.text }]}
                  >
                    Enable Reminders
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    Receive notifications when you haven't logged a spiritual
                    impression
                  </Text>
                </View>
                <Switch
                  value={profile.notificationSettings.enabled}
                  onValueChange={handleNotificationToggle}
                  disabled={isLoading}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={
                    profile.notificationSettings.enabled
                      ? theme.colors.celestialGold
                      : theme.colors.textMuted
                  }
                />
              </View>

              {profile.notificationSettings.enabled && (
                <View style={styles.intervalSection}>
                  <Text
                    style={[styles.intervalTitle, { color: theme.colors.text }]}
                  >
                    Reminder Frequency
                  </Text>
                  <Text
                    style={[
                      styles.intervalDescription,
                      { color: theme.colors.textMuted },
                    ]}
                  >
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
            </GlassyCard>
          </View>

          {/* App Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              About
            </Text>
            <GlassyCard style={styles.card}>
              <Text style={[styles.aboutText, { color: theme.colors.text }]}>
                Holy Ghost Tracker helps you remember and track the spiritual
                impressions in your life. As a member of The Church of Jesus
                Christ of Latter-day Saints, keeping track of when you feel the
                Holy Ghost can strengthen your testimony and help you recognize
                the Spirit's influence more readily.
              </Text>
              <Text
                style={[styles.versionText, { color: theme.colors.textMuted }]}
              >
                Version 1.0.0
              </Text>
            </GlassyCard>
          </View>
        </ScrollView>

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
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  card: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  userInfoCard: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  userInfoContent: {
    width: "100%",
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
  },
  infoValue: {
    fontSize: 16,
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
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
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
    marginBottom: 5,
  },
  intervalDescription: {
    fontSize: 14,
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
    textAlign: "center",
    fontWeight: "500",
  },
  intervalOptionTextSelected: {
    color: "#2980b9",
    fontWeight: "600",
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 15,
  },
  versionText: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
});
