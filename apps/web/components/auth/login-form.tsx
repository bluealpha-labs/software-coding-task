"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useAuth } from "../../lib/auth";
import { validateEmail, validatePassword } from "../../lib/validation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string[];
  }>({});
  const { login } = useAuth();

  const validateForm = () => {
    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);

    const errors: { [key: string]: string[] } = {};
    if (!emailResult.isValid) errors.email = emailResult.errors;
    if (!passwordResult.isValid) errors.password = passwordResult.errors;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access the dashboard
        </CardDescription>
        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
          <p className="font-medium mb-1">Demo Credentials:</p>
          <p>
            Admin:{" "}
            <code className="bg-gray-100 px-1 rounded">admin@example.com</code>{" "}
            / <code className="bg-gray-100 px-1 rounded">Admin123!</code>
          </p>
          <p>
            Test:{" "}
            <code className="bg-gray-100 px-1 rounded">test@example.com</code> /{" "}
            <code className="bg-gray-100 px-1 rounded">Test123!</code>
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className={validationErrors.email ? "border-red-500" : ""}
            />
            {validationErrors.email && (
              <div className="text-red-500 text-sm">
                {validationErrors.email.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className={validationErrors.password ? "border-red-500" : ""}
            />
            {validationErrors.password && (
              <div className="text-red-500 text-sm">
                {validationErrors.password.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
