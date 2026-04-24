// src/components/resume-wizard/StepIndicator.tsx
import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { useResumeWizard } from "../../context/ResumeWizardContext";
import { styles } from "./wizardStyles";

export default function StepIndicator() {
  const { step } = useResumeWizard();
  const labels = ["Info", "Education", "Experience", "Projects", "Skills", "Optional"];

  return (
    <View style={styles.stepRow}>
      {labels.map((label, index) => (
        <View key={label} style={styles.stepItem}>
          <View style={[styles.stepDot, step >= index && styles.stepDotActive]} />
          <Text style={styles.stepLabel}>{label}</Text>
        </View>
      ))}
    </View>
  );
}