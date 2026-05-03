// src/components/resume-wizard/PersonalStep.tsx
import React, { useEffect } from "react";
import { Card, Divider, Text, TextInput } from "react-native-paper";
import { useResumeWizard } from "../../context/ResumeWizardContext";
import { getUserProfile } from "../../services/AuthService";
import { inputAppearance, styles } from "./wizardStyles";

export default function PersonalStep() {
  const { form, setForm } = useResumeWizard();

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (!mounted || !profile) return;

        setForm((prev) => ({
          ...prev,
          professional_email: profile.professional_email || "",
          phone_number: profile.phone_number || "",
          linkedin_url: profile.linkedin_url || "",
          country: profile.country || "",
          city: profile.city || "",
        }));
      } catch {
        // silently ignore if profile is not available yet
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [setForm]);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <TextInput
          mode="outlined"
          label="Professional email *"
          value={form.professional_email}
          onChangeText={(text) => setForm((prev) => ({ ...prev, professional_email: text }))}
          style={styles.input}
          {...inputAppearance}
        />

        <TextInput
          mode="outlined"
          label="Phone number *"
          value={form.phone_number}
          onChangeText={(text) => setForm((prev) => ({ ...prev, phone_number: text }))}
          style={styles.input}
          {...inputAppearance}
        />

        <TextInput
          mode="outlined"
          label="LinkedIn URL *"
          value={form.linkedin_url}
          onChangeText={(text) => setForm((prev) => ({ ...prev, linkedin_url: text }))}
          style={styles.input}
          {...inputAppearance}
        />

        <TextInput
          mode="outlined"
          label="Country"
          value={form.country}
          onChangeText={(text) => setForm((prev) => ({ ...prev, country: text }))}
          style={styles.input}
          {...inputAppearance}
        />

        <TextInput
          mode="outlined"
          label="City"
          value={form.city}
          onChangeText={(text) => setForm((prev) => ({ ...prev, city: text }))}
          style={styles.input}
          {...inputAppearance}
        />

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Profile</Text>
        <TextInput
          mode="outlined"
          label="Profile summary"
          value={form.profile_summary}
          onChangeText={(text) => setForm((prev) => ({ ...prev, profile_summary: text }))}
          style={styles.textArea}
          multiline
          {...inputAppearance}
        />
      </Card.Content>
    </Card>
  );
}