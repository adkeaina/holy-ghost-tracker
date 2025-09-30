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

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        <StatusBar style='auto' />
      </SafeAreaProvider>
    );
  }

  // Show onboarding screen if user hasn't onboarded
  if (!hasOnboarded) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
        <StatusBar style='auto' />
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
              backgroundColor: "white",
              borderTopWidth: 1,
              borderTopColor: "#e1e8ed",
              height: 90,
              paddingBottom: 20,
              paddingTop: 10,
            },
            tabBarActiveTintColor: "#3498db",
            tabBarInactiveTintColor: "#95a5a6",
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
        <StatusBar style='auto' />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 18,
    color: "#7f8c8d",
    fontWeight: "500",
  },
});
