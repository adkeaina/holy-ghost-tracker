import {
  SpiritualImpression,
  NotificationSettings,
  UserProfile,
  ImpressionCategory,
} from "../types";
import { supabase } from "./supabase";

// Helper function to get current authenticated user ID
const getCurrentUserId = async (): Promise<string> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return "";
  }

  return user.id;
};

// Type mapping helpers
const mapDbImpressionToTypeScript = (
  row: any,
  categoryIds: number[]
): SpiritualImpression => {
  return {
    id: row.id,
    description: row.description,
    dateTime: row.date_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categories: categoryIds,
  };
};

const mapDbCategoryToTypeScript = (row: any): ImpressionCategory => {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    notRemovable: row.not_removable,
  };
};

const mapDbProfileToTypeScript = (row: any): UserProfile => {
  return {
    name: row.name,
    email: row.email,
    notificationSettings: {
      enabled: row.notification_enabled,
      intervalDays: row.notification_interval_days as 1 | 3 | 7 | 14 | 30,
    },
  };
};

// Spiritual Impressions CRUD operations
export const saveImpression = async (
  impression: Omit<SpiritualImpression, "id" | "createdAt" | "updatedAt">
): Promise<SpiritualImpression> => {
  try {
    const userId = await getCurrentUserId();

    // Insert impression
    const { data: impressionData, error: impressionError } = await supabase
      .from("impressions")
      .insert({
        user_id: userId,
        description: impression.description,
        date_time: impression.dateTime,
      })
      .select()
      .single();

    if (impressionError || !impressionData) {
      throw impressionError || new Error("Failed to create impression");
    }

    // Insert category associations if any
    if (impression.categories && impression.categories.length > 0) {
      const categoryAssociations = impression.categories.map((categoryId) => ({
        impression_id: impressionData.id,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from("impression_categories")
        .insert(categoryAssociations);

      if (categoryError) {
        console.error("Error associating categories:", categoryError);
        // Don't throw - impression is created, categories can be added later
      }
    }

    return mapDbImpressionToTypeScript(
      impressionData,
      impression.categories || []
    );
  } catch (error) {
    console.error("Error saving impression:", error);
    throw error;
  }
};

export const getImpressions = async (): Promise<SpiritualImpression[]> => {
  try {
    const userId = await getCurrentUserId();

    // Get impressions with category associations
    const { data: impressions, error } = await supabase
      .from("impressions")
      .select(
        `
        id,
        description,
        date_time,
        created_at,
        updated_at,
        impression_categories (
          category_id
        )
      `
      )
      .eq("user_id", userId)
      .order("date_time", { ascending: false });

    if (error) {
      throw error;
    }

    if (!impressions) {
      return [];
    }

    // Map to TypeScript format
    return impressions.map((imp) => {
      const categoryIds =
        imp.impression_categories?.map((ic: any) => ic.category_id) || [];
      return mapDbImpressionToTypeScript(imp, categoryIds);
    });
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
    const userId = await getCurrentUserId();

    // Build update object (only include fields that are being updated)
    const updateData: any = {};
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.dateTime !== undefined) {
      updateData.date_time = updates.dateTime;
    }

    // Update impression if there are fields to update
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from("impressions")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
    }

    // Update category associations if provided
    if (updates.categories !== undefined) {
      // Delete existing associations
      const { error: deleteError } = await supabase
        .from("impression_categories")
        .delete()
        .eq("impression_id", id);

      if (deleteError) {
        throw deleteError;
      }

      // Insert new associations if any
      if (updates.categories.length > 0) {
        const categoryAssociations = updates.categories.map((categoryId) => ({
          impression_id: id,
          category_id: categoryId,
        }));

        const { error: insertError } = await supabase
          .from("impression_categories")
          .insert(categoryAssociations);

        if (insertError) {
          throw insertError;
        }
      }
    }
  } catch (error) {
    console.error("Error updating impression:", error);
    throw error;
  }
};

export const deleteImpression = async (id: string): Promise<void> => {
  try {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from("impressions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
    // CASCADE will handle impression_categories deletion
  } catch (error) {
    console.error("Error deleting impression:", error);
    throw error;
  }
};

export const getLastImpression =
  async (): Promise<SpiritualImpression | null> => {
    try {
      const userId = await getCurrentUserId();

      const { data: impressions, error } = await supabase
        .from("impressions")
        .select(
          `
          id,
          description,
          date_time,
          created_at,
          updated_at,
          impression_categories (
            category_id
          )
        `
        )
        .eq("user_id", userId)
        .order("date_time", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (!impressions || impressions.length === 0) {
        return null;
      }

      const impression = impressions[0];
      const categoryIds =
        impression.impression_categories?.map((ic: any) => ic.category_id) ||
        [];
      return mapDbImpressionToTypeScript(impression, categoryIds);
    } catch (error) {
      console.error("Error getting last impression:", error);
      return null;
    }
  };

// Onboarding operations
export const getHasOnboarded = async (): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is not authenticated, they haven't onboarded
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("has_onboarded")
      .eq("id", user.id)
      .single();

    if (error) {
      // If profile doesn't exist, user hasn't onboarded
      return false;
    }

    return data?.has_onboarded || false;
  } catch (error) {
    console.error("Error getting onboarding status:", error);
    // Default to false (show onboarding) on any error
    return false;
  }
};

export const setHasOnboarded = async (hasOnboarded: boolean): Promise<void> => {
  try {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from("profiles")
      .update({ has_onboarded: hasOnboarded })
      .eq("id", userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error setting onboarding status:", error);
    throw error;
  }
};

export const completeOnboarding = async (
  name: string,
  email: string
): Promise<void> => {
  try {
    const userId = await getCurrentUserId();

    // Get email from auth session (preferred) or use provided email
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const sessionEmail = user?.email || user?.user_metadata?.email || email;
    const sessionName =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      `${user?.user_metadata?.given_name || ""} ${
        user?.user_metadata?.family_name || ""
      }`.trim() ||
      name;

    // Upsert profile - trigger will seed default categories
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        name: sessionName,
        email: sessionEmail,
        notification_enabled: false,
        notification_interval_days: 7,
        has_onboarded: true,
      },
      {
        onConflict: "id",
      }
    );

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw error;
  }
};

