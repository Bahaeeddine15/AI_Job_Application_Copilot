// OptionalStep.tsx
import React from "react";
import { View } from "react-native";
import { Button, Card, Divider, Text, TextInput } from "react-native-paper";
import { useResumeWizard } from "../../context/ResumeWizardContext";
import { CertificationItem } from "../../types/resume";
import { inputAppearance, styles } from "./wizardStyles";

export default function OptionalStep() {
  const { form, setForm } = useResumeWizard();

  const updateCertification = (index: number, field: keyof CertificationItem, value: string) => {
    setForm((prev) => {
      const next = [...prev.certifications];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, certifications: next };
    });
  };

  const addCertification = () => {
    setForm((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { name: "", issuer: "", issue_date: "" }],
    }));
  };

  const removeCertification = (index: number) => {
    setForm((prev) => ({
      ...prev,
      certifications:
        prev.certifications.length > 1
          ? prev.certifications.filter((_, i) => i !== index)
          : prev.certifications,
    }));
  };

  const updateHobby = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.hobbies];
      next[index] = value;
      return { ...prev, hobbies: next };
    });
  };

  const addHobby = () => {
    setForm((prev) => ({
      ...prev,
      hobbies: [...prev.hobbies, ""],
    }));
  };

  const removeHobby = (index: number) => {
    setForm((prev) => ({
      ...prev,
      hobbies: prev.hobbies.length > 1 ? prev.hobbies.filter((_, i) => i !== index) : prev.hobbies,
    }));
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hobbies</Text>
          <Button mode="text" onPress={addHobby}>
            Add
          </Button>
        </View>

        {form.hobbies.map((hobby, index) => (
          <View key={`hobby-${index}`} style={styles.block}>
            <TextInput mode="outlined" label={`Hobby ${index + 1}`} value={hobby} onChangeText={(t) => updateHobby(index, t)} style={styles.input} {...inputAppearance} />
            <Button mode="text" onPress={() => removeHobby(index)} disabled={form.hobbies.length === 1}>
              Remove
            </Button>
          </View>
        ))}

        <Divider style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <Button mode="text" onPress={addCertification}>
            Add
          </Button>
        </View>

        {form.certifications.map((item, index) => (
          <View key={`certification-${index}`} style={styles.block}>
            <TextInput mode="outlined" label="Name" value={item.name} onChangeText={(t) => updateCertification(index, "name", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Issuer" value={item.issuer} onChangeText={(t) => updateCertification(index, "issuer", t)} style={styles.input} {...inputAppearance} />
            <TextInput mode="outlined" label="Date" value={item.issue_date} onChangeText={(t) => updateCertification(index, "issue_date", t)} style={styles.input} {...inputAppearance}  />

            <Button mode="text" onPress={() => removeCertification(index)} disabled={form.certifications.length === 1}>
              Remove
            </Button>

            {index < form.certifications.length - 1 ? <Divider style={styles.divider} /> : null}
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}