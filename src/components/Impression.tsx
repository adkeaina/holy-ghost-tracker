import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { SpiritualImpression, ImpressionCategory } from "../types";
import { formatDateTime } from "../utils/time";
import { resolveCategoryIds } from "../utils/storage";
import CategoryChip from "./CategoryChip";
import GlassyCard from "./GlassyCard";
import { useTheme } from "../theme";

interface ImpressionProps {
  impression?: SpiritualImpression | null;
  onPress?: (impression: SpiritualImpression) => void;
  onLongPress?: (impression: SpiritualImpression) => void;
  showEmptyState?: boolean;
  emptyStateText?: string;
  expanded?: boolean;
  activeOpacity?: number;
}

function Impression({
  impression,
  onPress,
  onLongPress,
  showEmptyState = true,
  emptyStateText = "No spiritual impressions recorded yet",
  expanded = false,
  activeOpacity = 1,
}: ImpressionProps) {
  const [resolvedCategories, setResolvedCategories] = useState<
    ImpressionCategory[]
  >([]);
  const { theme } = useTheme();

  // Memoize category IDs string to compare by content, not reference
  const categoryIdsKey = useMemo(
    () => JSON.stringify(impression?.categories || []),
    [impression?.categories]
  );

  useEffect(() => {
    const loadCategories = async () => {
      const categoryIds = impression?.categories || [];
      if (categoryIds.length > 0) {
        const categories = await resolveCategoryIds(categoryIds);
        setResolvedCategories(categories);
      } else {
        setResolvedCategories([]);
      }
    };

    loadCategories();
  }, [categoryIdsKey, impression?.categories]);

  // All hooks must be called before any early returns
  const handlePress = useCallback(() => {
    if (impression) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.(impression);
    }
  }, [impression, onPress]);

  const handleLongPress = useCallback(() => {
    if (impression) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress?.(impression);
    }
  }, [impression, onLongPress]);

  const formattedDateTime = useMemo(
    () => (impression ? formatDateTime(impression.dateTime) : ""),
    [impression?.dateTime]
  );

  const CardComponent = onPress || onLongPress ? TouchableOpacity : View;

  // Early returns after all hooks
  if (!impression && showEmptyState) {
    return (
      <GlassyCard style={styles.impressionCard}>
        <Text
          style={[styles.noImpressionText, { color: theme.colors.textMuted }]}
        >
          {emptyStateText}
        </Text>
      </GlassyCard>
    );
  }

  if (!impression) {
    return null;
  }

  return (
    <CardComponent
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={activeOpacity}
    >
      <GlassyCard style={styles.impressionCard}>
        <View style={styles.contentContainer}>
          <Text
            style={[styles.impressionDescription, { color: theme.colors.text }]}
            numberOfLines={expanded ? undefined : 3}
          >
            {impression.description}
          </Text>

          {resolvedCategories.length > 0 && (
            <View style={styles.categoriesContainer}>
              {resolvedCategories.map((category) => (
                <CategoryChip
                  key={category.id}
                  category={category}
                  size='small'
                  disabled
                />
              ))}
            </View>
          )}

          <Text
            style={[styles.impressionDate, { color: theme.colors.textMuted }]}
          >
            {formattedDateTime}
          </Text>
        </View>
      </GlassyCard>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  impressionCard: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  contentContainer: {
    width: "100%",
  },
  impressionDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 8,
  },
  impressionDate: {
    fontSize: 14,
    fontStyle: "italic",
  },
  noImpressionText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
});

// Memoize the component to prevent unnecessary re-renders
export default React.memo(Impression, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.impression?.id === nextProps.impression?.id &&
    prevProps.expanded === nextProps.expanded &&
    prevProps.activeOpacity === nextProps.activeOpacity &&
    prevProps.showEmptyState === nextProps.showEmptyState &&
    prevProps.emptyStateText === nextProps.emptyStateText &&
    prevProps.impression?.description === nextProps.impression?.description &&
    prevProps.impression?.dateTime === nextProps.impression?.dateTime &&
    JSON.stringify(prevProps.impression?.categories) ===
      JSON.stringify(nextProps.impression?.categories)
  );
});
