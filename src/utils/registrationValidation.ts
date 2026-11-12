export type RegistrationFormData = {
  name: string;
  email: string;
  gender: string;
  degree: string;
  branch: string;
  college: string;
  discordId: string;
  githubId: string;
  graduationYear: string;
  avatarUrl: string;
  year: string;
};

export type RegistrationFieldErrors = Partial<Record<keyof RegistrationFormData, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GITHUB_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const ALLOWED_GENDERS = new Set(['male', 'female', 'other']);
const ALLOWED_YEARS = new Set(['School', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Passout']);

export function validateRegistration(data: RegistrationFormData): RegistrationFieldErrors {
  const errors: RegistrationFieldErrors = {};
  const graduationYear = Number(data.graduationYear);

  if (data.name.trim().length < 2 || data.name.trim().length > 100) {
    errors.name = 'Enter your full name (2–100 characters).';
  }
  if (!EMAIL_PATTERN.test(data.email.trim()) || data.email.trim().length > 254) {
    errors.email = 'Enter a valid email address, such as you@example.com.';
  }
  if (!GITHUB_PATTERN.test(data.githubId.trim())) {
    errors.githubId = 'Your GitHub identity could not be verified. Please sign in again.';
  }
  if (
    data.discordId.trim().length < 2 ||
    data.discordId.trim().length > 100 ||
    /\s/.test(data.discordId.trim())
  ) {
    errors.discordId = 'Enter a valid Discord username without spaces.';
  }
  if (!ALLOWED_GENDERS.has(data.gender.trim().toLowerCase())) {
    errors.gender = 'Choose a valid gender option.';
  }
  if (data.college.trim().length < 2 || data.college.trim().length > 200) {
    errors.college = 'Enter a college name between 2 and 200 characters.';
  }
  if (data.degree.trim().length < 2 || data.degree.trim().length > 50) {
    errors.degree = 'Enter a valid degree.';
  }
  if (data.branch.trim().length < 2 || data.branch.trim().length > 100) {
    errors.branch = 'Enter your branch or field of study.';
  }
  if (!ALLOWED_YEARS.has(data.year)) {
    errors.year = 'Choose your current year.';
  }
  if (!Number.isInteger(graduationYear) || graduationYear < 2000 || graduationYear > 2100) {
    errors.graduationYear = 'Enter a graduation year between 2000 and 2100.';
  }

  return errors;
}

