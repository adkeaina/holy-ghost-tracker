import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { RootTabParamList } from "./src/types";
import HomeScreen from "./src/screens/HomeScreen";
import AllImpressionsScreen from "./src/screens/AllImpressionsScreen";
import QuizScreen from "./src/screens/QuizScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getCategories } from "./src/utils/storage";

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  // Initialize categories on app startup
  useEffect(() => {
    const initializeCategories = async () => {
      try {
        // This will seed default categories if none exist
        await getCategories();
      } catch (error) {
        console.error("Error initializing categories:", error);
      }
    };

    initializeCategories();
  }, []);

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
