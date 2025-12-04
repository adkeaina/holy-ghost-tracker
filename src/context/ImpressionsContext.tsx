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
  getLastImpression: () => SpiritualImpression | null;
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

  // Initialize with data on mount
  useEffect(() => {
    refreshImpressions();
  }, []);

  const refreshImpressions = async (skipLoading?: boolean) => {
    if (!skipLoading) {
      setIsLoading(true);
    }

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

  const getLastImpression = (): SpiritualImpression | null => {
    return impressions.length > 0 ? impressions[0] : null;
  };

  const value: ImpressionsContextType = {
    impressions,
    categories,
    isLoading,
    refreshImpressions,
    saveImpression,
    updateImpression,
    deleteImpression,
    saveCategory,
    updateCategory,
    deleteCategory,
    getLastImpression,
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
