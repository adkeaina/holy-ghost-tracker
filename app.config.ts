import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const getIosUrlScheme = (): string | undefined => {
    if (process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME) {
      return process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;
    }

    console.warn(
      "Warning: Google iOS URL scheme not configured. Set EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME in your .env.local file."
    );
    return undefined;
  };

  const iosUrlScheme = getIosUrlScheme();
  const plugins = [...(Array.isArray(config?.plugins) ? config.plugins : [])];

  // Only add Google Sign-In plugin if iosUrlScheme is available
  // This prevents config validation errors when env vars aren't loaded (e.g., during EAS CLI validation)
  if (iosUrlScheme) {
    plugins.push([
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme,
      },
    ]);
  }

  return {
    ...config,
    name: "Holy Ghost Tracker",
    slug: "holy-ghost-tracker",
    plugins,
  };
};
