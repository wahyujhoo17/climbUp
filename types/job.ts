export type JobApplication = {
  id: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  status: "Saved" | "Applied" | "Interviewed" | "Offered" | "Rejected";
  dateApplied: string;
  nextStep?: string;
  nextDate?: string;
  notes?: string;
  logo?: string;
  favorite: boolean;
  color?: string;
};
