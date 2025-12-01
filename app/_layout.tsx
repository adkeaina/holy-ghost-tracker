import { ThemeProvider } from "@/src/theme";
import AuthProvider from "@/src/utils/authProvider";
import { supabase } from "@/src/utils/supabase";
import { Session } from "@supabase/supabase-js";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { getCategories } from "@/src/utils/storage";
import { useTheme } from "@/src/theme";

function RootLayoutContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.log("Session retrieval error handled:", error);
          setSession(null);
        } else {
          setSession(session);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("Unexpected session error handled:", error);
        setSession(null);
        setIsLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        // Handle refresh token errors silently
        if (event === "TOKEN_REFRESHED" && !session) {
          setSession(null);
          setIsLoading(false);
          return;
        }

        setSession(session);
        setIsLoading(false);

        // Initialize categories when user logs in
        if (session) {
          try {
            await getCategories();
          } catch (error) {
            // Silently handle initialization errors
          }
        }
      } catch (error) {
        console.log("Auth state change error handled:", error);
        setSession(null);
        setIsLoading(false);
      }
    });

    // Handle app state changes for auth refresh
    const handleAppStateChange = (state: string) => {
      try {
        if (state === "active") {
          supabase.auth.startAutoRefresh();
        } else {
          supabase.auth.stopAutoRefresh();
        }
      } catch (error) {
        console.log("Auto-refresh error handled:", error);
      }
    };

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.unsubscribe();
      appStateSubscription?.remove();
    };
  }, []);

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading...
        </Text>
        <StatusBar
          style={theme.colors.background === "#FAFAFA" ? "dark" : "light"}
        />
      </View>
    );
  }

  return (
    <>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        >
          <Stack.Protected guard={!session}>
            <Stack.Screen name='index' />
          </Stack.Protected>
          <Stack.Protected guard={!!session}>
            <Stack.Screen name='(tabs)' />
          </Stack.Protected>
        </Stack>
      </AuthProvider>
      <StatusBar
        style={theme.colors.background === "#FAFAFA" ? "dark" : "light"}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
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
