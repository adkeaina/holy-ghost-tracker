import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { SpiritualImpression } from "../types";
import { formatDateTime } from "../utils/time";

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
  if (!impression && showEmptyState) {
    return (
      <View style={styles.impressionCard}>
        <Text style={styles.noImpressionText}>{emptyStateText}</Text>
      </View>
    );
  }

  if (!impression) {
    return null;
  }

  const CardComponent = onPress || onLongPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={styles.impressionCard}
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
      <Text
        style={styles.impressionDescription}
        numberOfLines={expanded ? undefined : 3}
      >
        {impression.description}
      </Text>
      <Text style={styles.impressionDate}>
        {formatDateTime(impression.dateTime)}
      </Text>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  impressionCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  impressionDescription: {
    fontSize: 16,
    color: "#2c3e50",
    lineHeight: 22,
    marginBottom: 10,
  },
  impressionDate: {
    fontSize: 14,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  noImpressionText: {
    fontSize: 16,
    color: "#95a5a6",
    fontStyle: "italic",
    textAlign: "center",
  },
});
