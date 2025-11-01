import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import * as Linking from "expo-linking";

import { RootTabParamList } from "./src/types";
import HomeScreen from "./src/screens/HomeScreen";
import AllImpressionsScreen from "./src/screens/AllImpressionsScreen";
import QuizScreen from "./src/screens/QuizScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getCategories } from "./src/utils/storage";
import { ThemeProvider, useTheme } from "./src/theme";
import AuthProvider from "./src/utils/authProvider";
import { useAuthContext } from "./src/utils/useAuthContext";
import { supabase } from "./src/utils/supabase";

const Tab = createBottomTabNavigator<RootTabParamList>();

// Main App Content Component
function AppContent() {
  const { session, isLoading } = useAuthContext();
  const { theme } = useTheme();

  // Initialize app on startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize categories if needed
        await getCategories();
      } catch (error) {
        // Silently handle initialization errors
      }
    };

    initializeApp();
  }, []);

  // Handle OAuth callback URLs
  useEffect(() => {
    const handleOAuthCallback = async (url: string) => {
      try {
        // Supabase OAuth redirects use hash fragments (#) in React Native
        // The URL format is: holyghosttracker://#access_token=...&refresh_token=...
        const hashIndex = url.indexOf("#");
        if (hashIndex === -1) {
          return;
        }

        const hashParams = new URLSearchParams(url.substring(hashIndex + 1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        if (error) {
          // Silently handle OAuth errors
          return;
        }

        if (accessToken && refreshToken) {
          // Exchange the tokens for a session
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            // Silently handle session errors
          }
          // The auth state change listener in AuthProvider will handle the session update
        }
      } catch (error) {
        // Silently handle OAuth callback errors
      }
    };

    // Handle initial URL when app opens from a deep link
    const handleInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        await handleOAuthCallback(url);
      }
    };

    handleInitialUrl();

    // Listen for URL changes (when app is already open)
    const subscription = Linking.addEventListener("url", async (event) => {
      await handleOAuthCallback(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading...
          </Text>
        </View>
        <StatusBar
          style={theme.colors.background === "#FAFAFA" ? "dark" : "light"}
        />
      </SafeAreaProvider>
    );
  }

  // Show login screen if user is not authenticated
  if (!session) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen />
        <StatusBar
          style={theme.colors.background === "#FAFAFA" ? "dark" : "light"}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.colors.tabBarBackground,
              borderTopWidth: 1,
              borderTopColor: theme.colors.tabBarBorder,
              height: 90,
              paddingBottom: 20,
              paddingTop: 10,
            },
            tabBarActiveTintColor: theme.colors.tabBarActive,
            tabBarInactiveTintColor: theme.colors.tabBarInactive,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
            },
          }}
        >
          <Tab.Screen
            name='Home'
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name='home' size={size} color={color} />
              ),
              tabBarLabel: "Home",
            }}
          />
          <Tab.Screen
            name='AllImpressions'
            component={AllImpressionsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name='heart' size={size} color={color} />
              ),
              tabBarLabel: "Insights",
            }}
          />
          <Tab.Screen
            name='AIQuiz'
            component={QuizScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name='school' size={size} color={color} />
              ),
              tabBarLabel: "AI Quiz",
            }}
          />
          <Tab.Screen
            name='Profile'
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name='person' size={size} color={color} />
              ),
              tabBarLabel: "Profile",
            }}
          />
        </Tab.Navigator>
        <StatusBar
          style={theme.colors.background === "#FAFAFA" ? "dark" : "light"}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "500",
  },
});
