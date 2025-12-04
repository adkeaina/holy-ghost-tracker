import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ImpressionCategory } from "../types";

interface CategoryChipProps {
  category: ImpressionCategory;
  isSelected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

const COLOR_MAP = {
  brown: "#8B4513",
  green: "#27ae60",
  blue: "#3498db",
  purple: "#9b59b6",
  red: "#e74c3c",
  orange: "#f39c12",
  yellow: "#f1c40f",
};

function CategoryChip({
  category,
  isSelected = false,
  onPress,
  onLongPress,
  size = "medium",
  disabled = false,
}: CategoryChipProps) {
  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleLongPress = () => {
    if (!disabled && onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  };

  const backgroundColor = COLOR_MAP[category.color];
  const chipStyle: ViewStyle = {
    backgroundColor: isSelected ? backgroundColor : "transparent",
    borderColor: backgroundColor,
    borderWidth: 2,
    opacity: disabled ? 0.5 : 1,
  };

  const textStyle: TextStyle = {
    color: isSelected ? "white" : backgroundColor,
    fontWeight: isSelected ? "600" : "500",
  };

  return (
    <TouchableOpacity
      style={[styles.chip, styles[size], chipStyle]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.text, styles[`${size}Text`], textStyle]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },
  text: {
    fontSize: 14,
    textAlign: "center",
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});

// Memoize the component to prevent unnecessary re-renders
export default React.memo(CategoryChip, (prevProps, nextProps) => {
  return (
    prevProps.category.id === nextProps.category.id &&
    prevProps.category.name === nextProps.category.name &&
    prevProps.category.color === nextProps.category.color &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.size === nextProps.size &&
    prevProps.disabled === nextProps.disabled
  );
});
