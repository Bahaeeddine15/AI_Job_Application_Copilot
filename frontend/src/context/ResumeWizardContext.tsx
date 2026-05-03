// src/context/ResumeWizardContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { ResumeFormState } from "../types/resume";

type ResumeWizardContextValue = {
  form: ResumeFormState;
  setForm: React.Dispatch<React.SetStateAction<ResumeFormState>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  nextStep: () => void;
  previousStep: () => void;
  resetForm: () => void;
};

const initialForm: ResumeFormState = {
  professional_email: "",
  phone_number: "",
  linkedin_url: "",
  country: "",
  city: "",
  profile_summary: "",

  education: [
    {
      institution: "",
      degree: "",
      field: "",
      start_date: "",
      end_date: "",
      description: "",
    },
  ],
  experience: [
    {
      title: "",
      company: "",
      location: "",
      start_date: "",
      end_date: "",
      description: "",
    },
  ],

  personal_projects: [{ title: "", description: "", technologies: "" }],
  academic_projects: [{ title: "", description: "", technologies: "" }],

  hard_skills: [""],
  soft_skills: [""],
  languages: [{ name: "", level: "" }],

  hobbies: [""],
  certifications: [{ name: "", issuer: "", issue_date: "" }],
};

const ResumeWizardContext = createContext<ResumeWizardContextValue | null>(null);

export function ResumeWizardProvider({ children }: { children: React.ReactNode }) {
  const [form, setForm] = useState<ResumeFormState>(initialForm);
  const [step, setStep] = useState(0);

  const value = useMemo(
    () => ({
      form,
      setForm,
      step,
      setStep,
      nextStep: () => setStep((current) => Math.min(current + 1, 5)),
      previousStep: () => setStep((current) => Math.max(current - 1, 0)),
      resetForm: () => {
        setForm(initialForm);
        setStep(0);
      },
    }),
    [form, step]
  );

  return <ResumeWizardContext.Provider value={value}>{children}</ResumeWizardContext.Provider>;
}

export function useResumeWizard() {
  const context = useContext(ResumeWizardContext);
  if (!context) {
    throw new Error("useResumeWizard must be used inside ResumeWizardProvider");
  }
  return context;
}