"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(50, "Email must be less than 50 characters")
    .email("Invalid email format")
    .refine((val) => !/\s/.test(val), {
      message: "Email must not contain spaces",
    }),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  // Clear error when component mounts or when form values change
  const watchedEmail = watch("email");
  const watchedPassword = watch("password");
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watchedEmail, watchedPassword, clearError, error]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Clear any previous errors
      clearError();

      console.log("Login Form Data:", {
        username: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      // Call login function
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      // Don't reset form here - let AuthContext handle success flow
    } catch (error) {
      console.error("Login submission error:", error);
      // Error is handled by AuthContext, just ensure form doesn't reset
    }
  };

  // Handle form submission with proper error handling
  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
      // Don't reset form on error
    }
  });

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex bg-card">
        <div className="flex-1 bg-card flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2 text-muted">Loading...</p>
          </div>
        </div>
        <div className="flex-1 bg-white flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="border-[#e2e2e2] shadow-lg">
              <CardHeader className="h-20" />
              <CardContent className="h-96" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-card font-oswald">
      {/* Left Side - Welcome Message */}
      <div className="flex-1 bg-card flex items-center justify-center p-8 text-foreground font-oswald">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-4xl font-bold leading-tight">Welcome Back!</h1>
          <p className="text-muted text-lg">
            Sign in to access your dashboard and manage your account
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-[#e2e2e2] shadow-lg">
          <CardHeader className="text-center pb-6">
            <h2 className="text-2xl font-semibold text-[#222222] mb-2">
              Sign in to Account
            </h2>
            <p className="text-muted text-sm">
              Don&apos;t have an Account?{" "}
              <Link
                href="/signup"
                className="text-[#222222] underline font-medium hover:text-[#001d38]"
              >
                Sign Up Free
              </Link>
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                  <button
                    type="button"
                    onClick={clearError}
                    className="ml-2 underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-[#222222] font-medium text-sm block"
                >
                  Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={`pl-4 pr-10 h-12 border-[#e2e2e2] bg-[#fcfcff] text-[#222222] placeholder:text-[#acacac] ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "focus:border-[#001d38]"
                    }`}
                    {...register("email")}
                    disabled={isLoading}
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#acacac]" />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-[#222222] font-medium text-sm block"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`pl-4 pr-10 h-12 border-[#e2e2e2] bg-[#fcfcff] text-[#222222] placeholder:text-[#acacac] ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "focus:border-[#001d38]"
                    }`}
                    {...register("password")}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-[#001d38] transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-[#acacac]" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#acacac]" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    className="border-[#e2e2e2]"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setValue("rememberMe", !!checked)
                    }
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-muted text-sm cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-muted text-sm hover:text-blue-500 hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-[#001d38]/90 text-foreground hover:text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-green-500">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-green-500"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
