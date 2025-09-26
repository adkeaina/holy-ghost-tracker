import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ImpressionCategory } from "../types";
import { getCategories } from "../utils/storage";
import CategoryChip from "./CategoryChip";
import CategoryModal from "./CategoryModal";

interface CategoryListProps {
  readonly?: boolean;
  selectedCategories: number[];
  onSelectionChange: (categories: number[]) => void;
  style?: any;
}

export default function CategoryList({
  readonly = true,
  selectedCategories,
  onSelectionChange,
  style,
}: CategoryListProps) {
  const [categories, setCategories] = useState<ImpressionCategory[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    ImpressionCategory | undefined
  >();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const loadedCategories = await getCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const isSelected = (categoryId: number) => {
    return selectedCategories.includes(categoryId);
  };

  const handleCategoryPress = (category: ImpressionCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isSelected(category.id)) {
      // Remove from selection
      const newSelection = selectedCategories.filter(
        (catId) => catId !== category.id
      );
      onSelectionChange(newSelection);
    } else {
      // Add to selection
      const newSelection = [...selectedCategories, category.id];
      onSelectionChange(newSelection);
    }
  };

  const handleCategoryLongPress = (category: ImpressionCategory) => {
    setEditingCategory(category);
    setIsModalVisible(true);
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingCategory(undefined);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingCategory(undefined);
  };

  const handleModalSave = () => {
    loadCategories(); // Refresh the categories list
  };

  return (
    <View style={[styles.container, style]}>
      {!readonly && <Text style={styles.label}>Categories</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            category={category}
            isSelected={isSelected(category.id)}
            onPress={() => handleCategoryPress(category)}
            onLongPress={() => handleCategoryLongPress(category)}
          />
        ))}

        {/* Add Category Button */}
        {!readonly && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <CategoryModal
        visible={isModalVisible}
        onClose={handleModalClose}
        category={editingCategory}
        onSave={handleModalSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  scrollContent: {
    alignItems: "flex-start",
    paddingRight: 20,
  },
  addButton: {
    width: 40,
    height: 32,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#bdc3c7",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  addButtonText: {
    color: "#7f8c8d",
    fontSize: 18,
    fontWeight: "bold",
  },
});
