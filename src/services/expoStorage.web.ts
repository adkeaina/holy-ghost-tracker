import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";

// Web storage adapter that handles SSR
export const ExpoStorage = {
  getItem: (key: string) => {
    // During SSR, window is not available, so return null
    if (typeof window === "undefined") {
      return Promise.resolve(null);
    }
    // Use AsyncStorage when window is available (browser)
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    // During SSR, window is not available, so do nothing
    if (typeof window === "undefined") {
      return Promise.resolve();
    }
    // Use AsyncStorage when window is available (browser)
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    // During SSR, window is not available, so do nothing
    if (typeof window === "undefined") {
      return Promise.resolve();
    }
    // Use AsyncStorage when window is available (browser)
    return AsyncStorage.removeItem(key);
  },
};
