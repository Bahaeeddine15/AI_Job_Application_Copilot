import React, { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Card, Modal, Portal, Text } from "react-native-paper";

import {
  getLatestJobDescription,
  analyzeApplication,
} from "../services/ApplicationService";

import { getAllResumes } from "../services/ResumeService";

type AnalyzeScreenProps = {
  navigation: {
    navigate: (screen: string, params?: unknown) => void;
  };
};

type ResumeListItem = {
  id: number;
  title?: string;
  is_active?: boolean;
};

function unwrapApiData(payload: any) {
  return payload?.data ?? payload;
}

function normalizeResumes(payload: any): ResumeListItem[] {
  const data = unwrapApiData(payload);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.resumes)) return data.resumes;

  return [];
}

function truncateText(text: string, maxLength = 400) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

export default function AnalyseResumeScreen({ navigation }: AnalyzeScreenProps) {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);

  const [jobDescription, setJobDescription] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [error, setError] = useState("");

  const [resumeModalVisible, setResumeModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        try {
          setLoadingData(true);
          setError("");

          const [resumesResponse, jobData] = await Promise.all([
            getAllResumes(),
            getLatestJobDescription(),
          ]);

          if (!isActive) return;

          const resumesList = normalizeResumes(resumesResponse);
          const latestJob = unwrapApiData(jobData);

          setResumes(resumesList);

          const activeResume =
            resumesList.find((resume) => resume.is_active) || resumesList[0];

          setSelectedResumeId(activeResume?.id ?? null);
          setJobDescription(latestJob?.job_description || "");
        } catch (e: unknown) {
          if (!isActive) return;

          const err = e as {
            response?: { data?: { message?: string } };
            message?: string;
          };

          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load data from database."
          );
        } finally {
          if (isActive) setLoadingData(false);
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const selectedResume = resumes.find(
    (resume) => resume.id === selectedResumeId
  );

  const handleAnalyze = async () => {
    if (!selectedResumeId || !jobDescription.trim()) {
      setError("Please select a resume and save a job description first.");
      return;
    }

    try {
      setLoadingAnalyze(true);
      setError("");

      const analysis = await analyzeApplication({
        resumeId: selectedResumeId,
      });

      navigation.navigate("Results", {
        analysis,
        coverLetter: analysis?.cover_letter || "",
      });
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Analysis failed. Please try again."
      );

      console.error(err);
    } finally {
      setLoadingAnalyze(false);
    }
  };

  return (
    <View style={Platform.OS === "web" ? styles.webPage : styles.mobilePage}>
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.title}>Analyze Resume</Text>

            <Text style={styles.subtitle}>
              Select the resume you want to use, then generate a tailored
              analysis based on your saved job description.
            </Text>

            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>Select Resume</Text>

                {resumes.length ? (
                  <>
                    <Pressable
                      style={styles.selectBox}
                      onPress={() => setResumeModalVisible(true)}
                    >
                      <View style={styles.selectTextWrapper}>
                        <Text style={styles.selectLabel}>Selected resume</Text>

                        <Text style={styles.selectValue}>
                          {selectedResume?.title || "Choose a resume"}
                        </Text>

                        {selectedResume?.is_active ? (
                          <Text style={styles.activeText}>Active resume</Text>
                        ) : null}
                      </View>

                      <Text style={styles.chevron}>⌄</Text>
                    </Pressable>

                    <Portal>
                      <Modal
                        visible={resumeModalVisible}
                        onDismiss={() => setResumeModalVisible(false)}
                        contentContainerStyle={styles.modalBox}
                      >
                        <Text style={styles.modalTitle}>Choose Resume</Text>

                        <ScrollView style={styles.modalList}>
                          {resumes.map((resume) => {
                            const selected = selectedResumeId === resume.id;

                            return (
                              <Pressable
                                key={resume.id}
                                style={[
                                  styles.modalOption,
                                  selected && styles.modalOptionSelected,
                                ]}
                                onPress={() => {
                                  setSelectedResumeId(resume.id);
                                  setResumeModalVisible(false);
                                }}
                              >
                                <View style={styles.modalOptionContent}>
                                  <Text
                                    style={[
                                      styles.modalOptionTitle,
                                      selected &&
                                        styles.modalOptionTitleSelected,
                                    ]}
                                  >
                                    {resume.title || `Resume #${resume.id}`}
                                  </Text>

                                  {resume.is_active ? (
                                    <Text style={styles.modalActiveText}>
                                      Active resume
                                    </Text>
                                  ) : null}
                                </View>

                                {selected ? (
                                  <Text style={styles.checkMark}>✓</Text>
                                ) : null}
                              </Pressable>
                            );
                          })}
                        </ScrollView>

                        <Button
                          mode="text"
                          textColor="#623528"
                          onPress={() => setResumeModalVisible(false)}
                        >
                          Cancel
                        </Button>
                      </Modal>
                    </Portal>
                  </>
                ) : (
                  <Text style={styles.previewText}>
                    No resume found. Please upload a resume first.
                  </Text>
                )}

                <Text style={styles.cardTitle}>Latest Job Description</Text>

                <Text style={styles.previewText}>
                  {jobDescription
                    ? truncateText(jobDescription, 400)
                    : "No job description found."}
                </Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Button
                  mode="contained"
                  style={styles.button}
                  textColor="#D9A883"
                  onPress={handleAnalyze}
                  disabled={
                    loadingData ||
                    loadingAnalyze ||
                    !selectedResumeId ||
                    !jobDescription
                  }
                >
                  {loadingData
                    ? "Loading data..."
                    : loadingAnalyze
                    ? "Analyzing..."
                    : "Generate Results"}
                </Button>
              </Card.Content>
            </Card>
          </View>
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
    fontSize: 18,
    fontWeight: "600",
    color: "#343434",
    marginTop: 10,
    marginBottom: 10,
  },

  selectBox: {
    borderWidth: 1,
    borderColor: "#D9A883",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectTextWrapper: {
    flex: 1,
  },

  selectLabel: {
    fontSize: 12,
    color: "#956643",
    marginBottom: 4,
  },

  selectValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#343434",
  },

  activeText: {
    fontSize: 12,
    color: "#956643",
    marginTop: 4,
  },

  chevron: {
    fontSize: 26,
    color: "#623528",
    marginLeft: 12,
  },

  modalBox: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    borderRadius: 18,
    padding: 20,
    maxHeight: "70%",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#343434",
    marginBottom: 16,
  },

  modalList: {
    marginBottom: 12,
  },

  modalOption: {
    borderWidth: 1,
    borderColor: "#D9A883",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalOptionSelected: {
    borderColor: "#623528",
    backgroundColor: "#F5EDE3",
  },

  modalOptionContent: {
    flex: 1,
  },

  modalOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#343434",
  },

  modalOptionTitleSelected: {
    color: "#623528",
  },

  modalActiveText: {
    fontSize: 12,
    color: "#956643",
    marginTop: 4,
  },

  checkMark: {
    fontSize: 22,
    fontWeight: "700",
    color: "#623528",
    marginLeft: 12,
  },

  previewText: {
    fontSize: 14,
    color: "#343434",
    lineHeight: 22,
    marginBottom: 8,
  },

  button: {
    backgroundColor: "#623528",
    borderRadius: 8,
    marginTop: 12,
  },

  errorText: {
    color: "#B00020",
    marginTop: 8,
    marginBottom: 8,
  },
});