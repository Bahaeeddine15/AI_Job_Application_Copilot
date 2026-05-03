// ExperienceStep.tsx
import React from "react";
import { View } from "react-native";
import { Button, Card, Divider, Text, TextInput } from "react-native-paper";
import { useResumeWizard } from "../../context/ResumeWizardContext";
import { ExperienceItem } from "../../types/resume";
import { inputAppearance, styles } from "./wizardStyles";

export default function ExperienceStep() {
  const { form, setForm } = useResumeWizard();

  const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    setForm((prev) => {
      const next = [...prev.experience];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, experience: next };
    });
  };

  const addExperience = () => {
    setForm((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: "",
          company: "",
          location: "",
          start_date: "",
          end_date: "",
          description: "",
        },
      ],
    }));
  };

  const removeExperience = (index: number) => {
    setForm((prev) => ({
      ...prev,
      experience:
        prev.experience.length > 1 ? prev.experience.filter((_, i) => i !== index) : prev.experience,
    }));
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <Button mode="text" onPress={addExperience}>
            Add
          </Button>
        </View>

        {form.experience.map((item, index) => (
          <View key={`experience-${index}`} style={styles.block}>
            <TextInput mode="outlined" label="Poste *" value={item.title} onChangeText={(t) => updateExperience(index, "title", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Entreprise *" value={item.company} onChangeText={(t) => updateExperience(index, "company", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Localisation *" value={item.location} onChangeText={(t) => updateExperience(index, "location", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Date début *" value={item.start_date} onChangeText={(t) => updateExperience(index, "start_date", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Date fin *" value={item.end_date} onChangeText={(t) => updateExperience(index, "end_date", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Description *" value={item.description} onChangeText={(t) => updateExperience(index, "description", t)} style={styles.textArea} multiline {...inputAppearance} />

            <Button mode="text" onPress={() => removeExperience(index)} disabled={form.experience.length === 1}>
              Remove
            </Button>

            {index < form.experience.length - 1 ? <Divider style={styles.divider} /> : null}
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}