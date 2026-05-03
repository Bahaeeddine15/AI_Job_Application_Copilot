import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text } from "react-native-paper";
import { ResumeWizardProvider, useResumeWizard } from "../context/ResumeWizardContext";
import StepIndicator from "../components/resume-wizard/StepIndicator";
import PersonalStep from "../components/resume-wizard/PersonalStep";
import EducationStep from "../components/resume-wizard/EducationStep";
import ExperienceStep from "../components/resume-wizard/ExperienceStep";
import ProjectsStep from "../components/resume-wizard/ProjectsStep";
import SkillsStep from "../components/resume-wizard/SkillsStep";
import OptionalStep from "../components/resume-wizard/OptionalStep";
import { styles } from "../components/resume-wizard/wizardStyles";
import { ResumeFormState } from "../types/resume";
import { buildResumeSavePayload } from "../utils/resumePayload";
import { saveResume } from "../services/ResumeService";
import { updateUserProfile } from "../services/AuthService";

function isFilled(value: string) {
  return value.trim().length > 0;
}

function allObjectFieldsFilled(items: Array<Record<string, string>>) {
  if (items.length === 0) return false;
  return items.every((item) => Object.values(item).every((value) => isFilled(value)));
}

function allStringsFilled(items: string[]) {
  if (items.length === 0) return false;
  return items.every((value) => isFilled(value));
}

function allProjectsFilled(items: Array<{ title: string; description: string; technologies: string }>) {
  if (items.length === 0) return true;
  const hasAnyData = items.some(
    (p) => isFilled(p.title) || isFilled(p.description) || isFilled(p.technologies)
  );
  if (!hasAnyData) return true;
  return items.every(
    (p) => isFilled(p.title) && isFilled(p.description) && isFilled(p.technologies)
  );
}

function isStepValid(step: number, form: ResumeFormState) {
  if (step === 0) {
    return (
      isFilled(form.professional_email) &&
      isFilled(form.phone_number) &&
      isFilled(form.linkedin_url)
    );
  }

  if (step === 1) return allObjectFieldsFilled(form.education as Array<Record<string, string>>);
  if (step === 2) return allObjectFieldsFilled(form.experience as Array<Record<string, string>>);

  if (step === 3) {
    return allProjectsFilled(form.personal_projects) && allProjectsFilled(form.academic_projects);
  }

  if (step === 4) {
    const languagesOk = allObjectFieldsFilled(form.languages as Array<Record<string, string>>);
    const hardOk = allStringsFilled(form.hard_skills);
    const softOk = allStringsFilled(form.soft_skills);
    return languagesOk && hardOk && softOk;
  }

  return true; // optional page
}

function WizardContent() {
  const { step, nextStep, previousStep, form } = useResumeWizard();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const handleNext = () => {
    if (!isStepValid(step, form)) {
      setError("Please complete all required fields on this step before continuing.");
      return;
    }
    setError("");
    setSuccess("");
    nextStep();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!isStepValid(0, form) || !isStepValid(1, form) || !isStepValid(2, form) || !isStepValid(4, form)) {
        setError("Please complete all required fields before saving.");
        return;
      }

      const profilePayload = {
        professional_email: form.professional_email,
        phone_number: form.phone_number,
        linkedin_url: form.linkedin_url,
        country: form.country,
        city: form.city,
      };

      const resumePayload = buildResumeSavePayload(form);

      await Promise.all([
        updateUserProfile(profilePayload),
        saveResume(resumePayload),
      ]);

      setSuccess("Resume saved successfully.");
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.response?.data?.message || "Failed to save resume.");
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    if (step === 0) return <PersonalStep />;
    if (step === 1) return <EducationStep />;
    if (step === 2) return <ExperienceStep />;
    if (step === 3) return <ProjectsStep />;
    if (step === 4) return <SkillsStep />;
    return <OptionalStep />;
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>My Structured Resume</Text>
          <Text style={styles.subtitle}>
            Complete each step and move forward without losing your data.
          </Text>

          <StepIndicator />
          {renderStep()}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <View style={styles.footer}>
            <Button
              mode="outlined"
              style={styles.secondaryButton}
              labelStyle={styles.secondaryButtonLabel}
              textColor="#2A150D"
              onPress={previousStep}
              disabled={step === 0 || saving}
            >
              Previous
            </Button>

            {step < 5 ? (
              <Button
                mode="contained"
                style={styles.primaryButton}
                buttonColor="#623528"
                onPress={handleNext}
                disabled={saving}
              >
                Next
              </Button>
            ) : (
              <Button
                mode="contained"
                style={styles.primaryButton}
                buttonColor="#623528"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
              >
                Save
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function UploadResumeScreen() {
  return (
    <ResumeWizardProvider>
      <WizardContent />
    </ResumeWizardProvider>
  );
}