import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ImpressionCategory } from "../types";
import { useImpressions } from "../context/ImpressionsContext";
import CategoryChip from "./CategoryChip";
import CategoryModal from "./CategoryModal";
import { useTheme } from "../theme";

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
  const { categories, refreshImpressions } = useImpressions();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    ImpressionCategory | undefined
  >();
  const { theme } = useTheme();

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
    refreshImpressions(); // Refresh the categories list
  };

  return (
    <View style={[styles.container, style]}>
      {!readonly && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Categories
        </Text>
      )}
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
          <TouchableOpacity
            style={[styles.addButton, { borderColor: theme.colors.border }]}
            onPress={handleAddPress}
          >
            <Text
              style={[styles.addButtonText, { color: theme.colors.textMuted }]}
            >
              +
            </Text>
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
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
