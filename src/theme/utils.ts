import { Platform } from "react-native";

/**
 * Calculates the bottom padding needed to account for the native tab bar.
 * iOS: 60px base padding
 * Android: 90px base padding (60px + 30px extra)
 *
 * @param bottomInset - The bottom safe area inset from useSafeAreaInsets()
 * @returns The total bottom padding needed
 */
export function getTabBarPadding(bottomInset: number): number {
  const basePadding = Platform.OS === "android" ? 90 : 60;
  return Math.max(bottomInset, 20) + basePadding;
}
