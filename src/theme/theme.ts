export interface Theme {
  colors: {
    // Primary palette - representing peace and divine inspiration
    celestialGold: string;
    paleSkyBlue: string;
    softLavender: string;
    pearlWhite: string;

    // Semantic colors
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    error: string;
    success: string;
    warning: string;

    // Interactive elements
    buttonPrimary: string;
    buttonSecondary: string;
    buttonText: string;
    buttonTextSecondary: string;

    // Tab bar
    tabBarBackground: string;
    tabBarActive: string;
    tabBarInactive: string;
    tabBarBorder: string;
  };

  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };

  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };

  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
    h3: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
    body: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
  };
}

export const lightTheme: Theme = {
  colors: {
    // Primary palette
    celestialGold: "#F7D794",
    paleSkyBlue: "#AEDFF7",
    softLavender: "#E6E6FA",
    pearlWhite: "#FAFAFA",

    // Semantic colors
    primary: "#F7D794", // celestialGold
    secondary: "#AEDFF7", // paleSkyBlue
    accent: "#E6E6FA", // softLavender
    background: "#FAFAFA", // pearlWhite
    surface: "#FFFFFF",
    text: "#2C3E50", // Dark blue-gray for readability
    textSecondary: "#34495E",
    textMuted: "#7F8C8D",
    border: "#E1E8ED",
    error: "#E74C3C",
    success: "#27AE60",
    warning: "#F39C12",

    // Interactive elements
    buttonPrimary: "#F7D794",
    buttonSecondary: "#AEDFF7",
    buttonText: "#2C3E50",
    buttonTextSecondary: "#34495E",

    // Tab bar
    tabBarBackground: "#FFFFFF",
    tabBarActive: "#F7D794",
    tabBarInactive: "#95A5A6",
    tabBarBorder: "#E1E8ED",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },

  typography: {
    h1: {
      fontSize: 28,
      fontWeight: "bold",
      lineHeight: 36,
    },
    h2: {
      fontSize: 24,
      fontWeight: "600",
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: "600",
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      fontWeight: "500",
      lineHeight: 16,
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    // Primary palette (same base colors, adjusted for dark mode)
    celestialGold: "#F7D794",
    paleSkyBlue: "#AEDFF7",
    softLavender: "#E6E6FA",
    pearlWhite: "#FAFAFA",

    // Semantic colors
    primary: "#F7D794", // celestialGold
    secondary: "#AEDFF7", // paleSkyBlue
    accent: "#E6E6FA", // softLavender
    background: "#1A1A1A", // Dark background
    surface: "#2C2C2C", // Dark surface
    text: "#FFFFFF", // White text for dark mode
    textSecondary: "#E8E8E8",
    textMuted: "#B0B0B0",
    border: "#404040",
    error: "#FF6B6B",
    success: "#4ECDC4",
    warning: "#FFE66D",

    // Interactive elements
    buttonPrimary: "#F7D794",
    buttonSecondary: "#AEDFF7",
    buttonText: "#1A1A1A", // Dark text on light buttons
    buttonTextSecondary: "#2C3E50",

    // Tab bar
    tabBarBackground: "#2C2C2C",
    tabBarActive: "#F7D794",
    tabBarInactive: "#808080",
    tabBarBorder: "#404040",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },

  typography: {
    h1: {
      fontSize: 28,
      fontWeight: "bold",
      lineHeight: 36,
    },
    h2: {
      fontSize: 24,
      fontWeight: "600",
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: "600",
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      fontWeight: "500",
      lineHeight: 16,
    },
  },
};

export type ThemeMode = "light" | "dark";
