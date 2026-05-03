// src/types/resume.ts
export type EducationItem = {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  description: string;
};

export type ExperienceItem = {
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
};

export type ProjectItem = {
  title: string;
  description: string;
  technologies: string;
};

export type LanguageItem = {
  name: string;
  level: string;
};

export type CertificationItem = {
  name: string;
  issuer: string;
  issue_date: string;
};

export type ResumeFormState = {
  professional_email: string;
  phone_number: string;
  linkedin_url: string;
  country: string;
  city: string;
  profile_summary: string;

  education: EducationItem[];
  experience: ExperienceItem[];

  personal_projects: ProjectItem[];
  academic_projects: ProjectItem[];

  hard_skills: string[];
  soft_skills: string[];
  languages: LanguageItem[];

  hobbies: string[];
  certifications: CertificationItem[];
};