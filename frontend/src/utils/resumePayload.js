const clean = (v) => (typeof v === "string" ? v.trim() : v);

const cleanObject = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, clean(v)])
  );

const nonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

const filterObjectList = (arr = []) =>
  arr
    .map(cleanObject)
    .filter((obj) => Object.values(obj).some(nonEmptyString));

const filterStringList = (arr = []) =>
  arr.map((v) => (v || "").trim()).filter((v) => v.length > 0);

export const buildResumeSavePayload = (form) => ({
  profile_summary: (form.profile_summary || "").trim() || null,
  education: filterObjectList(form.education),
  experience: filterObjectList(form.experience),

  // merge both project sections because backend has one `projects` array
  projects: [
    ...filterObjectList(form.personal_projects || []),
    ...filterObjectList(form.academic_projects || []),
  ],

  hard_skills: filterStringList(form.hard_skills),
  soft_skills: filterStringList(form.soft_skills),
  languages: filterObjectList(form.languages),
  hobbies: filterStringList(form.hobbies),
  certifications: filterObjectList(form.certifications),
});