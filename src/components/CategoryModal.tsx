import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ImpressionCategory } from "../types";
import { saveCategory, updateCategory, deleteCategory } from "../utils/storage";

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  category?: ImpressionCategory; // If provided, this is edit mode
  onSave: () => void; // Callback to refresh category list
}

const COLORS: Array<ImpressionCategory["color"]> = [
  "brown",
  "green",
  "blue",
  "purple",
  "red",
  "orange",
  "yellow",
];

const COLOR_MAP = {
  brown: "#8B4513",
  green: "#27ae60",
  blue: "#3498db",
  purple: "#9b59b6",
  red: "#e74c3c",
  orange: "#f39c12",
  yellow: "#f1c40f",
};

const COLOR_LABELS = {
  brown: "Brown",
  green: "Green",
  blue: "Blue",
  purple: "Purple",
  red: "Red",
  orange: "Orange",
  yellow: "Yellow",
};

export default function CategoryModal({
  visible,
  onClose,
  category,
  onSave,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] =
    useState<ImpressionCategory["color"]>("blue");
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!category;
  const isNotRemovable = category?.notRemovable ?? false;

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSelectedColor(category.color);
    } else {
      setName("");
      setSelectedColor("blue");
    }
  }, [category, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a category name.");
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode) {
        const updates: Partial<Omit<ImpressionCategory, "id">> = {
          color: selectedColor,
        };

        // Only update name if category is removable
        if (!isNotRemovable) {
          updates.name = name.trim();
        }

        await updateCategory(category.id, updates);
        Alert.alert("Success", "Category updated successfully!");
      } else {
        await saveCategory({
          name: name.trim(),
          color: selectedColor,
        });
        Alert.alert("Success", "Category created successfully!");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      Alert.alert("Error", "Failed to save category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!category || isNotRemovable) return;

    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"? This will also remove it from all impressions.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteCategory(category.id);
              Alert.alert("Success", "Category deleted successfully!");
              onSave();
              onClose();
            } catch (error) {
              console.error("Error deleting category:", error);
              Alert.alert(
                "Error",
                "Failed to delete category. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditMode ? "Edit Category" : "New Category"}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category Name</Text>
            <TextInput
              style={[
                styles.textInput,
                isNotRemovable && styles.textInputDisabled,
              ]}
              value={name}
              onChangeText={isNotRemovable ? undefined : setName}
              placeholder='Enter category name...'
              maxLength={30}
              autoFocus={!isEditMode && !isNotRemovable}
              editable={!isNotRemovable}
            />
            {isNotRemovable && (
              <Text style={styles.disabledText}>
                This is a default category and cannot be renamed.
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorGrid}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: COLOR_MAP[color] },
                    selectedColor === color && styles.colorSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedColor(color);
                  }}
                >
                  {selectedColor === color && (
                    <Text style={styles.colorSelectedText}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.colorLabel}>{COLOR_LABELS[selectedColor]}</Text>
          </View>

          {/* Preview */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preview</Text>
            <View style={styles.previewContainer}>
              <View
                style={[
                  styles.previewChip,
                  {
                    backgroundColor: COLOR_MAP[selectedColor],
                    borderColor: COLOR_MAP[selectedColor],
                  },
                ]}
              >
                <Text style={styles.previewText}>
                  {name.trim() || "Category Name"}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {isEditMode && !isNotRemovable && (
            <TouchableOpacity
              style={[
                styles.deleteButton,
                isLoading && styles.deleteButtonDisabled,
              ]}
              onPress={handleDelete}
              disabled={isLoading}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.saveButton,
              isLoading && styles.saveButtonDisabled,
              isEditMode && isNotRemovable && styles.saveButtonFullWidth,
            ]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? "Saving..." : isEditMode ? "Update" : "Create"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: "#3498db",
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "white",
  },
  textInputDisabled: {
    backgroundColor: "#f8f9fa",
    borderColor: "#ecf0f1",
    color: "#7f8c8d",
  },
  disabledText: {
    fontSize: 12,
    color: "#7f8c8d",
    fontStyle: "italic",
    marginTop: 5,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorSelected: {
    borderColor: "#2c3e50",
  },
  colorSelectedText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  colorLabel: {
    marginTop: 10,
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
  },
  previewContainer: {
    alignItems: "flex-start",
  },
  previewChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
  },
  previewText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
    gap: 10,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#e74c3c",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    backgroundColor: "#27ae60",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonFullWidth: {
    flex: 1,
  },
  saveButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
