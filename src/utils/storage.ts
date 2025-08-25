import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SpiritualImpression,
  NotificationSettings,
  UserProfile,
} from "../types";

const IMPRESSIONS_KEY = "impressions";
const PROFILE_KEY = "profile";

// Spiritual Impressions CRUD operations
export const saveImpression = async (
  impression: Omit<SpiritualImpression, "id" | "createdAt" | "updatedAt">
): Promise<SpiritualImpression> => {
  try {
    const impressions = await getImpressions();
    const newImpression: SpiritualImpression = {
      ...impression,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    impressions.push(newImpression);
    await AsyncStorage.setItem(IMPRESSIONS_KEY, JSON.stringify(impressions));
    return newImpression;
  } catch (error) {
    console.error("Error saving impression:", error);
    throw error;
  }
};

export const getImpressions = async (): Promise<SpiritualImpression[]> => {
  try {
    const impressionsJson = await AsyncStorage.getItem(IMPRESSIONS_KEY);
    return impressionsJson ? JSON.parse(impressionsJson) : [];
  } catch (error) {
    console.error("Error getting impressions:", error);
    return [];
  }
};

export const updateImpression = async (
  id: string,
  updates: Partial<Omit<SpiritualImpression, "id" | "createdAt">>
): Promise<void> => {
  try {
    const impressions = await getImpressions();
    const index = impressions.findIndex((imp) => imp.id === id);
    if (index !== -1) {
      impressions[index] = {
        ...impressions[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(IMPRESSIONS_KEY, JSON.stringify(impressions));
    }
  } catch (error) {
    console.error("Error updating impression:", error);
    throw error;
  }
};

export const deleteImpression = async (id: string): Promise<void> => {
  try {
    const impressions = await getImpressions();
    const filteredImpressions = impressions.filter((imp) => imp.id !== id);
    await AsyncStorage.setItem(
      IMPRESSIONS_KEY,
      JSON.stringify(filteredImpressions)
    );
  } catch (error) {
    console.error("Error deleting impression:", error);
    throw error;
  }
};

export const getLastImpression =
  async (): Promise<SpiritualImpression | null> => {
    try {
      const impressions = await getImpressions();
      if (impressions.length === 0) return null;

      // Sort by dateTime and return the most recent
      const sorted = impressions.sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      );
      return sorted[0];
    } catch (error) {
      console.error("Error getting last impression:", error);
      return null;
    }
  };

// Profile operations
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
    if (profileJson) {
      return JSON.parse(profileJson);
    }

    // Return default profile if none exists
    const defaultProfile: UserProfile = {
      name: "Adam Aina",
      email: "adkeaina@gmail.com",
      notificationSettings: {
        enabled: false,
        intervalDays: 7,
      },
    };

    await saveUserProfile(defaultProfile);
    return defaultProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    // Return default profile on error
    return {
      name: "John Doe",
      email: "john.doe@example.com",
      notificationSettings: {
        enabled: false,
        intervalDays: 7,
      },
    };
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

export const updateNotificationSettings = async (
  settings: NotificationSettings
): Promise<void> => {
  try {
    const profile = await getUserProfile();
    const updatedProfile: UserProfile = {
      ...profile,
      notificationSettings: settings,
    };
    await saveUserProfile(updatedProfile);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};
