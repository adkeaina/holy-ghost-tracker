import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SpiritualImpression, ImpressionCategory } from "../types";
import {
  getImpressions,
  updateImpression,
  deleteImpression,
} from "../utils/storage";
import NewImpressionForm from "../components/NewImpressionForm";
import Impression from "../components/Impression";

export default function AllImpressionsScreen() {
  const [impressions, setImpressions] = useState<SpiritualImpression[]>([]);
  const [selectedImpression, setSelectedImpression] =
    useState<SpiritualImpression | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedImpression, setExpandedImpression] =
    useState<SpiritualImpression | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadImpressions();
    }, [])
  );

  const loadImpressions = async () => {
    try {
      const allImpressions = await getImpressions();
      // Sort by dateTime, most recent first
      const sorted = allImpressions.sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      );
      setImpressions(sorted);
    } catch (error) {
      console.error("Error loading impressions:", error);
    }
  };

  const handleImpressionPress = (impression: SpiritualImpression) => {
    if (expandedImpression?.id === impression.id) {
      setExpandedImpression(null);
    } else {
      setExpandedImpression(impression);
    }
  };

  const handleImpressionLongPress = (impression: SpiritualImpression) => {
    setSelectedImpression(impression);
    setModalVisible(true);
  };

  const handleUpdate = async (data: {
    description: string;
    dateTime: string;
    categories: number[];
  }) => {
    if (!selectedImpression) return;

    try {
      await updateImpression(selectedImpression.id, {
        description: data.description,
        dateTime: data.dateTime,
        categories: data.categories,
      });

      setModalVisible(false);
      await loadImpressions();
      Alert.alert("Success", "Impression updated successfully!");
    } catch (error) {
      console.error("Error updating impression:", error);
      Alert.alert("Error", "Failed to update impression. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!selectedImpression) return;

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
              await deleteImpression(selectedImpression.id);
              setModalVisible(false);
              await loadImpressions();
              Alert.alert("Success", "Impression deleted successfully.");
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

  const closeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(false);
    setSelectedImpression(null);
  };

  const renderImpression = ({ item }: { item: SpiritualImpression }) => (
    <View style={styles.impressionContainer}>
      <Impression
        impression={item}
        onPress={handleImpressionPress}
        onLongPress={handleImpressionLongPress}
        expanded={expandedImpression?.id === item.id}
        activeOpacity={0.2}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>All Impressions 🕊️</Text>
        <Text style={styles.subtitle}>
          {impressions.length} spiritual impression
          {impressions.length !== 1 ? "s" : ""}
        </Text>
      </View>
      {impressions.length > 0 ? (
        <FlatList
          data={impressions}
          keyExtractor={(item) => item.id}
          renderItem={renderImpression}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No spiritual impressions yet</Text>
          <Text style={styles.emptySubtext}>
            Start tracking your spiritual experiences from the Home tab
          </Text>
        </View>
      )}
      {/* Edit Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
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
              {/* Close X button */}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {/* Delete button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Ionicons name='trash-outline' size={20} color='red' />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Edit Impression</Text>

              {selectedImpression && (
                <NewImpressionForm
                  isEdit={true}
                  initialDescription={selectedImpression.description}
                  initialDateTime={selectedImpression.dateTime}
                  initialCategories={selectedImpression.categories}
                  onUpdate={handleUpdate}
                  onSuccess={() => {}}
                />
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
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
    color: "#95a5a6",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#bdc3c7",
    textAlign: "center",
    lineHeight: 22,
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
  modalTitle: {
    fontSize: 28,
    backgroundColor: "white",
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 13,
    right: 15,
    zIndex: 1,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "7f8c8d",
    fontWeight: "bold",
  },
  deleteButton: {
    position: "absolute",
    top: 86,
    right: 15,
    zIndex: 1,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
