import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import CategoryList from "./CategoryList";

export interface FilterOptions {
  categories: number[];
  dateRange: {
    type: "all" | "preset" | "custom";
    preset?:
      | "today"
      | "yesterday"
      | "last7days"
      | "last30days"
      | "last3months"
      | "last6months"
      | "lastYear";
    customFrom?: string; // ISO date string
    customTo?: string; // ISO date string
  };
  description: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
}

const DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7days", label: "Last 7 days" },
  { key: "last30days", label: "Last 30 days" },
  { key: "last3months", label: "Last 3 months" },
  { key: "last6months", label: "Last 6 months" },
  { key: "lastYear", label: "Last year" },
] as const;

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  useEffect(() => {
    setFilters(initialFilters);
    if (initialFilters.dateRange.type === "custom") {
      setCustomFromDate(
        initialFilters.dateRange.customFrom
          ? new Date(initialFilters.dateRange.customFrom)
              .toISOString()
              .split("T")[0]
          : ""
      );
      setCustomToDate(
        initialFilters.dateRange.customTo
          ? new Date(initialFilters.dateRange.customTo)
              .toISOString()
              .split("T")[0]
          : ""
      );
    }
  }, [initialFilters, visible]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleApply = () => {
    // Validate custom date range if selected
    if (filters.dateRange.type === "custom") {
      if (!customFromDate || !customToDate) {
        Alert.alert(
          "Invalid Date Range",
          "Please select both from and to dates."
        );
        return;
      }

      const fromDate = new Date(customFromDate);
      const toDate = new Date(customToDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      if (fromDate > today || toDate > today) {
        Alert.alert("Invalid Date Range", "Cannot filter for future dates.");
        return;
      }

      if (fromDate > toDate) {
        Alert.alert("Invalid Date Range", "From date cannot be after to date.");
        return;
      }

      // Set the custom dates in the filters
      const updatedFilters = {
        ...filters,
        dateRange: {
          ...filters.dateRange,
          customFrom: fromDate.toISOString(),
          customTo: new Date(
            toDate.getTime() + 24 * 60 * 60 * 1000 - 1
          ).toISOString(), // End of to date
        },
      };
      onApply(updatedFilters);
    } else {
      onApply(filters);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const clearedFilters: FilterOptions = {
      categories: [],
      dateRange: { type: "all" },
      description: "",
    };
    setFilters(clearedFilters);
    setCustomFromDate("");
    setCustomToDate("");
  };

  const handleCategoryChange = (categories: number[]) => {
    setFilters((prev) => ({
      ...prev,
      categories,
    }));
  };

  const handleDateRangeTypeChange = (
    type: FilterOptions["dateRange"]["type"]
  ) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { type },
    }));
    if (type !== "custom") {
      setCustomFromDate("");
      setCustomToDate("");
    }
  };

  const handleDatePresetChange = (
    preset: FilterOptions["dateRange"]["preset"]
  ) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { type: "preset", preset },
    }));
  };

  const handleDescriptionChange = (description: string) => {
    setFilters((prev) => ({
      ...prev,
      description,
    }));
  };

  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name='close' size={24} color='#7f8c8d' />
              </TouchableOpacity>
              <Text style={styles.title}>Filter Impressions</Text>
              <TouchableOpacity
                onPress={handleClearAll}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Description Filter */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder='Search in description...'
                  placeholderTextColor='#bdc3c7'
                  value={filters.description}
                  onChangeText={handleDescriptionChange}
                  autoCapitalize='none'
                  autoCorrect={false}
                />
              </View>

              {/* Category Filter */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <CategoryList
                  selectedCategories={filters.categories}
                  onSelectionChange={handleCategoryChange}
                  style={styles.categoryList}
                />
              </View>

              {/* Date Filter */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Date Range</Text>

                {/* Date range type selector */}
                <View style={styles.dateTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.dateTypeButton,
                      filters.dateRange.type === "all" &&
                        styles.dateTypeButtonSelected,
                    ]}
                    onPress={() => handleDateRangeTypeChange("all")}
                  >
                    <Text
                      style={[
                        styles.dateTypeButtonText,
                        filters.dateRange.type === "all" &&
                          styles.dateTypeButtonTextSelected,
                      ]}
                    >
                      All Time
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dateTypeButton,
                      filters.dateRange.type === "preset" &&
                        styles.dateTypeButtonSelected,
                    ]}
                    onPress={() => handleDateRangeTypeChange("preset")}
                  >
                    <Text
                      style={[
                        styles.dateTypeButtonText,
                        filters.dateRange.type === "preset" &&
                          styles.dateTypeButtonTextSelected,
                      ]}
                    >
                      Quick Select
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dateTypeButton,
                      filters.dateRange.type === "custom" &&
                        styles.dateTypeButtonSelected,
                    ]}
                    onPress={() => handleDateRangeTypeChange("custom")}
                  >
                    <Text
                      style={[
                        styles.dateTypeButtonText,
                        filters.dateRange.type === "custom" &&
                          styles.dateTypeButtonTextSelected,
                      ]}
                    >
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Preset options */}
                {filters.dateRange.type === "preset" && (
                  <View style={styles.presetContainer}>
                    {DATE_PRESETS.map((preset) => (
                      <TouchableOpacity
                        key={preset.key}
                        style={[
                          styles.presetButton,
                          filters.dateRange.preset === preset.key &&
                            styles.presetButtonSelected,
                        ]}
                        onPress={() => handleDatePresetChange(preset.key)}
                      >
                        <Text
                          style={[
                            styles.presetButtonText,
                            filters.dateRange.preset === preset.key &&
                              styles.presetButtonTextSelected,
                          ]}
                        >
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Custom date inputs */}
                {filters.dateRange.type === "custom" && (
                  <View style={styles.customDateContainer}>
                    <View style={styles.dateInputGroup}>
                      <Text style={styles.dateInputLabel}>From</Text>
                      <TextInput
                        style={styles.dateInput}
                        placeholder='YYYY-MM-DD'
                        placeholderTextColor='#bdc3c7'
                        value={customFromDate}
                        onChangeText={setCustomFromDate}
                        maxLength={10}
                        keyboardType='numeric'
                      />
                    </View>
                    <View style={styles.dateInputGroup}>
                      <Text style={styles.dateInputLabel}>To</Text>
                      <TextInput
                        style={styles.dateInput}
                        placeholder='YYYY-MM-DD'
                        placeholderTextColor='#bdc3c7'
                        value={customToDate}
                        onChangeText={setCustomToDate}
                        maxLength={10}
                        keyboardType='numeric'
                      />
                    </View>
                    <Text style={styles.dateHint}>
                      Maximum date: {getTodayString()}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: "#e74c3c",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#2c3e50",
  },
  categoryList: {
    marginBottom: 0,
  },
  dateTypeContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  dateTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    backgroundColor: "white",
    alignItems: "center",
  },
  dateTypeButtonSelected: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  dateTypeButtonText: {
    color: "#7f8c8d",
    fontWeight: "500",
  },
  dateTypeButtonTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  presetContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 20,
    backgroundColor: "white",
  },
  presetButtonSelected: {
    backgroundColor: "#27ae60",
    borderColor: "#27ae60",
  },
  presetButtonText: {
    color: "#7f8c8d",
    fontWeight: "500",
  },
  presetButtonTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  customDateContainer: {
    gap: 15,
  },
  dateInputGroup: {
    gap: 5,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7f8c8d",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#2c3e50",
  },
  dateHint: {
    fontSize: 12,
    color: "#95a5a6",
    fontStyle: "italic",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
  },
  applyButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
