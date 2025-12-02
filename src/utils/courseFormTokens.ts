import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
// import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform } from "react-native";

export const courseFormProps: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: "formSheet",
  sheetAllowedDetents: Platform.OS === "android" ? [0.8] : "fitToContents",
  ...(Platform.OS === "ios" && {
    sheetGrabberVisible: true,
    contentStyle: {
      // ...(isLiquidGlassAvailable() &&
      ...{
        backgroundColor: "transparent",
      },
    },
  }),
};
