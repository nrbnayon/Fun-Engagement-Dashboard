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
    .transform((val) => val.trim().toLowerCase().replace(/\s+/g, ""))
    .refine((val) => !/\s/.test(val), {
      message: "Email must not contain spaces",
    }),
  password: z
    .string()
    .min(1, "Password is required")
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
      // // clearError();
      // console.log("Login Form Data:", {
      //   username: data.email,
      //   password: data.password,
      //   rememberMe: data.rememberMe,
      // });
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
    } catch (error) {
      console.error("Login submission error:", error);
    }
  };

  // Handle form submission with proper error handling
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-card">
        <div className="flex-1 bg-card flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2 text-muted">Loading...</p>
          </div>
        </div>
        <div className="flex-1 bg-white flex items-center justify-center">
          <div className="w-full max-w-md px-4">
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-card font-oswald">
      {/* Left Side - Welcome Message */}
      <div className="flex-1 bg-card flex items-center justify-center p-4 sm:p-6 lg:p-8 text-foreground font-oswald">
        <div className="max-w-md text-center space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            Welcome Back!
          </h1>
          <p className="text-muted text-base sm:text-lg">
            Sign in to access your dashboard and manage your account
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md border-[#e2e2e2] shadow-lg -mt-20 md:mt-0">
          <CardHeader className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#222222]">
              Sign in to Account
            </h2>
            {/* <p className="text-muted text-sm">
              Don&apos;t have an Account?{" "}
              <Link
                href="/signup"
                className="text-[#222222] underline font-medium hover:text-[#001d38]"
              >
                Sign Up Free
              </Link>
            </p> */}
          </CardHeader>

          <CardContent className="px-4 sm:px-6">
            <form
              onSubmit={handleFormSubmit}
              className="space-y-2 sm:space-y-6"
            >
              {/* Error Display */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
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
                    className={`pl-4 pr-10 h-10 sm:h-12 border-[#e2e2e2] bg-[#fcfcff] text-[#222222] placeholder:text-[#acacac] text-sm sm:text-base ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "focus:border-[#001d38]"
                    }`}
                    {...register("email")}
                    disabled={isLoading}
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[#acacac]" />
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
                    className={`pl-4 pr-10 h-10 sm:h-12 border-[#e2e2e2] bg-[#fcfcff] text-[#222222] placeholder:text-[#acacac] text-sm sm:text-base ${
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
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#acacac]" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#acacac]" />
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
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
                className="w-full h-10 sm:h-12 bg-primary hover:bg-[#001d38]/90 text-foreground hover:text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
