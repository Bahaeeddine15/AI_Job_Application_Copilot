import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Divider, Text } from "react-native-paper";

type AnalysisResult = {
  match_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
};

type ResultsRouteParams = {
  analysis?: AnalysisResult;
  coverLetter?: string;
};

type ResultsScreenProps = {
  route: {
    params?: ResultsRouteParams;
  };
};

export default function ResultsScreen({ route }: ResultsScreenProps) {
  const analysis = route?.params?.analysis || {};
  const coverLetter = route?.params?.coverLetter || "";

  const matchScore = Number(analysis?.match_score || 0);
  const matchedSkills: string[] = analysis?.matched_skills || [];
  const missingSkills: string[] = analysis?.missing_skills || [];

  const percentage = Math.round(matchScore * 100);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Results</Text>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Match Score</Text>
              <Text style={styles.score}>{percentage}%</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Matched Skills</Text>
              {matchedSkills.length ? (
                matchedSkills.map((skill: string, i: number) => (
                  <Text key={i} style={styles.itemText}>
                    • {skill}
                  </Text>
                ))
              ) : (
                <Text style={styles.emptyText}>No matched skills found.</Text>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Missing Skills</Text>
              {missingSkills.length ? (
                missingSkills.map((skill: string, i: number) => (
                  <Text key={i} style={styles.itemText}>
                    • {skill}
                  </Text>
                ))
              ) : (
                <Text style={styles.emptyText}>No missing skills found.</Text>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Generated Cover Letter</Text>
              <Divider style={styles.divider} />
              <Text style={styles.coverLetter}>
                {coverLetter || "No cover letter generated yet."}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
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
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9A883",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#343434",
    marginBottom: 10,
  },
  score: {
    fontSize: 42,
    fontWeight: "700",
    color: "#623528",
  },
  itemText: {
    fontSize: 14,
    color: "#343434",
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    color: "#956643",
  },
  divider: {
    marginBottom: 12,
    backgroundColor: "#D9A883",
  },
  coverLetter: {
    fontSize: 14,
    color: "#343434",
    lineHeight: 24,
  },
});