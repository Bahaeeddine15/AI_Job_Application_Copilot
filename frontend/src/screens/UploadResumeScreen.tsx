import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Text } from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";

export default function UploadResumeScreen() {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
        console.log(result.assets[0]);
      }
    } catch (error) {
      console.log("Document picker error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        <Text style={styles.title}>Upload Resume</Text>
        <Text style={styles.subtitle}>
          Select your CV in PDF or Word format.
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Choose your file</Text>
            <Text style={styles.cardText}>
              Supported formats: PDF, DOC, DOCX
            </Text>

            <Button
              mode="contained"
              onPress={pickDocument}
              style={styles.button}
              textColor="#D9A883"
            >
              Choose File
            </Button>

            {selectedFile && (
              <View style={styles.fileBox}>
                <Text style={styles.fileLabel}>Selected file:</Text>
                <Text style={styles.fileName}>{selectedFile.name}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EDE3",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#343434",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#956643",
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9A883",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#343434",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#956643",
    lineHeight: 22,
    marginBottom: 18,
  },
  button: {
    backgroundColor: "#623528",
    borderRadius: 8,
    
  },
  fileBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F0E0CE",
    borderWidth: 1,
    borderColor: "#D9A883",
  },
  fileLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#623528",
    marginBottom: 4,
  },
  fileName: {
    fontSize: 14,
    color: "#343434",
  },
});