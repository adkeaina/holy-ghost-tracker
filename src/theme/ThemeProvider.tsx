import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, ThemeMode, lightTheme, darkTheme } from "./theme";

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@holy_ghost_tracker_theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on app start
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
          setThemeModeState(savedTheme);
        } else {
          // Use system preference if no saved preference
          const systemColorScheme = Appearance.getColorScheme();
          setThemeModeState(systemColorScheme === "dark" ? "dark" : "light");
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
        // Fallback to light theme
        setThemeModeState("light");
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only update if user hasn't manually set a preference
      AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
        if (!savedTheme) {
          setThemeModeState(colorScheme === "dark" ? "dark" : "light");
        }
      });
    });

    return () => subscription?.remove();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === "light" ? "dark" : "light";
    setThemeMode(newMode);
  };

  const theme = themeMode === "dark" ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
  };

  // Don't render children until theme is loaded to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Hook to get just the theme object (for convenience)
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

// Hook to get just the theme spacing
export const useThemeSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};

// Hook to get just the theme typography
export const useThemeTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};
