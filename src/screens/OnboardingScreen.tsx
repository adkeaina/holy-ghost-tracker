import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import BackgroundGradient from "../components/BackgroundGradient";
import { useTheme } from "../theme";

interface OnboardingScreenProps {
  onComplete: (name: string, email: string) => void;
}

export default function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your full name to continue.");
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        "Email Required",
        "Please enter your email address to continue."
      );
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await onComplete(name.trim(), email.trim());
    } catch (error) {
      console.error("Error completing onboarding:", error);
      Alert.alert(
        "Error",
        "There was an error setting up your profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps='handled'
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Welcome to
              </Text>
              <Text
                style={[
                  styles.appName,
                  {
                    color: theme.colors.primary,
                    textShadowColor: "rgba(0, 0, 0, 0.3)",
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  },
                ]}
              >
                Holy Ghost Tracker
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: theme.colors.text,
                    textShadowColor: "rgba(0, 0, 0, 0.2)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  },
                ]}
              >
                Let's get started by setting up your profile
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Full Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder='Enter your full name'
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize='words'
                  autoCorrect={false}
                  returnKeyType='next'
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Email Address
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder='Enter your email address'
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoCorrect={false}
                  returnKeyType='done'
                  onSubmitEditing={handleContinue}
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  { backgroundColor: theme.colors.primary },
                  isLoading && { backgroundColor: theme.colors.textMuted },
                ]}
                onPress={handleContinue}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.continueButtonText,
                    { color: theme.colors.buttonText },
                  ]}
                >
                  {isLoading ? "Setting up..." : "Continue"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View
              style={[
                styles.description,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                style={[styles.descriptionText, { color: theme.colors.text }]}
              >
                Holy Ghost Tracker helps you remember and track the spiritual
                impressions in your life. As a member of The Church of Jesus
                Christ of Latter-day Saints, keeping track of when you feel the
                Holy Ghost can strengthen your testimony and help you recognize
                the Spirit's influence more readily.
              </Text>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 5,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  continueButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#3498db",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#bdc3c7",
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
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
  descriptionText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
});
