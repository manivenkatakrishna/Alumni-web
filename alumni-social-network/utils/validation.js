export function validateRequired(value, label) {
  if (!String(value || "").trim()) {
    throw new Error(`${label} is required.`);
  }
}

export function validateEmail(value) {
  validateRequired(value, "Email");
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(String(value).trim())) {
    throw new Error("Please enter a valid email address.");
  }
}

export function validatePassword(value) {
  validateRequired(value, "Password");
  if (String(value).length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
}

export function validatePost(text, file) {
  if (!String(text || "").trim() && !file) {
    throw new Error("Add a caption or upload media to create a post.");
  }
}

export function validateGraduationYear(value) {
  validateRequired(value, "Graduation year");
  const year = Number(value);
  if (Number.isNaN(year) || year < 1950 || year > new Date().getFullYear() + 10) {
    throw new Error("Please enter a valid graduation year.");
  }
}

export function validateEmailSearch() {
  return true;
}
