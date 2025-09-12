import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SpiritualImpression,
  NotificationSettings,
  UserProfile,
  ImpressionCategory,
} from "../types";

const IMPRESSIONS_KEY = "impressions";
const PROFILE_KEY = "profile";
const CATEGORIES_KEY = "categories";

// Spiritual Impressions CRUD operations
export const saveImpression = async (
  impression: Omit<SpiritualImpression, "id" | "createdAt" | "updatedAt">
): Promise<SpiritualImpression> => {
  try {
    const impressions = await getImpressions();
    const newImpression: SpiritualImpression = {
      ...impression,
      categories: impression.categories || [],
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

// Default categories
const DEFAULT_CATEGORIES: ImpressionCategory[] = [
  {
    id: 1,
    name: "Church",
    color: "blue",
    notRemovable: true,
  },
  {
    id: 2,
    name: "BYU",
    color: "brown",
    notRemovable: true,
  },
];

// Helper function to get next available category ID
const getNextCategoryId = async (): Promise<number> => {
  try {
    const categories = await getCategories();
    if (categories.length === 0) {
      return 1;
    }
    const maxId = Math.max(...categories.map((cat) => cat.id));
    return maxId + 1;
  } catch (error) {
    console.error("Error getting next category ID:", error);
    return Date.now(); // Fallback to timestamp
  }
};

// Category CRUD operations
export const getCategories = async (): Promise<ImpressionCategory[]> => {
  try {
    const categoriesJson = await AsyncStorage.getItem(CATEGORIES_KEY);
    if (categoriesJson) {
      return JSON.parse(categoriesJson);
    }

    // If no categories exist, seed with defaults
    await AsyncStorage.setItem(
      CATEGORIES_KEY,
      JSON.stringify(DEFAULT_CATEGORIES)
    );
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error("Error getting categories:", error);
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategory = async (
  category: Omit<ImpressionCategory, "id">
): Promise<ImpressionCategory> => {
  try {
    const categories = await getCategories();
    const newCategory: ImpressionCategory = {
      ...category,
      id: await getNextCategoryId(),
    };
    categories.push(newCategory);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return newCategory;
  } catch (error) {
    console.error("Error saving category:", error);
    throw error;
  }
};

export const updateCategory = async (
  id: number,
  updates: Partial<Omit<ImpressionCategory, "id">>
): Promise<void> => {
  try {
    const categories = await getCategories();
    const index = categories.findIndex((cat) => cat.id === id);
    if (index !== -1) {
      categories[index] = {
        ...categories[index],
        ...updates,
      };
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    }
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    const categories = await getCategories();
    const filteredCategories = categories.filter((cat) => cat.id !== id);
    await AsyncStorage.setItem(
      CATEGORIES_KEY,
      JSON.stringify(filteredCategories)
    );

    // Also remove this category from all impressions
    const impressions = await getImpressions();
    const updatedImpressions = impressions.map((impression) => ({
      ...impression,
      categories: impression.categories.filter((catId) => catId !== id),
      updatedAt: new Date().toISOString(),
    }));
    await AsyncStorage.setItem(
      IMPRESSIONS_KEY,
      JSON.stringify(updatedImpressions)
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// Reset categories to default (for testing)
export const resetCategoriesToDefault = async (): Promise<void> => {
  try {
    // Reset categories to default
    await AsyncStorage.setItem(
      CATEGORIES_KEY,
      JSON.stringify(DEFAULT_CATEGORIES)
    );

    // Remove all categories from existing impressions
    const impressions = await getImpressions();
    const updatedImpressions = impressions.map((impression) => ({
      ...impression,
      categories: [],
      updatedAt: new Date().toISOString(),
    }));
    await AsyncStorage.setItem(
      IMPRESSIONS_KEY,
      JSON.stringify(updatedImpressions)
    );
  } catch (error) {
    console.error("Error resetting categories:", error);
    throw error;
  }
};

// Helper function to resolve category IDs to full category objects
export const resolveCategoryIds = async (
  categoryIds: number[]
): Promise<ImpressionCategory[]> => {
  try {
    const allCategories = await getCategories();
    return categoryIds
      .map((id) => allCategories.find((cat) => cat.id === id))
      .filter((cat): cat is ImpressionCategory => cat !== undefined);
  } catch (error) {
    console.error("Error resolving category IDs:", error);
    return [];
  }
};
