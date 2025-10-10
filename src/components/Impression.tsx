import React, { useState, useEffect } from "react";
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

export default function Impression({
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

  useEffect(() => {
    const loadCategories = async () => {
      if (impression?.categories && impression.categories.length > 0) {
        const categories = await resolveCategoryIds(impression.categories);
        setResolvedCategories(categories);
      } else {
        setResolvedCategories([]);
      }
    };

    loadCategories();
  }, [impression?.categories]);
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

  const CardComponent = onPress || onLongPress ? TouchableOpacity : View;

  return (
    <CardComponent
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(impression);
      }}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress?.(impression);
      }}
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
            {formatDateTime(impression.dateTime)}
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
