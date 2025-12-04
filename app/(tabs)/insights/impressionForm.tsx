import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SpiritualImpression } from "@/src/types";
import { useImpressions } from "@/src/context/ImpressionsContext";
import NewImpressionForm from "@/src/components/NewImpressionForm";
import { useTheme } from "@/src/theme";

export default function ImpressionForm() {
  const params = useLocalSearchParams<{ impression: string }>();
  const [impression, setImpression] = useState<SpiritualImpression | null>(
    null
  );
  const { updateImpression, deleteImpression, refreshImpressions } = useImpressions();
  const { theme } = useTheme();

  useEffect(() => {
    if (params.impression) {
      try {
        const parsed = JSON.parse(params.impression);
        setImpression(parsed);
      } catch (error) {
        console.error("Error parsing impression:", error);
        router.back();
      }
    }
  }, [params.impression]);

  const handleUpdate = async (data: {
    description: string;
    dateTime: string;
    categories: number[];
  }) => {
    if (!impression) return;

    try {
      await updateImpression(impression.id, {
        description: data.description,
        dateTime: data.dateTime,
        categories: data.categories,
      });
      await refreshImpressions();
      router.back();
    } catch (error) {
      console.error("Error updating impression:", error);
      Alert.alert("Error", "Failed to update impression. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!impression) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Delete Impression",
      "Are you sure you want to delete this spiritual impression? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteImpression(impression.id);
              await refreshImpressions();
              router.back();
            } catch (error) {
              console.error("Error deleting impression:", error);
              Alert.alert(
                "Error",
                "Failed to delete impression. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!impression) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.content}>
          {/* Combined Close and Delete button */}
          <View style={styles.combinedButtonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons
                name='trash-outline'
                size={18}
                color={theme.colors.error}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleClose}>
              <Text
                style={[
                  styles.closeButtonText,
                  { color: theme.colors.textMuted },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <NewImpressionForm
            isEdit={true}
            initialDescription={impression.description}
            initialDateTime={impression.dateTime}
            initialCategories={impression.categories}
            onUpdate={handleUpdate}
            onSuccess={() => {}}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    position: "relative",
  },
  combinedButtonContainer: {
    position: "absolute",
    top: 13,
    right: 15,
    zIndex: 1,
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
