import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Card, Text } from "react-native-paper";
import {
  getLatestResume,
  getLatestJobDescription,
  analyzeApplication,
  generateCoverLetter,
} from "../services/ApplicationService";

type AnalyzeScreenProps = {
  navigation: {
    navigate: (screen: string, params?: unknown) => void;
  };
};

export default function AnalyseResumeScreen({ navigation }: AnalyzeScreenProps) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [error, setError] = useState("");
  const [analysisId, setAnalysisId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        try {
          setLoadingData(true);
          setError("");

          const [resumeData, jobData] = await Promise.all([
            getLatestResume(),
            getLatestJobDescription(),
          ]);

          if (!isActive) return;

          setResumeText(resumeData?.content || "");
          setJobDescription(jobData?.job_description || "");
          setAnalysisId(jobData?.id ?? null);

          if (!resumeData?.content || !jobData?.job_description) {
            setError("Missing data. Please save resume and job description first.");
          }
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

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Missing data. Please save resume and job description first.");
      return;
    }

    try {
      setLoadingAnalyze(true);
      setError("");

      const analysis = await analyzeApplication({
        resume: resumeText,
        jobDescription,
        analysisId,
      });

      let coverLetter = "";
      try {
        const coverLetterData = await generateCoverLetter({
          resume: resumeText,
          jobDescription,
          tone: "professional",
          analysisId,
        });
        coverLetter = coverLetterData?.cover_letter || "";
      } catch {
        coverLetter = "";
      }

      navigation.navigate("Results", {
        analysis,
        coverLetter,
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(
        err?.response?.data?.message || err?.message || "Analysis failed. Please try again."
      );
      console.error(err);
    } finally {
      setLoadingAnalyze(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Analyze Resume</Text>
          <Text style={styles.subtitle}>
            Data is loaded automatically from your saved database records.
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Latest Resume</Text>
              <Text style={styles.previewText}>
                {resumeText ? resumeText.slice(0, 400) + "..." : "No resume found."}
              </Text>

              <Text style={styles.cardTitle}>Latest Job Description</Text>
              <Text style={styles.previewText}>
                {jobDescription
                  ? jobDescription.slice(0, 400) + "..."
                  : "No job description found."}
              </Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                mode="contained"
                style={styles.button}
                textColor="#D9A883"
                onPress={handleAnalyze}
                disabled={loadingData || loadingAnalyze || !resumeText || !jobDescription}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5EDE3" },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: "600", color: "#343434", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#956643", lineHeight: 22, marginBottom: 24 },
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
  previewText: {
    fontSize: 14,
    color: "#343434",
    lineHeight: 22,
    marginBottom: 8,
  },
  button: { backgroundColor: "#623528", borderRadius: 8, marginTop: 12 },
  errorText: { color: "#B00020", marginTop: 8 },
});