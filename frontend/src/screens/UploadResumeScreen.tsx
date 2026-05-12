import React, { useEffect, useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
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
import { getLatestResume, saveResume } from "../services/ResumeService";
import { updateUserProfile } from "../services/AuthService";

function isFilled(value: string) {
  return value.trim().length > 0;
}

function allEducationFieldsFilled(items: Array<Record<string, string>>) {
  if (items.length === 0) return false;
  const required = ["institution", "degree", "field", "start_date", "end_date"];
  return items.every((item) => required.every((k) => isFilled(item[k] || "")));
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

// Validation des dates chronologiques
function hasInvalidDates(items: Array<any>, startField: string, endField: string): boolean {
  return items.some((item) => {
    const start = item[startField];
    const end = item[endField];
    if (!start || !end) return false;
    return new Date(start) >= new Date(end);
  });
}

function isStepValid(step: number, form: ResumeFormState) {
  if (step === 0) {
    return (
      isFilled(form.professional_email) &&
      isFilled(form.phone_number) &&
      isFilled(form.linkedin_url) &&
      isFilled(form.profile_summary)
    );
  }

  if (step === 1) {
    const educationValid = allEducationFieldsFilled(form.education as Array<Record<string, string>>);
    const educationDatesValid = !hasInvalidDates(form.education, "start_date", "end_date");
    return educationValid && educationDatesValid;
  }

  if (step === 2) {
    const experienceValid = allObjectFieldsFilled(form.experience as Array<Record<string, string>>);
    const experienceDatesValid = !hasInvalidDates(form.experience, "start_date", "end_date");
    return experienceValid && experienceDatesValid;
  }

  if (step === 3) {
    return allProjectsFilled(form.personal_projects) && allProjectsFilled(form.academic_projects);
  }

  if (step === 4) {
    const languagesOk = allObjectFieldsFilled(form.languages as Array<Record<string, string>>);
    const hardOk = allStringsFilled(form.hard_skills);
    const softOk = allStringsFilled(form.soft_skills);
    return languagesOk && hardOk && softOk;
  }

  return true;
}

const emptyEducation = {
  institution: "",
  degree: "",
  field: "",
  start_date: "",
  end_date: "",
  description: "",
};

const emptyExperience = {
  title: "",
  company: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
};

const emptyProject = { title: "", description: "", technologies: "" };
const emptyLanguage = { name: "", level: "" };
const emptyCertification = { name: "", issuer: "", issue_date: "" };

const toStr = (v: unknown): string => (typeof v === "string" ? v : "");

const mapEducation = (items: unknown) => {
  if (!Array.isArray(items) || items.length === 0) return [emptyEducation];
  return items.map((i: any) => ({
    institution: toStr(i?.institution),
    degree: toStr(i?.degree),
    field: toStr(i?.field),
    start_date: toStr(i?.start_date),
    end_date: toStr(i?.end_date),
    description: toStr(i?.description),
  }));
};

const mapExperience = (items: unknown) => {
  if (!Array.isArray(items) || items.length === 0) return [emptyExperience];
  return items.map((i: any) => ({
    title: toStr(i?.title),
    company: toStr(i?.company),
    location: toStr(i?.location),
    start_date: toStr(i?.start_date),
    end_date: toStr(i?.end_date),
    description: toStr(i?.description),
  }));
};

const mapProjects = (items: unknown) => {
  if (!Array.isArray(items) || items.length === 0) return [emptyProject];
  return items.map((i: any) => ({
    title: toStr(i?.title),
    description: toStr(i?.description),
    technologies: toStr(i?.technologies),
  }));
};

const mapLanguages = (items: unknown) => {
  if (!Array.isArray(items) || items.length === 0) return [emptyLanguage];
  return items.map((i: any) => ({
    name: toStr(i?.name),
    level: toStr(i?.level),
  }));
};

const mapCertifications = (items: unknown) => {
  if (!Array.isArray(items) || items.length === 0) return [emptyCertification];
  return items.map((i: any) => ({
    name: toStr(i?.name),
    issuer: toStr(i?.issuer),
    issue_date: toStr(i?.issue_date),
  }));
};

const mapStringList = (items: unknown, fallback: string[] = [""]) => {
  if (!Array.isArray(items) || items.length === 0) return fallback;
  return items.map((v) => toStr(v));
};

function WizardContent({ navigation }: { navigation: any }) {
  const { step, nextStep, previousStep, form, setForm } = useResumeWizard();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadLatestResume = async () => {
      try {
        const latest = await getLatestResume();
        if (!mounted || !latest) return;

        setForm((prev) => ({
          ...prev,
          profile_summary: toStr(latest.profile_summary),
          education: mapEducation(latest.education),
          experience: mapExperience(latest.experience),
          personal_projects: mapProjects(latest.projects),
          academic_projects: [emptyProject],
          hard_skills: mapStringList(latest.hard_skills, [""]),
          soft_skills: mapStringList(latest.soft_skills, [""]),
          languages: mapLanguages(latest.languages),
          hobbies: mapStringList(latest.hobbies, [""]),
          certifications: mapCertifications(latest.certifications),
        }));
      } catch {
        // aucun CV actif
      }
    };

    loadLatestResume();

    return () => {
      mounted = false;
    };
  }, [setForm]);

  const handleNext = () => {
    if (!isStepValid(step, form)) {
      if (step === 1 && hasInvalidDates(form.education, "start_date", "end_date")) {
        setError("Education dates must be in chronological order (start date before end date).");
        return;
      }
      if (step === 2 && hasInvalidDates(form.experience, "start_date", "end_date")) {
        setError("Experience dates must be in chronological order (start date before end date).");
        return;
      }
      setError("Please complete all required fields on this step before continuing.");
      return;
    }
    setError("");
    nextStep();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      if (!isStepValid(0, form) || !isStepValid(1, form) || !isStepValid(2, form) || !isStepValid(4, form)) {
        if (hasInvalidDates(form.education, "start_date", "end_date")) {
          setError("Education dates must be in chronological order (start date before end date).");
          setSaving(false);
          return;
        }
        if (hasInvalidDates(form.experience, "start_date", "end_date")) {
          setError("Experience dates must be in chronological order (start date before end date).");
          setSaving(false);
          return;
        }
        setError("Please complete all required fields before saving.");
        setSaving(false);
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

      navigation.navigate("Home", {
        successMessage: "Resume saved successfully.",
      });
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

export default function UploadResumeScreen({ navigation }: { navigation: any }) {
  return (
    <ResumeWizardProvider>
      <WizardContent navigation={navigation} />
    </ResumeWizardProvider>
  );
}