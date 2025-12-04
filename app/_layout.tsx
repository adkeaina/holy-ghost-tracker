import { ThemeProvider } from "@/src/theme";
import { AuthProvider } from "@/src/context/AuthContext";
import { supabase } from "@/src/utils/supabase";
import { Profile } from "@/src/context/AuthContext";
import { Session } from "@supabase/supabase-js";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/src/theme";

function RootLayoutContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          // Handle session retrieval errors silently
          console.log("Session retrieval error handled:", error);
          setSession(null);
        } else {
          setSession(session);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        // Handle any unexpected errors during session retrieval
        console.log("Unexpected session error handled:", error);
        setSession(null);
        setIsLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      try {
        // Handle refresh token errors silently
        if (event === "TOKEN_REFRESHED" && !session) {
          // Token refresh failed, user needs to re-authenticate
          setSession(null);
          setIsLoading(false);
          return;
        }

        setSession(session);
        setIsLoading(false);
      } catch (error) {
        // Silently handle auth errors to prevent console.error
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
        // Silently handle auto-refresh errors
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

  useEffect(() => {
    if (!session || !session.user) {
      setProfile(null);
      return;
    }

    // Extract email directly from session user
    setProfile({
      email: session.user.email || "",
    });
  }, [session]);

  // Show loading spinner while checking session
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size='large'
          color={theme.colors.primary || "#3B82F6"}
        />
        <StatusBar
          style={theme.colors.background === "#FAFAFA" ? "dark" : "light"}
        />
      </View>
    );
  }

  return (
    <>
      <AuthProvider profile={profile} isLoading={isLoading}>
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
