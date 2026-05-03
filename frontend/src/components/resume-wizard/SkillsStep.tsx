// SkillsStep.tsx
import React from "react";
import { View } from "react-native";
import { Button, Card, Divider, Text, TextInput } from "react-native-paper";
import { useResumeWizard } from "../../context/ResumeWizardContext";
import { LanguageItem } from "../../types/resume";
import { inputAppearance, styles } from "./wizardStyles";

export default function SkillsStep() {
  const { form, setForm } = useResumeWizard();

  const updateLanguage = (index: number, field: keyof LanguageItem, value: string) => {
    setForm((prev) => {
      const next = [...prev.languages];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, languages: next };
    });
  };

  const addLanguage = () => {
    setForm((prev) => ({
      ...prev,
      languages: [...prev.languages, { name: "", level: "" }],
    }));
  };

  const removeLanguage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      languages:
        prev.languages.length > 1 ? prev.languages.filter((_, i) => i !== index) : prev.languages,
    }));
  };

  const updateStringList = (section: "hard_skills" | "soft_skills", index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev[section]];
      next[index] = value;
      return { ...prev, [section]: next };
    });
  };

  const addStringItem = (section: "hard_skills" | "soft_skills") => {
    setForm((prev) => ({
      ...prev,
      [section]: [...prev[section], ""],
    }));
  };

  const removeStringItem = (section: "hard_skills" | "soft_skills", index: number) => {
    setForm((prev) => ({
      ...prev,
      [section]:
        prev[section].length > 1 ? prev[section].filter((_, i) => i !== index) : prev[section],
    }));
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Languages</Text>
        <View style={styles.sectionHeader}>
          <View />
          <Button mode="text" onPress={addLanguage}>
            Add
          </Button>
        </View>

        {form.languages.map((item, index) => (
          <View key={`language-${index}`} style={styles.block}>
            <TextInput mode="outlined" label="Language *" value={item.name} onChangeText={(t) => updateLanguage(index, "name", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Level *" value={item.level} onChangeText={(t) => updateLanguage(index, "level", t)} style={styles.input} {...inputAppearance} />
            <Button mode="text" onPress={() => removeLanguage(index)} disabled={form.languages.length === 1}>
              Remove
            </Button>
            {index < form.languages.length - 1 ? <Divider style={styles.divider} /> : null}
          </View>
        ))}

        <Divider style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hard skills</Text>
          <Button mode="text" onPress={() => addStringItem("hard_skills")}>
            Add
          </Button>
        </View>

        {form.hard_skills.map((skill, index) => (
          <View key={`hard-${index}`} style={styles.block}>
            <TextInput mode="outlined" label={`Hard skill ${index + 1} *`} value={skill} onChangeText={(t) => updateStringList("hard_skills", index, t)} style={styles.input} {...inputAppearance} />
            <Button mode="text" onPress={() => removeStringItem("hard_skills", index)} disabled={form.hard_skills.length === 1}>
              Remove
            </Button>
          </View>
        ))}

        <Divider style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Soft skills</Text>
          <Button mode="text" onPress={() => addStringItem("soft_skills")}>
            Add
          </Button>
        </View>

        {form.soft_skills.map((skill, index) => (
          <View key={`soft-${index}`} style={styles.block}>
            <TextInput mode="outlined" label={`Soft skill ${index + 1} *`} value={skill} onChangeText={(t) => updateStringList("soft_skills", index, t)} style={styles.input} {...inputAppearance} />
            <Button mode="text" onPress={() => removeStringItem("soft_skills", index)} disabled={form.soft_skills.length === 1}>
              Remove
            </Button>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}