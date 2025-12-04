import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import { useTheme } from "@/src/theme";
import { supabase } from "@/src/utils/supabase";

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  // Configure Google Sign-in
  useEffect(() => {
    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/userinfo.email"],
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
  }, []);

  // Native Apple Sign In for iOS
  const handleNativeAppleSignIn = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Verify Supabase configuration before proceeding
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        const missing = [];
        if (!supabaseUrl) missing.push("EXPO_PUBLIC_SUPABASE_URL");
        if (!supabaseKey) missing.push("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
        throw new Error(
          `Supabase configuration is missing: ${missing.join(
            ", "
          )}. Please check your .env file and restart Expo.`
        );
      }

      // For local Supabase with Expo Go, we need the computer's local IP, not 127.0.0.1
      if (
        supabaseUrl.includes("127.0.0.1") ||
        supabaseUrl.includes("localhost")
      ) {
        throw new Error(
          "Localhost Supabase URLs won't work in Expo Go. Please use your computer's local IP address (e.g., http://192.168.1.100:54321) or a cloud Supabase instance."
        );
      }

      if (
        !supabaseUrl.startsWith("http://") &&
        !supabaseUrl.startsWith("https://")
      ) {
        throw new Error(
          "Supabase URL must start with http:// or https://. Current URL format is invalid."
        );
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("No identityToken received from Apple.");
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (error) {
        // Provide more helpful error messages
        if (
          error.message?.includes("Provider") &&
          error.message?.includes("not enabled")
        ) {
          throw new Error(
            "Apple authentication is not enabled in your Supabase project. Please enable it in your Supabase dashboard under Authentication > Providers > Apple."
          );
        }
        if (error.message?.includes("Network request failed")) {
          throw new Error(
            "Network connection failed. Please check your internet connection and ensure your Supabase project is configured correctly."
          );
        }
        throw error;
      }

      // Apple only provides the user's full name on the first sign-in
      // Save it to user metadata if available
      if (credential.fullName) {
        try {
          const nameParts = [];
          if (credential.fullName.givenName)
            nameParts.push(credential.fullName.givenName);
          if (credential.fullName.middleName)
            nameParts.push(credential.fullName.middleName);
          if (credential.fullName.familyName)
            nameParts.push(credential.fullName.familyName);

          const fullName = nameParts.join(" ");

          await supabase.auth.updateUser({
            data: {
              full_name: fullName,
              given_name: credential.fullName.givenName,
              family_name: credential.fullName.familyName,
            },
          });
        } catch (nameError) {
          // Non-critical error - user is still signed in
        }
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // User canceled the sign-in flow - don't show an error
      } else {
        const errorMessage =
          e.message ||
          (e instanceof Error ? e.message : "Unknown error occurred");
        Alert.alert(
          "Sign In Error",
          errorMessage ||
            "There was an error signing in with Apple. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Verify Supabase configuration before proceeding
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        const missing = [];
        if (!supabaseUrl) missing.push("EXPO_PUBLIC_SUPABASE_URL");
        if (!supabaseKey) missing.push("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
        throw new Error(
          `Supabase configuration is missing: ${missing.join(
            ", "
          )}. Please check your .env file and restart Expo.`
        );
      }

      // Check if Google Sign-in is configured
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

      if (!webClientId || (Platform.OS === "ios" && !iosClientId)) {
        throw new Error(
          "Google Sign-in is not configured. Please set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in your .env file."
        );
      }

      // Check for Play Services (Android only)
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices();
      }

      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response) && response.data.idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.data.idToken,
        });

        if (error) {
          // Provide more helpful error messages
          if (
            error.message?.includes("Provider") &&
            error.message?.includes("not enabled")
          ) {
            throw new Error(
              "Google authentication is not enabled in your Supabase project. Please enable it in your Supabase dashboard under Authentication > Providers > Google."
            );
          }
          if (error.message?.includes("Network request failed")) {
            throw new Error(
              "Network connection failed. Please check your internet connection and ensure your Supabase project is configured correctly."
            );
          }
          throw error;
        }
      } else {
        throw new Error("No idToken received from Google.");
      }
    } catch (error: any) {
      if (error.code === statusCodes.IN_PROGRESS) {
        // Operation is in progress already - don't show error
        setIsLoading(false);
        return;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          "Sign In Error",
          "Google Play Services is not available or outdated. Please update Google Play Services."
        );
      } else if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User canceled the sign-in flow - don't show an error
      } else {
        const errorMessage =
          error.message ||
          (error instanceof Error ? error.message : "Unknown error occurred");
        Alert.alert(
          "Sign In Error",
          errorMessage ||
            "There was an error signing in with Google. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Test user sign in (dev only)
  const handleTestUserSignIn = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "test-user@example.com",
        password: "Password1!",
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Error signing in with test user:", error);
      Alert.alert(
        "Sign In Error",
        error.message ||
          "There was an error signing in with the test user. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
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
              Sign in to start tracking your spiritual impressions
            </Text>
          </View>

          {/* Sign In Button */}
          <View style={styles.signInContainer}>
            {Platform.OS === "ios" && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
                buttonStyle={
                  AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={12}
                style={styles.nativeAppleButton}
                onPress={handleNativeAppleSignIn}
              />
            )}

            {/* Google Sign In Button */}
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              disabled={isLoading}
              onPress={handleGoogleSignIn}
              style={styles.googleButton}
            />

            {/* Test User Sign In (Dev Only) */}
            {process.env.EXPO_PUBLIC_NODE_ENV === "dev" && (
              <TouchableOpacity
                style={[
                  styles.testButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleTestUserSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.text} />
                ) : (
                  <Text
                    style={[
                      styles.testButtonText,
                      { color: theme.colors.text },
                    ]}
                  >
                    Sign in with test user
                  </Text>
                )}
              </TouchableOpacity>
            )}
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
      </SafeAreaView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
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
  signInContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  nativeAppleButton: {
    width: "100%",
    height: 56,
    marginBottom: 12,
  },
  googleButton: {
    width: "100%",
    height: 56,
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  testButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    minHeight: 56,
    width: "100%",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
