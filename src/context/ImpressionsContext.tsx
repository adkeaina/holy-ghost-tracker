import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { SpiritualImpression, ImpressionCategory } from "../types";
import {
  getImpressions,
  getCategories,
  saveImpression as saveImpressionStorage,
  updateImpression as updateImpressionStorage,
  deleteImpression as deleteImpressionStorage,
  saveCategory as saveCategoryStorage,
  updateCategory as updateCategoryStorage,
  deleteCategory as deleteCategoryStorage,
} from "../utils/storage";

interface ImpressionsContextType {
  // Core entities
  impressions: SpiritualImpression[];
  categories: ImpressionCategory[];

  // Derived data
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshImpressions: (skipLoading?: boolean) => Promise<void>;
  saveImpression: (
    impression: Omit<SpiritualImpression, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateImpression: (
    id: string,
    updates: Partial<Omit<SpiritualImpression, "id" | "createdAt">>
  ) => Promise<void>;
  deleteImpression: (id: string) => Promise<void>;
  saveCategory: (category: Omit<ImpressionCategory, "id">) => Promise<void>;
  updateCategory: (
    id: number,
    updates: Partial<Omit<ImpressionCategory, "id">>
  ) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  // Helper methods
  getImpressionById: (id: string) => SpiritualImpression | undefined;
  getLastImpression: () => SpiritualImpression | null;
  getImpressionsByCategory: (categoryId: number) => SpiritualImpression[];
}

const ImpressionsContext = createContext<ImpressionsContextType | undefined>(
  undefined
);

interface ImpressionsProviderProps {
  children: ReactNode;
}

export const ImpressionsProvider = ({ children }: ImpressionsProviderProps) => {
  const [impressions, setImpressions] = useState<SpiritualImpression[]>([]);
  const [categories, setCategories] = useState<ImpressionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with data on mount
  useEffect(() => {
    refreshImpressions();
  }, []);

  const refreshImpressions = async (skipLoading?: boolean) => {
    if (!skipLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [impressionsData, categoriesData] = await Promise.all([
        getImpressions(),
        getCategories(),
      ]);

      // Sort impressions by dateTime, most recent first
      const sortedImpressions = impressionsData.sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      );

      setImpressions(sortedImpressions);
      setCategories(categoriesData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
      console.error("Error refreshing impressions:", err);
    } finally {
      if (!skipLoading) {
        setIsLoading(false);
      }
    }
  };

  const saveImpression = async (
    impression: Omit<SpiritualImpression, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await saveImpressionStorage(impression);
      await refreshImpressions(true);
    } catch (err) {
      console.error("Error saving impression:", err);
      throw err;
    }
  };

  const updateImpression = async (
    id: string,
    updates: Partial<Omit<SpiritualImpression, "id" | "createdAt">>
  ) => {
    try {
      await updateImpressionStorage(id, updates);
      await refreshImpressions(true);
    } catch (err) {
      console.error("Error updating impression:", err);
      throw err;
    }
  };

  const deleteImpression = async (id: string) => {
    try {
      await deleteImpressionStorage(id);
      await refreshImpressions(true);
    } catch (err) {
      console.error("Error deleting impression:", err);
      throw err;
    }
  };

  const saveCategory = async (category: Omit<ImpressionCategory, "id">) => {
    try {
      await saveCategoryStorage(category);
      await refreshImpressions(true);
    } catch (err) {
      console.error("Error saving category:", err);
      throw err;
    }
  };

  const updateCategory = async (
    id: number,
    updates: Partial<Omit<ImpressionCategory, "id">>
  ) => {
    try {
      await updateCategoryStorage(id, updates);
      await refreshImpressions(true);
    } catch (err) {
      console.error("Error updating category:", err);
      throw err;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await deleteCategoryStorage(id);
      await refreshImpressions(true);
    } catch (err) {
      console.error("Error deleting category:", err);
      throw err;
    }
  };

  const getImpressionById = (id: string): SpiritualImpression | undefined => {
    return impressions.find((impression) => impression.id === id);
  };

  const getLastImpression = (): SpiritualImpression | null => {
    return impressions.length > 0 ? impressions[0] : null;
  };

  const getImpressionsByCategory = (
    categoryId: number
  ): SpiritualImpression[] => {
    return impressions.filter((impression) =>
      impression.categories.includes(categoryId)
    );
  };

  const value: ImpressionsContextType = {
    impressions,
    categories,
    isLoading,
    error,
    refreshImpressions,
    saveImpression,
    updateImpression,
    deleteImpression,
    saveCategory,
    updateCategory,
    deleteCategory,
    getImpressionById,
    getLastImpression,
    getImpressionsByCategory,
  };

  return (
    <ImpressionsContext.Provider value={value}>
      {children}
    </ImpressionsContext.Provider>
  );
};

export const useImpressions = () => {
  const context = useContext(ImpressionsContext);
  if (context === undefined) {
    throw new Error(
      "useImpressions must be used within an ImpressionsProvider"
    );
  }
  return context;
};
