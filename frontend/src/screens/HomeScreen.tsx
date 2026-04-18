import React from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const ACTIONS = [
  {
    id: "UploadResume",
    title: "Upload your resume",
    description:
      "Add your CV so we can extract your skills, experience, and strengths.",
    cta: "Upload CV",
    icon: "file-upload-outline",
  },
  {
    id: "JobDescription",
    title: "Job description",
    description:
      "Paste the job posting to tailor the analysis to the role you want.",
    cta: "Add job post",
    icon: "briefcase-outline",
  },
  {
    id: "AnalyzeResume",
    title: "Analyze resume",
    description:
      "Get a match score, gap analysis, and targeted suggestions to improve your application.",
    cta: "Start analysis",
    icon: "chart-box-outline",
  },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Hi, Nassima.</Text>
          <Text style={styles.subtitle}>Welcome to your job assistant</Text>
          <Text style={styles.description}>
            Let’s move your job search forward today.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Ready to begin?</Text>
          <Text style={styles.heroTitle}>Build a stronger application</Text>
          <Text style={styles.heroText}>
            Upload your resume, add the target job description, and get tailored
            feedback to improve your chances.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your workspace</Text>
        </View>

        <View style={styles.actionsContainer}>
          {ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={() => navigation.navigate(action.id)}
              activeOpacity={0.88}
            >
              <View style={styles.card}>
                <View style={styles.cardIconContainer}>
                  <MaterialCommunityIcons
                  name={action.icon}
                  size={26}
                  color="#623528"
                  style={styles.cardIcon}
                />
                <Text style={styles.cardTitle}>{action.title}</Text>

                </View>
                
                <Text style={styles.cardDescription}>{action.description}</Text>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{action.cta}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipTitle}>Quick note</Text>
          <Text style={styles.tipText}>
            The more closely your resume matches a specific job description, the
            more useful the analysis will be.
          </Text>
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
    paddingBottom: 48,
    flexGrow: 1,
    minHeight: "100%",
  },

  welcomeSection: {
    marginBottom: 28,
    marginTop: 8,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "600",
    color: "#343434",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: "#343434",
    fontWeight: "500",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#956643",
    fontWeight: "400",
    lineHeight: 24,
    maxWidth: "95%",
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#D9A883",
    marginBottom: 28,
  },
  heroLabel: {
    fontSize: 12,
    color: "#A98062",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#343434",
    marginBottom: 10,
  },
  heroText: {
    fontSize: 14,
    color: "#956643",
    lineHeight: 22,
  },

  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#343434",
  },

  actionsContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D9A883",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#343434",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#956643",
    lineHeight: 22,
    marginBottom: 16,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#623528",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D9A883",
    letterSpacing: 0.3,
  },

  tip: {
    backgroundColor: "#F0E0CE",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D9A883",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#623528",
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: "#623528",
    lineHeight: 20,
  },
  
cardIconContainer: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  
  },
});