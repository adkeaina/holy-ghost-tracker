import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SpiritualImpression } from "@/src/types";
import { useImpressions } from "@/src/context/ImpressionsContext";
import Impression from "@/src/components/Impression";
import FilterModal, { FilterOptions } from "@/src/components/FilterModal";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import { useTheme, getTabBarPadding } from "@/src/theme";

export default function Insights() {
  const { impressions, refreshImpressions } = useImpressions();
  const [expandedImpression, setExpandedImpression] =
    useState<SpiritualImpression | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    dateRange: { type: "all" },
    description: "",
  });
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      refreshImpressions();
    }, [refreshImpressions])
  );

  // Filter impressions based on current filters
  const filteredImpressions = useMemo(() => {
    let filtered = [...impressions];

    // Description filter (case insensitive)
    if (filters.description.trim()) {
      const searchTerm = filters.description.toLowerCase().trim();
      filtered = filtered.filter((impression) =>
        impression.description.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((impression) =>
        filters.categories.some((categoryId) =>
          impression.categories.includes(categoryId)
        )
      );
    }

    // Date filter
    if (filters.dateRange.type !== "all") {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = new Date(now.getTime() + 24 * 60 * 60 * 1000); // End of today

      if (filters.dateRange.type === "preset" && filters.dateRange.preset) {
        switch (filters.dateRange.preset) {
          case "today":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );
            break;
          case "yesterday":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - 1
            );
            endDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );
            break;
          case "last7days":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "last30days":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "last3months":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth() - 3,
              now.getDate()
            );
            break;
          case "last6months":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth() - 6,
              now.getDate()
            );
            break;
          case "lastYear":
            startDate = new Date(
              now.getFullYear() - 1,
              now.getMonth(),
              now.getDate()
            );
            break;
          default:
            startDate = new Date(0); // Beginning of time
        }
      } else if (filters.dateRange.type === "custom") {
        startDate = filters.dateRange.customFrom
          ? new Date(filters.dateRange.customFrom)
          : new Date(0);
        endDate = filters.dateRange.customTo
          ? new Date(filters.dateRange.customTo)
          : endDate;
      } else {
        startDate = new Date(0);
      }

      filtered = filtered.filter((impression) => {
        const impressionDate = new Date(impression.createdAt);
        return impressionDate >= startDate && impressionDate <= endDate;
      });
    }

    return filtered;
  }, [impressions, filters]);

  const handleImpressionPress = useCallback(
    (impression: SpiritualImpression) => {
      setExpandedImpression((prev) =>
        prev?.id === impression.id ? null : impression
      );
    },
    []
  );

  const handleImpressionLongPress = useCallback(
    (impression: SpiritualImpression) => {
      router.push({
        pathname: "/(tabs)/insights/impressionForm",
        params: {
          impression: JSON.stringify(impression),
        },
      });
    },
    []
  );

  const handleFilterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterModalVisible(true);
  };

  const handleFilterClose = () => {
    setFilterModalVisible(false);
  };

  const handleFilterApply = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.categories.length > 0 ||
      filters.dateRange.type !== "all" ||
      filters.description.trim() !== ""
    );
  };

  const renderImpression = useCallback(
    ({ item }: { item: SpiritualImpression }) => (
      <View style={styles.impressionContainer}>
        <Impression
          impression={item}
          onPress={handleImpressionPress}
          onLongPress={handleImpressionLongPress}
          expanded={expandedImpression?.id === item.id}
          activeOpacity={0.2}
        />
      </View>
    ),
    [handleImpressionPress, handleImpressionLongPress, expandedImpression?.id]
  );

  const keyExtractor = useCallback((item: SpiritualImpression) => item.id, []);

  return (
    <BackgroundGradient>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  All Impressions 🕊️
                </Text>
                <Text
                  style={[styles.subtitle, { color: theme.colors.textMuted }]}
                >
                  {filteredImpressions.length} of {impressions.length}{" "}
                  impression
                  {impressions.length !== 1 ? "s" : ""}
                  {hasActiveFilters() && " (filtered)"}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  { backgroundColor: theme.colors.surface },
                  hasActiveFilters() && {
                    backgroundColor: theme.colors.accent,
                  },
                ]}
                onPress={handleFilterPress}
              >
                <Ionicons
                  name='filter'
                  size={24}
                  color={
                    hasActiveFilters()
                      ? theme.colors.primary
                      : theme.colors.textMuted
                  }
                />
                {hasActiveFilters() && (
                  <View
                    style={[
                      styles.filterIndicator,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          {impressions.length > 0 ? (
            filteredImpressions.length > 0 ? (
              <FlatList
                data={filteredImpressions}
                keyExtractor={keyExtractor}
                renderItem={renderImpression}
                contentContainerStyle={[
                  styles.listContainer,
                  { paddingBottom: getTabBarPadding(insets.bottom) },
                ]}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={50}
                windowSize={10}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text
                  style={[styles.emptyText, { color: theme.colors.textMuted }]}
                >
                  No matching impressions
                </Text>
                <Text
                  style={[
                    styles.emptySubtext,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  Try adjusting your filters to see more results
                </Text>
                <TouchableOpacity
                  style={[
                    styles.clearFiltersButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() =>
                    setFilters({
                      categories: [],
                      dateRange: { type: "all" },
                      description: "",
                    })
                  }
                >
                  <Text
                    style={[
                      styles.clearFiltersButtonText,
                      { color: theme.colors.buttonText },
                    ]}
                  >
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <View style={styles.emptyContainer}>
              <Text
                style={[styles.emptyText, { color: theme.colors.textMuted }]}
              >
                No spiritual impressions yet
              </Text>
              <Text
                style={[styles.emptySubtext, { color: theme.colors.textMuted }]}
              >
                Start tracking your spiritual experiences from the Home tab
              </Text>
            </View>
          )}

          {/* Filter Modal */}
          <FilterModal
            visible={filterModalVisible}
            onClose={handleFilterClose}
            onApply={handleFilterApply}
            initialFilters={filters}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  impressionContainer: {
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: "#ddeaf7",
  },
  filterIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  clearFiltersButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  clearFiltersButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