export const resetUserInfo = async (): Promise<void> => {
  try {
    const userId = await getCurrentUserId();

    // Delete profile (cascade will handle related data if needed)
    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error resetting user info:", error);
    throw error;
  }
};

// Profile operations
export const ensureProfileFromSession = async (): Promise<void> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return; // User not authenticated, skip profile creation
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      return; // Profile already exists
    }

    // Get email from auth user
    const email = user.email || user.user_metadata?.email || "";

    // Get name from user metadata or use default
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      `${user.user_metadata?.given_name || ""} ${
        user.user_metadata?.family_name || ""
      }`.trim() ||
      "User";

    // Create profile with auth data
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      name,
      email,
      notification_enabled: false,
      notification_interval_days: 7,
      has_onboarded: false,
    });

    if (error) {
      console.error("Error creating profile from session:", error);
    }
  } catch (error) {
    console.error("Error ensuring profile from session:", error);
  }
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const userId = await getCurrentUserId();

    // Ensure profile exists from session data
    await ensureProfileFromSession();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      // Fallback: try to get email from auth session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const email =
        user?.email || user?.user_metadata?.email || "user@example.com";
      const name =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        `${user?.user_metadata?.given_name || ""} ${
          user?.user_metadata?.family_name || ""
        }`.trim() ||
        "User";

      const defaultProfile: UserProfile = {
        name,
        email,
        notificationSettings: {
          enabled: false,
          intervalDays: 7,
        },
      };

      return defaultProfile;
    }

    return mapDbProfileToTypeScript(data);
  } catch (error) {
    console.error("Error getting user profile:", error);
    // Return default profile on error
    return {
      name: "User",
      email: "user@example.com",
      notificationSettings: {
        enabled: false,
        intervalDays: 7,
      },
    };
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    const userId = await getCurrentUserId();

    // Don't allow updating name/email - get them from auth session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const email = user?.email || user?.user_metadata?.email || profile.email;
    const name =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      `${user?.user_metadata?.given_name || ""} ${
        user?.user_metadata?.family_name || ""
      }`.trim() ||
      profile.name;

    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        name,
        email,
        notification_enabled: profile.notificationSettings.enabled,
        notification_interval_days: profile.notificationSettings.intervalDays,
        has_onboarded: true, // Assume if saving profile, user has onboarded
      },
      {
        onConflict: "id",
      }
    );

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

