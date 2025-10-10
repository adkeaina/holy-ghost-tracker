import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { submitFeedback } from "../utils/storage";
import GlassyCard from "./GlassyCard";
import { useTheme } from "../theme";

export default function FeedbackFAB() {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const { theme } = useTheme();

  const handleFeedbackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFeedbackModalVisible(true);
  };

  const handleFeedbackClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFeedbackModalVisible(false);
    setFeedbackText("");
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      Alert.alert(
        "Empty Feedback",
        "Please enter your feedback before submitting."
      );
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      await submitFeedback(feedbackText.trim());
      setFeedbackModalVisible(false);
      setFeedbackText("");
      Alert.alert(
        "Thank You!",
        "Your feedback has been submitted successfully."
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <>
      {/* Feedback FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleFeedbackPress}
        activeOpacity={0.8}
      >
        <MaterialIcons
          name='feedback'
          size={24}
          color={theme.colors.buttonText}
        />
      </TouchableOpacity>

      {/* Feedback Modal */}
      <Modal
        animationType='fade'
        transparent={true}
        visible={feedbackModalVisible}
        onRequestClose={handleFeedbackClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleFeedbackClose}
        >
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <GlassyCard style={styles.feedbackCard}>
                {/* Close button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleFeedbackClose}
                >
                  <Text
                    style={[
                      styles.closeButtonText,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>

                {/* Modal title */}
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Send Feedback
                </Text>

                {/* Feedback input */}
                <TextInput
                  style={[
                    styles.feedbackInput,
                    {
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  placeholder='Share your thoughts, suggestions, or report any issues...'
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical='top'
                  editable={!isSubmittingFeedback}
                />

                {/* Submit button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    {
                      backgroundColor: theme.colors.primary,
                      opacity: isSubmittingFeedback ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleFeedbackSubmit}
                  disabled={isSubmittingFeedback}
                >
                  <Text
                    style={[
                      styles.submitButtonText,
                      { color: theme.colors.buttonText },
                    ]}
                  >
                    {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                  </Text>
                </TouchableOpacity>
              </GlassyCard>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalContent: {
    backgroundColor: "transparent",
    alignItems: "stretch",
    width: "90%",
    maxWidth: 400,
  },
  feedbackCard: {
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  feedbackInput: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 120,
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
