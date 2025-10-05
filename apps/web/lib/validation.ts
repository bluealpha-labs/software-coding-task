/**
 * Client-side validation utilities
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class FormValidator {
  private rules: Record<string, ValidationRule[]> = {};

  addRule(field: string, rule: ValidationRule): this {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field].push(rule);
    return this;
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, rules] of Object.entries(this.rules)) {
      const value = data[field];

      for (const rule of rules) {
        const error = this.validateField(value, rule);
        if (error) {
          errors[field] = error;
          break; // Stop at first error for this field
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private validateField(value: any, rule: ValidationRule): string | null {
    // Required validation
    if (
      rule.required &&
      (value === undefined || value === null || value === "")
    ) {
      return "This field is required";
    }

    // Skip other validations if value is empty and not required
    if (
      !rule.required &&
      (value === undefined || value === null || value === "")
    ) {
      return null;
    }

    // Type-specific validations
    if (typeof value === "string") {
      if (rule.minLength && value.length < rule.minLength) {
        return `Must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return `Must be no more than ${rule.maxLength} characters`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return "Invalid format";
      }
    }

    if (typeof value === "number") {
      if (rule.minLength && value < rule.minLength) {
        return `Must be at least ${rule.minLength}`;
      }

      if (rule.maxLength && value > rule.maxLength) {
        return `Must be no more than ${rule.maxLength}`;
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }
}

// Common validation rules
export const commonRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },

  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message: "Please enter a valid phone number",
  },

  url: {
    pattern: /^https?:\/\/.+/,
    message: "Please enter a valid URL",
  },

  positiveNumber: {
    custom: (value: number) => (value > 0 ? null : "Must be a positive number"),
  },

  percentage: {
    custom: (value: number) =>
      value >= 0 && value <= 100 ? null : "Must be between 0 and 100",
  },
};

// MMM-specific validation rules
export const mmmRules = {
  channelName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_]+$/,
  },

  contributionValue: {
    required: true,
    custom: (value: number) =>
      value >= 0 ? null : "Contribution must be non-negative",
  },

  spendValue: {
    required: true,
    custom: (value: number) =>
      value >= 0 ? null : "Spend must be non-negative",
  },

  dateRange: {
    custom: (value: { start: string; end: string }) => {
      if (!value.start || !value.end) {
        return "Both start and end dates are required";
      }

      const startDate = new Date(value.start);
      const endDate = new Date(value.end);

      if (startDate >= endDate) {
        return "Start date must be before end date";
      }

      const now = new Date();
      if (startDate > now || endDate > now) {
        return "Dates cannot be in the future";
      }

      return null;
    },
  },
};

// Real-time validation hook
export function useValidation<T extends Record<string, any>>(
  initialData: T,
  validator: FormValidator
) {
  const [data, setData] = React.useState<T>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validate = React.useCallback(() => {
    const result = validator.validate(data);
    setErrors(result.errors);
    return result.isValid;
  }, [data, validator]);

  const setFieldValue = React.useCallback(
    (field: keyof T, value: any) => {
      setData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const setFieldTouched = React.useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validateField = React.useCallback(
    (field: keyof T) => {
      const result = validator.validate({ [field]: data[field] });
      if (result.errors[field as string]) {
        setErrors((prev) => ({
          ...prev,
          [field]: result.errors[field as string] || "",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors as Record<string, string>;
        });
      }
    },
    [data, validator]
  );

  // Auto-validate on blur
  const handleBlur = React.useCallback(
    (field: keyof T) => {
      setFieldTouched(field);
      validateField(field);
    },
    [setFieldTouched, validateField]
  );

  return {
    data,
    errors,
    touched,
    isValid: Object.keys(errors).length === 0,
    setFieldValue,
    setFieldTouched,
    validateField,
    handleBlur,
    validate,
  };
}

// Import React for the hook
import React from "react";

// Simple validation functions for common use cases
export function validateEmail(email: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!email) {
    errors.push("Email is required");
  } else {
    if (email.length > 255) {
      errors.push("Email must be less than 255 characters");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Please enter a valid email address");
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!password) {
    errors.push("Password is required");
  } else {
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (password.length > 128) {
      errors.push("Password must be less than 128 characters");
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.push(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRequired(
  value: string,
  fieldName: string = "Field"
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!value || value.trim() === "") {
    errors.push(`${fieldName} is required`);
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateFullName(name: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (name && name.length > 255) {
    errors.push("Full name must be less than 255 characters");
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string = "Field"
): string | null {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
}

export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string = "Field"
): string | null {
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }
  return null;
}

// Form validation function
export function validateForm(data: Record<string, any>): {
  isValid: boolean;
  errors: string[];
} {
  const allErrors: string[] = [];

  // Validate email
  if (data.email) {
    const emailResult = validateEmail(data.email);
    if (!emailResult.isValid) {
      allErrors.push(...emailResult.errors);
    }
  }

  // Validate password
  if (data.password) {
    const passwordResult = validatePassword(data.password);
    if (!passwordResult.isValid) {
      allErrors.push(...passwordResult.errors);
    }
  }

  // Validate full name (optional)
  if (data.fullName && data.fullName.trim()) {
    const nameResult = validateFullName(data.fullName);
    if (!nameResult.isValid) {
      allErrors.push(...nameResult.errors);
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}
