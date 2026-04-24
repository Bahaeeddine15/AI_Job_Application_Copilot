// ProjectsStep.tsx
import React from "react";
import { View } from "react-native";
import { Button, Card, Divider, Text, TextInput } from "react-native-paper";
import { useResumeWizard } from "../../context/ResumeWizardContext";
import { ProjectItem } from "../../types/resume";
import { inputAppearance, styles } from "./wizardStyles";

export default function ProjectsStep() {
  const { form, setForm } = useResumeWizard();

  const updateProject = (
    section: "personal_projects" | "academic_projects",
    index: number,
    field: keyof ProjectItem,
    value: string
  ) => {
    setForm((prev) => {
      const next = [...prev[section]];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, [section]: next };
    });
  };

  const addProject = (section: "personal_projects" | "academic_projects") => {
    setForm((prev) => ({
      ...prev,
      [section]: [...prev[section], { title: "", description: "", technologies: "" }],
    }));
  };

  const removeProject = (section: "personal_projects" | "academic_projects", index: number) => {
    setForm((prev) => ({
      ...prev,
      [section]:
        prev[section].length > 1 ? prev[section].filter((_, i) => i !== index) : prev[section],
    }));
  };

  const renderProjectSection = (
    sectionTitle: string,
    section: "personal_projects" | "academic_projects"
  ) => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        <Button mode="text" onPress={() => addProject(section)}>
          Add
        </Button>
      </View>

      {form[section].map((item, index) => (
        <View key={section + "-" + index} style={styles.block}>
          <TextInput
            mode="outlined"
            label="Title"
            value={item.title}
            onChangeText={(t) => updateProject(section, index, "title", t)}
            style={styles.input}
            {...inputAppearance}
          />
          <TextInput
            mode="outlined"
            label="Description"
            value={item.description}
            onChangeText={(t) => updateProject(section, index, "description", t)}
            style={styles.textArea}
            multiline
            {...inputAppearance}
          />
          <TextInput
            mode="outlined"
            label="Technologies"
            value={item.technologies}
            onChangeText={(t) => updateProject(section, index, "technologies", t)}
            style={styles.input}
            {...inputAppearance}
          />
          <Button mode="text" onPress={() => removeProject(section, index)} disabled={form[section].length === 1}>
            Remove
          </Button>
          {index < form[section].length - 1 ? <Divider style={styles.divider} /> : null}
        </View>
      ))}
    </>
  );

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.subtitle}>
          Projects are optional. If you do not have projects, you can go to the next page.
        </Text>

        {renderProjectSection("Personal Projects", "personal_projects")}

        <Divider style={styles.divider} />

        {renderProjectSection("Academic Projects", "academic_projects")}
      </Card.Content>
    </Card>
  );
}