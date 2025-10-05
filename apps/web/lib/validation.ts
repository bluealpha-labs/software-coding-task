// Client-side validation utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];

  if (!email) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Please enter a valid email address");
  } else if (email.length > 255) {
    errors.push("Email must be less than 255 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push("Password is required");
  } else if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateFullName = (fullName: string): ValidationResult => {
  const errors: string[] = [];

  if (fullName && fullName.length > 255) {
    errors.push("Full name must be less than 255 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateForm = (data: {
  email: string;
  password: string;
  fullName?: string;
}): ValidationResult => {
  const allErrors: string[] = [];

  const emailResult = validateEmail(data.email);
  const passwordResult = validatePassword(data.password);
  const fullNameResult = data.fullName
    ? validateFullName(data.fullName)
    : { isValid: true, errors: [] };

  allErrors.push(...emailResult.errors);
  allErrors.push(...passwordResult.errors);
  allErrors.push(...fullNameResult.errors);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};