export const updateNotificationSettings = async (
  settings: NotificationSettings
): Promise<void> => {
  try {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from("profiles")
      .update({
        notification_enabled: settings.enabled,
        notification_interval_days: settings.intervalDays,
      })
      .eq("id", userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};

// Category CRUD operations
export const getCategories = async (): Promise<ImpressionCategory[]> => {
  try {
    const userId = await getCurrentUserId();

    // Return early if user is not logged in
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      // If no categories exist, they should be seeded by trigger on profile creation
      // But if profile exists without categories, return empty array
      return [];
    }

    return data.map(mapDbCategoryToTypeScript);
  } catch (error) {
    console.error("Error getting categories:", error);
    return [];
  }
};

export const saveCategory = async (
  category: Omit<ImpressionCategory, "id">
): Promise<ImpressionCategory> => {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: userId,
        name: category.name,
        color: category.color,
        not_removable: category.notRemovable || false,
      })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to create category");
    }

    return mapDbCategoryToTypeScript(data);
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
    const userId = await getCurrentUserId();

    const updateData: any = {};
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.color !== undefined) {
      updateData.color = updates.color;
    }
    if (updates.notRemovable !== undefined) {
      updateData.not_removable = updates.notRemovable;
    }

    const { error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    const userId = await getCurrentUserId();

    // Delete category - CASCADE will handle impression_categories deletion
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
    // Category associations are automatically removed via CASCADE
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// Reset categories to default (for testing)
export const resetCategoriesToDefault = async (): Promise<void> => {
  try {
    const userId = await getCurrentUserId();

    // Delete all user's categories
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      throw deleteError;
    }

    // Re-seed default categories (trigger should handle this, but we'll do it explicitly)
    const { error: seedError } = await supabase.rpc("seed_default_categories", {
      user_uuid: userId,
    });

    if (seedError) {
      // If RPC fails, insert directly
      await supabase.from("categories").insert([
        {
          user_id: userId,
          name: "Church",
          color: "brown",
          not_removable: true,
        },
        {
          user_id: userId,
          name: "Personal",
          color: "blue",
          not_removable: true,
        },
      ]);
    }

    // Remove all categories from existing impressions (via junction table)
    const { data: impressions } = await supabase
      .from("impressions")
      .select("id")
      .eq("user_id", userId);

    if (impressions && impressions.length > 0) {
      const impressionIds = impressions.map((imp) => imp.id);
      await supabase
        .from("impression_categories")
        .delete()
        .in("impression_id", impressionIds);
    }
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
    if (categoryIds.length === 0) {
      return [];
    }

    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .in("id", categoryIds);

    if (error) {
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map(mapDbCategoryToTypeScript);
  } catch (error) {
    console.error("Error resolving category IDs:", error);
    return [];
  }
};

export const getEnv = (key: string): string => {
  try {
    const value = process.env[key];
    if (!value) {
      console.error(`Environment variable ${key} is not set`);
      return "";
    }
    return value;
  } catch (error) {
    console.error("Error getting environment variable:", error);
    return "";
  }
};

export const submitFeedback = async (feedback: string): Promise<void> => {
  try {
    const { name, email } = await getUserProfile();
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbxerqhtQGSKyVf5qtvHgNp2BpSypsdiS4kEAZ4OdQ06XBAvhOUtJeUYu3rUBxFmC0M8xQ/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          feedback,
          secret: getEnv("EXPO_PUBLIC_FEEDBACK_API_KEY"),
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to submit feedback");
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};
