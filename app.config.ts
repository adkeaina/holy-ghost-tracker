import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const getIosUrlScheme = (): string | undefined => {
    if (process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME) {
      return process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;
    }

    console.warn(
      "Warning: Google iOS URL scheme not configured. Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in your .env.local file."
    );
    return undefined;
  };

  return {
    ...config,
    name: "Holy Ghost Tracker",
    slug: "holy-ghost-tracker",
    plugins: [
      ...(Array.isArray(config?.plugins) ? config.plugins : []),
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: getIosUrlScheme(),
        },
      ],
    ],
  };
};
