
import React, { useEffect, useState } from "react";

import { ScrollView, StyleSheet, View, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, Button, Chip } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getAllResumes, downloadResumePdf  } from "../services/ResumeService";
import { ResumeFormState } from "../types/resume";



export default function DownloadResumeScreen() {
  const [resumes, setResumes] = useState<ResumeFormState[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
  loadResumes();
}, []);

const loadResumes = async () => {
  try {
    setLoading(true);

    const result = await getAllResumes();

    setResumes(result.data || []);
  } catch (error) {
    console.log("Load resumes error:", error);
  } finally {
    setLoading(false);
  }
};

  const handleDownload = async (resume: ResumeFormState) => {
  try {
    setDownloadingId(resume.id);

    await downloadResumePdf(
      resume.id,
      resume.title || "resume"
    );

    console.log("Resume downloaded:", resume.id);
  } catch (error) {
    console.log("Download error:", error);
    Alert.alert("Download failed", "Could not download the resume.");
  } finally {
    setDownloadingId(null);
  }
};

  return (
    <View style={Platform.OS === "web" ? styles.webPage : styles.mobilePage}>
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>Download resumes</Text>
          <Text style={styles.subtitle}>
            Select one of your saved resumes and download it as a document.
          </Text>
        </View>

        {resumes.map((resume) => (
          <Card key={resume.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={26}
                    color="#623528"
                  />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>
                    {resume.title || `Resume #${resume.id}`}
                    </Text>

                  <Text style={styles.cardText} numberOfLines={2}>
                    {resume.profile_summary}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.dateText}>
                  Created: {resume.created_at}
                </Text>

                {resume.is_active && (
                  <Chip
                    compact
                    style={styles.activeChip}
                    textStyle={styles.activeChipText}
                  >
                    Active
                  </Chip>
                )}
              </View>

              <Button
                mode="contained"
                onPress={() => handleDownload(resume)}
                style={styles.button}
                buttonColor="#623528"
                textColor="#D9A883"
                icon="download"
                loading={downloadingId === resume.id}
                disabled={downloadingId === resume.id}
                >
                {downloadingId === resume.id ? "Downloading..." : "Download"}
                </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webPage: {
  height: "100vh" as any,
  overflowY: "auto" as any,
  backgroundColor: "#F5EDE3",
  paddingBottom: 80,
},

mobilePage: {
  flex: 1,
  backgroundColor: "#F5EDE3",
},
  container: {
    flex: 1,
    backgroundColor: "#F5EDE3",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
    flexGrow: 1,
  },
  headerSection: {
    marginBottom: 24,
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
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9A883",
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F0E0CE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#343434",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: "#956643",
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  dateText: {
    fontSize: 13,
    color: "#A98062",
  },
  activeChip: {
    backgroundColor: "#F0E0CE",
  },
  activeChipText: {
    color: "#623528",
    fontSize: 12,
    fontWeight: "600",
  },
  button: {
    borderRadius: 8,
  },
});