"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ArrowLeft,
  Shield,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { getPasswordStrength } from "./SignUpForm";


// Validation schema
const resetPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    otp: z.string().min(6, "Please enter the complete verification code"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Timer formatting utility
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default function ResetPassword() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [email, setEmail] = useState("");
  const router = useRouter();

  const { sendOtp, confirmPasswordReset } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Watch password field for real-time validation
  const newPassword = watch("newPassword");

  // Password strength validation
  const passwordValidation = {
    hasMinLength: newPassword ? newPassword.length >= 8 : false,
    hasUpperLower: newPassword
      ? /(?=.*[a-z])(?=.*[A-Z])/.test(newPassword)
      : false,
    hasNumber: newPassword ? /(?=.*\d)/.test(newPassword) : false,
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Check verification status and set email on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    const otpSentTime = localStorage.getItem("otpSentTime");
    const verificationTime = localStorage.getItem("verificationTime");

    if (!storedEmail || !otpSentTime) {
      toast.error("Unauthorized access", {
        description: "Please complete the verification process first.",
      });
      router.push("/forgot-password");
      return;
    }

    // Check if verification is still valid (e.g., within 10 minutes)
    if (verificationTime) {
      const timePassed = Date.now() - parseInt(verificationTime);
      const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

      if (timePassed > tenMinutes) {
        toast.error("Verification expired", {
          description: "Please start the password reset process again.",
        });
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("otpVerified");
        localStorage.removeItem("verificationTime");
        localStorage.removeItem("otpSentTime");
        router.push("/forgot-password");
        return;
      }
    }

    // Calculate remaining time based on when OTP was sent
    const sentTime = parseInt(otpSentTime);
    const currentTime = Date.now();
    const elapsed = Math.floor((currentTime - sentTime) / 1000);
    const remaining = Math.max(0, 120 - elapsed);

    setEmail(storedEmail);
    setValue("email", storedEmail);
    setTimeLeft(remaining);
  }, [router, setValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      // Call the actual confirmPasswordReset API
      await confirmPasswordReset({
        email: data.email,
        otp: data.otp,
        new_password: data.newPassword,
      });

      // Log the form data to console (excluding password for security)
      console.log("Reset Password Data:", {
        email: data.email,
        passwordLength: data.newPassword.length,
        timestamp: new Date().toISOString(),
      });

      toast.success("Password reset successful!", {
        description: "Your password has been updated successfully.",
        duration: 2000,
      });

      // Clear all reset-related data from localStorage
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("otpVerified");
      localStorage.removeItem("verificationTime");
      localStorage.removeItem("otpSentTime");

      // Redirect to success page after a short delay
      setTimeout(() => {
        router.push("/success");
      }, 1000);
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Password reset failed", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      // Call the actual sendOtp API
      await sendOtp({ email: email });

      // Reset timer
      setTimeLeft(120);
      const newSentTime = Date.now();
      localStorage.setItem("otpSentTime", newSentTime.toString());

      // Clear the current OTP input
      setOtp("");
      setValue("otp", "");

      toast.success("OTP resent successfully!", {
        description: `New verification code sent to ${email}`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
        duration: 3000,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setValue("otp", value);
  };

  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-card'>
      {/* Left Side - Welcome Message */}
      <div className='flex-1 bg-card flex items-center justify-center p-8 text-foreground font-oswald'>
        <div className='max-w-md text-center space-y-6'>
          <h1 className='text-4xl font-bold leading-tight'>
            Create New Password
          </h1>
          <p className='text-lg'>
            Your new password must be different from your previous password and
            contain at least 8 characters
          </p>
          <div className='pt-4 space-y-3'>
            <div className='flex items-center justify-center space-x-2 text-sm'>
              <Shield className='h-4 w-4' />
              <span>Create a strong, secure password</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className='flex-1 bg-white font-oswald flex md:items-center justify-center p-8'>
        <Card className='w-full md:max-w-md border-[#e2e2e2] shadow-lg'>
          <CardHeader className='text-center pb-6'>
            <div className='flex items-center justify-center mb-4'>
              <Link
                href='/verify-otp'
                className='absolute left-4 top-4 lg:left-8 lg:top-8 p-2 hover:bg-gray-100 rounded-full transition-colors'
              >
                <ArrowLeft className='h-5 w-5 text-[#222222]' />
              </Link>
            </div>
            <h2 className='text-2xl font-semibold text-[#222222] mb-2'>
              Reset Password
            </h2>
            <p className='text-muted text-sm'>Enter your new password below</p>
          </CardHeader>

          <CardContent>
            <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field (Read-only) */}
              <div className='space-y-2'>
                <label className='text-[#222222] font-medium text-sm block'>
                  Email Address
                </label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4' />
                  <Input
                    {...register("email")}
                    type='email'
                    value={email}
                    readOnly
                    disabled
                    className='pl-10 h-12 bg-gray-50 border-[#e2e2e2] text-muted cursor-not-allowed'
                    placeholder='Email address'
                  />
                </div>
              </div>

              {/* OTP Field */}
              <div className='space-y-2'>
                <label className='text-[#222222] font-medium text-sm block text-center'>
                  Verification Code
                </label>
                <div className='flex justify-center'>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={isLoading || timeLeft === 0}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className='w-12 h-12 text-lg font-medium border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]'
                      />
                      <InputOTPSlot
                        index={1}
                        className='w-12 h-12 text-lg font-medium border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]'
                      />
                      <InputOTPSlot
                        index={2}
                        className='w-12 h-12 text-lg font-medium border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]'
                      />
                      <InputOTPSlot
                        index={3}
                        className='w-12 h-12 text-lg font-medium border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]'
                      />
                      <InputOTPSlot
                        index={4}
                        className='w-12 h-12 text-lg font-medium border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]'
                      />
                      <InputOTPSlot
                        index={5}
                        className='w-12 h-12 text-lg font-medium border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]'
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {errors.otp && (
                  <p className='text-red-500 text-xs mt-1 text-center'>
                    {errors.otp.message}
                  </p>
                )}
              </div>

              {/* Timer Display */}
              <div className='text-center'>
                {timeLeft > 0 ? (
                  <p className='text-muted text-sm'>
                    Code expires in{" "}
                    <span className='font-medium text-[#001d38]'>
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                ) : (
                  <p className='text-red-500 text-sm'>
                    Verification code has expired
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div className='space-y-2'>
                <label className='text-[#222222] font-medium text-sm block'>
                  New Password
                </label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4' />
                  <Input
                    {...register("newPassword")}
                    type={showNewPassword ? "text" : "password"}
                    className='pl-10 pr-10 h-12 border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]'
                    placeholder='Enter your new password'
                    disabled={isLoading}
                  />
                  <button
                    type='button'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-[#222222] transition-colors'
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.newPassword.message}
                  </p>
                )}

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className='space-y-1'>
                    <div className='flex space-x-1'>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.label && (
                      <p
                        className={`text-xs ${
                          passwordStrength.strength >= 4
                            ? "text-green-600"
                            : passwordStrength.strength >= 3
                            ? "text-blue-600"
                            : passwordStrength.strength >= 2
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        Password strength: {passwordStrength.label}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className='space-y-2'>
                <label className='text-[#222222] font-medium text-sm block'>
                  Confirm New Password
                </label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4' />
                  <Input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    className='pl-10 pr-10 h-12 border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]'
                    placeholder='Confirm your new password'
                    disabled={isLoading}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-[#222222] transition-colors'
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Password Requirements Checklist */}
              <div className='space-y-2'>
                <div className='text-xs text-muted'>
                  <p className='mb-2'>Password must contain:</p>
                  <div className='space-y-1'>
                    <div className='flex items-center space-x-2'>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          passwordValidation.hasMinLength
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span>At least 8 characters</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          passwordValidation.hasUpperLower
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span>Uppercase and lowercase letters</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          passwordValidation.hasNumber
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span>At least one number</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Password Button */}
              <Button
                type='submit'
                className='w-full h-12 bg-primary hover:bg-[#001d38]/90 text-foreground hover:text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={isLoading || isSubmitting || !otp || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>

            {/* Resend Button */}
            <div className='text-center space-y-2 mt-6'>
              <p className='text-muted text-sm'>
                Didn&apos;t receive the code?
              </p>
              <Button
                type='button'
                variant='outline'
                onClick={handleResendOtp}
                disabled={timeLeft > 0 || isResending}
                className='border-[#e2e2e2] text-[#222222] hover:bg-gray-50 hover:text-black font-medium'
              >
                {isResending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4' />
                    Resend Code
                  </>
                )}
              </Button>
            </div>

            {/* Additional Info */}
            <div className='mt-6 text-center'>
              <p className='text-xs text-muted'>
                Having trouble?{" "}
                <Link
                  href='/support'
                  className='text-[#001d38] underline hover:text-[#001d38]/80 font-medium'
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
