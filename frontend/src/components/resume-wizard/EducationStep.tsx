// EducationStep.tsx
import React from "react";
import { View } from "react-native";
import { Button, Card, Divider, Text, TextInput } from "react-native-paper";
import { useResumeWizard } from "../../context/ResumeWizardContext";
import { EducationItem } from "../../types/resume";
import { inputAppearance, styles } from "./wizardStyles";

export default function EducationStep() {
  const { form, setForm } = useResumeWizard();

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    setForm((prev) => {
      const next = [...prev.education];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, education: next };
    });
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: "",
          degree: "",
          field: "",
          start_date: "",
          end_date: "",
          description: "",
        },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setForm((prev) => ({
      ...prev,
      education:
        prev.education.length > 1 ? prev.education.filter((_, i) => i !== index) : prev.education,
    }));
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Education</Text>
          <Button mode="text" onPress={addEducation}>
            Add
          </Button>
        </View>

        {form.education.map((item, index) => (
          <View key={`education-${index}`} style={styles.block}>
            <TextInput mode="outlined" label="Institution *" value={item.institution} onChangeText={(t) => updateEducation(index, "institution", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Diplôme *" value={item.degree} onChangeText={(t) => updateEducation(index, "degree", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Domaine *" value={item.field} onChangeText={(t) => updateEducation(index, "field", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Date début *" value={item.start_date} onChangeText={(t) => updateEducation(index, "start_date", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Date fin *" value={item.end_date} onChangeText={(t) => updateEducation(index, "end_date", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Description *" value={item.description} onChangeText={(t) => updateEducation(index, "description", t)} style={styles.textArea} multiline {...inputAppearance} />

            <Button mode="text" onPress={() => removeEducation(index)} disabled={form.education.length === 1}>
              Remove
            </Button>

            {index < form.education.length - 1 ? <Divider style={styles.divider} /> : null}
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}