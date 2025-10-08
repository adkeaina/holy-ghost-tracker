import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

import { RootTabParamList } from "./src/types";
import HomeScreen from "./src/screens/HomeScreen";
import AllImpressionsScreen from "./src/screens/AllImpressionsScreen";
import QuizScreen from "./src/screens/QuizScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  getCategories,
  getHasOnboarded,
  completeOnboarding,
} from "./src/utils/storage";
import { ThemeProvider, useTheme } from "./src/theme";

const Tab = createBottomTabNavigator<RootTabParamList>();

// Main App Content Component
function AppContent() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  // Initialize app on startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check onboarding status
        const onboardingStatus = await getHasOnboarded();
        setHasOnboarded(onboardingStatus);

        // Initialize categories if needed
        await getCategories();
      } catch (error) {
        console.error("Error initializing app:", error);
        setHasOnboarded(false); // Default to showing onboarding on error
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleOnboardingComplete = async (name: string, email: string) => {
    try {
      await completeOnboarding(name, email);
      setHasOnboarded(true);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
    }
  };

  // Show loading screen while checking onboarding status
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

  // Show onboarding screen if user hasn't onboarded
  if (!hasOnboarded) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
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
      <AppContent />
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
