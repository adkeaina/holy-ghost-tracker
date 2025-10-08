import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Keyboard,
} from "react-native";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import { saveImpression } from "../utils/storage";
import { ImpressionCategory } from "../types";
import CategoryList from "./CategoryList";
import GlassyCard from "./GlassyCard";
import { useTheme } from "../theme";

interface NewImpressionFormProps {
  onSuccess?: () => void;
  initialDescription?: string;
  initialDateTime?: string;
  initialCategories?: number[];
  isEdit?: boolean;
  impressionId?: string;
  onUpdate?: (data: {
    description: string;
    dateTime: string;
    categories: number[];
  }) => void;
  onDescriptionFocus?: () => void;
}

export default function NewImpressionForm({
  onSuccess,
  initialDescription = "",
  initialDateTime,
  initialCategories = [],
  isEdit = false,
  impressionId,
  onUpdate,
  onDescriptionFocus,
}: NewImpressionFormProps) {
  const [description, setDescription] = useState(initialDescription);
  const [selectedDate, setSelectedDate] = useState(
    initialDateTime ? new Date(initialDateTime) : new Date()
  );
  const [selectedCategories, setSelectedCategories] =
    useState<number[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  // Set default date/time to current date/time for new impressions
  useEffect(() => {
    if (!isEdit) {
      setSelectedDate(new Date());
    }
  }, [isEdit]);

  const handleDateTimeChange = (event: any, dateTime?: Date) => {
    if (dateTime) {
      const now = new Date();

      // Don't allow future dates/times
      if (dateTime <= now) {
        setSelectedDate(dateTime);
      }
    }
  };

  const setToCurrentDateTime = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(new Date());
  };

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!description.trim()) {
      Alert.alert(
        "Error",
        "Please enter a description of your spiritual impression."
      );
      return;
    }

    // Prevent saving future dates/times
    if (selectedDate > new Date()) {
      Alert.alert(
        "Error",
        "Cannot record an impression for a future date or time."
      );
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit && onUpdate) {
        // Handle update
        await onUpdate({
          description: description.trim(),
          dateTime: selectedDate.toISOString(),
          categories: selectedCategories,
        });
      } else {
        // Handle new impression
        await saveImpression({
          description: description.trim(),
          dateTime: selectedDate.toISOString(),
          categories: selectedCategories,
        });

        setDescription("");
        setSelectedDate(new Date());
        setSelectedCategories([]);
        Alert.alert("Success", "Spiritual impression saved successfully!");
      }

      if (onSuccess) {
        onSuccess();
        // Unfocus the description input
        if (onDescriptionFocus) {
          Keyboard.dismiss();
        }
      }
    } catch (error) {
      console.error("Error saving impression:", error);
      Alert.alert("Error", "Failed to save impression. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassyCard style={styles.form}>
      <View style={styles.formContent}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Date & Time
          </Text>
          <View style={styles.dateTimeContainer}>
            <DateTimePicker
              testID='dateTimePicker'
              value={selectedDate}
              mode='datetime'
              display='default'
              maximumDate={new Date()}
              onChange={handleDateTimeChange}
              style={styles.picker}
            />
            {Math.abs(selectedDate.getTime() - new Date().getTime()) > 60000 &&
              !initialDateTime && (
                <TouchableOpacity
                  style={[
                    styles.nowButton,
                    { borderColor: theme.colors.border },
                  ]}
                  onPress={setToCurrentDateTime}
                >
                  <Text
                    style={[
                      styles.nowButtonText,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    Now
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Description
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: theme.colors.border,
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            onFocus={onDescriptionFocus}
            placeholder='Describe your spiritual impression...'
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical='top'
          />
        </View>

        <CategoryList
          readonly={false}
          selectedCategories={selectedCategories}
          onSelectionChange={setSelectedCategories}
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.success },
            isLoading && { backgroundColor: theme.colors.textMuted },
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: theme.colors.buttonText },
            ]}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {isLoading ? "Saving..." : isEdit ? "Update" : "Save Impression"}
          </Text>
        </TouchableOpacity>
      </View>
    </GlassyCard>
  );
}

const styles = StyleSheet.create({
  form: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  formContent: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 15,
  },
  picker: {
    alignSelf: "flex-start",
    marginVertical: 5,
  },
  nowButton: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  nowButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
  },
  submitButton: {
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 0,
  },
  submitButtonSecondary: {
    backgroundColor: "#27ae60",
  },
  submitButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
