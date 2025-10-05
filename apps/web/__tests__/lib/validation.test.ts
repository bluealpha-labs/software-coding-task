import {
  validateEmail,
  validatePassword,
  validateFullName,
  validateForm,
} from "../../lib/validation";

describe("Validation utilities", () => {
  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "",
        "invalid-email",
        "@example.com",
        "test@",
        "test..test@example.com",
      ];

      invalidEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it("should reject emails that are too long", () => {
      const longEmail = "a".repeat(250) + "@example.com";
      const result = validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Email must be less than 255 characters");
    });
  });

  describe("validatePassword", () => {
    it("should validate strong passwords", () => {
      const strongPasswords = [
        "Password123",
        "MyStr0ng!Pass",
        "ComplexP@ssw0rd",
      ];

      strongPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it("should reject weak passwords", () => {
      const weakPasswords = ["", "12345678", "password", "PASSWORD", "Pass123"];

      weakPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it("should reject passwords that are too long", () => {
      const longPassword = "A".repeat(130);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must be less than 128 characters"
      );
    });
  });

  describe("validateFullName", () => {
    it("should accept valid full names", () => {
      const validNames = ["John Doe", "Jane Smith", "José María", ""];

      validNames.forEach((name) => {
        const result = validateFullName(name);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it("should reject names that are too long", () => {
      const longName = "A".repeat(256);
      const result = validateFullName(longName);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Full name must be less than 255 characters"
      );
    });
  });

  describe("validateForm", () => {
    it("should validate complete valid form data", () => {
      const validData = {
        email: "test@example.com",
        password: "Password123",
        fullName: "John Doe",
      };

      const result = validateForm(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should collect all validation errors", () => {
      const invalidData = {
        email: "invalid-email",
        password: "weak",
        fullName: "A".repeat(256),
      };

      const result = validateForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
