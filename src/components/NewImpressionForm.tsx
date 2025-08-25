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

interface NewImpressionFormProps {
  onSuccess?: () => void;
  initialDescription?: string;
  initialDateTime?: string;
  isEdit?: boolean;
  impressionId?: string;
  onUpdate?: (data: { description: string; dateTime: string }) => void;
  onDescriptionFocus?: () => void;
}

export default function NewImpressionForm({
  onSuccess,
  initialDescription = "",
  initialDateTime,
  isEdit = false,
  impressionId,
  onUpdate,
  onDescriptionFocus,
}: NewImpressionFormProps) {
  const [description, setDescription] = useState(initialDescription);
  const [selectedDate, setSelectedDate] = useState(
    initialDateTime ? new Date(initialDateTime) : new Date()
  );
  const [isLoading, setIsLoading] = useState(false);

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
        });
      } else {
        // Handle new impression
        await saveImpression({
          description: description.trim(),
          dateTime: selectedDate.toISOString(),
        });

        setDescription("");
        setSelectedDate(new Date());
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
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date & Time</Text>
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
                style={styles.nowButton}
                onPress={setToCurrentDateTime}
              >
                <Text style={styles.nowButtonText}>Now</Text>
              </TouchableOpacity>
            )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textInput}
          value={description}
          onChangeText={setDescription}
          onFocus={onDescriptionFocus}
          placeholder='Describe your spiritual impression...'
          multiline
          numberOfLines={4}
          textAlignVertical='top'
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text
          style={styles.submitButtonText}
          numberOfLines={1}
          ellipsizeMode='tail'
        >
          {isLoading ? "Saving..." : isEdit ? "Update" : "Save Impression"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
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
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#bdc3c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  nowButtonText: {
    color: "#7f8c8d",
    fontSize: 12,
    fontWeight: "500",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: "#27ae60",
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
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
