// src\app\(auth)\components\ForgetPassword.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// Validation schema
const forgetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters"),
});
type ForgetPasswordFormData = z.infer<typeof forgetPasswordSchema>;
export default function ForgetPassword() {
  const { requestPasswordReset, clearError, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgetPasswordFormData>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const onSubmit = async (data: ForgetPasswordFormData) => {
    try {
      await requestPasswordReset(data);
      clearError();
    } catch (error) {
      console.error("Forget password error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-card">
      {/* Left Side - Welcome Message */}
      <div className="flex-1 bg-card flex items-center justify-center p-8 text-foreground font-oswald">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-4xl font-bold leading-tight">Forgot Password?</h1>
          <p className="text-lg">
            Don&lsquo;t worry! Enter your email address and we&lsquo;ll send you
            a verification code to reset your password
          </p>
          <div className="pt-4 space-y-3">
            <p className="text-sm">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-foreground underline font-medium hover:opacity-80"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Forget Password Form */}
      <div className="flex-1 bg-white font-oswald flex md:items-center justify-center p-8">
        <Card className="w-full md:max-w-md border-[#e2e2e2] shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <Link
                href="/login"
                className="absolute left-4 top-4 lg:left-8 lg:top-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-[#222222]" />
              </Link>
            </div>
            <h2 className="text-2xl font-semibold text-[#222222] mb-2">
              Reset Password
            </h2>
            <p className="text-muted text-sm">
              Enter your email address and we&lsquo;ll send you a verification
              code
            </p>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-[#222222] font-medium text-sm block"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className={`pl-4 pr-10 h-12 border-[#e2e2e2] bg-[#fcfcff] text-[#222222] placeholder:text-muted ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "focus:border-[#001d38]"
                    }`}
                    {...register("email")}
                    disabled={isLoading}
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Send OTP Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-[#001d38]/90 text-foreground hover:text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-[#001d38] underline hover:text-[#001d38]/80 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[#001d38] underline hover:text-[#001d38]/80 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
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
