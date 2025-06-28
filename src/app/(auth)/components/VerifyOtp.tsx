// src\app\(auth)\components\VerifyOtp.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, ArrowLeft, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Validation schema
const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [email, setEmail] = useState("");
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  // Initialize timer and email on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get("email");
    const resetEmail = localStorage.getItem("resetEmail");
    const registrationEmail = localStorage.getItem("registrationEmail");
    const currentEmail = emailFromUrl || registrationEmail || resetEmail;
    if (!currentEmail) {
      toast.error("Session expired", {
        description: "Please start the process again.",
      });
      router.push("/signup");
      return;
    }
    setEmail(currentEmail);
    if (emailFromUrl && !registrationEmail) {
      localStorage.setItem("registrationEmail", emailFromUrl);
    }
    const otpSentTime = localStorage.getItem("otpSentTime");
    const timerKey = `otpTimer_${currentEmail}`;
    const storedTimeLeft = localStorage.getItem(timerKey);

    if (otpSentTime && storedTimeLeft) {
      const timePassed = Math.floor(
        (Date.now() - parseInt(otpSentTime)) / 1000
      );
      const remainingTime = Math.max(0, parseInt(storedTimeLeft) - timePassed);
      setTimeLeft(remainingTime);
    } else if (otpSentTime) {
      const timePassed = Math.floor(
        (Date.now() - parseInt(otpSentTime)) / 1000
      );
      const remainingTime = Math.max(0, 120 - timePassed);
      setTimeLeft(remainingTime);
      localStorage.setItem(timerKey, remainingTime.toString());
    } else {
      setTimeLeft(120);
      const newSentTime = Date.now();
      localStorage.setItem("otpSentTime", newSentTime.toString());
      localStorage.setItem(timerKey, "120");
    }
  }, [router]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Save timer state to localStorage
          const timerKey = `otpTimer_${email}`;
          localStorage.setItem(timerKey, newTime.toString());
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeLeft, email]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const onSubmit = async (data: OtpFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Log the form data to console
      console.log("OTP Verification Data:", {
        email,
        otp: data.otp,
        timestamp: new Date().toISOString(),
      });

      // Simulate successful OTP verification
      toast.success("OTP verified successfully!", {
        description: "Redirecting to reset password...",
        duration: 2000,
      });

      // Store verification status
      localStorage.setItem("otpVerified", "true");
      localStorage.setItem("verificationTime", Date.now().toString());

      // Clear timer from localStorage
      const timerKey = `otpTimer_${email}`;
      localStorage.removeItem(timerKey);

      // Redirect to reset password after a short delay
      setTimeout(() => {
        router.push("/reset-password");
      }, 1000);
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Invalid OTP", {
        description: "Please check the code and try again.",
        duration: 3000,
      });
      setError("otp", { message: "Invalid OTP code" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset timer
      setTimeLeft(120);
      const newSentTime = Date.now();
      localStorage.setItem("otpSentTime", newSentTime.toString());
      const timerKey = `otpTimer_${email}`;
      localStorage.setItem(timerKey, "120");

      toast.success("OTP resent successfully!", {
        description: `New verification code sent to ${email}`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP", {
        description: "Please try again later.",
        duration: 3000,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setValue("otp", value);

    // Auto-submit when OTP is complete
    if (value.length === 6) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="min-h-screen flex bg-card">
      {/* Left Side - Welcome Message */}
      <div className="flex-1 bg-card flex items-center justify-center p-8 text-foreground font-oswald">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Verify Your Email
          </h1>
          <p className="text-lg">
            We&apos;ve sent a 6-digit verification code to your email address.
            Enter the code below to continue.
          </p>
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                {timeLeft > 0
                  ? `Expires in ${formatTime(timeLeft)}`
                  : "Code expired"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - OTP Verification Form */}
      <div className="flex-1 bg-white font-oswald flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-[#e2e2e2] shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <Link
                href="/forgot-password"
                className="absolute left-4 top-4 lg:left-8 lg:top-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-[#222222]" />
              </Link>
            </div>
            <h2 className="text-2xl font-semibold text-[#222222] mb-2">
              Enter Verification Code
            </h2>
            <p className="text-muted text-sm">
              We&apos;ve sent a 6-digit code to{" "}
              <span className="font-medium text-[#001d38]">{email}</span>
            </p>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* OTP Input */}
              <div className="space-y-2">
                <label className="text-[#222222] font-medium text-sm block text-center">
                  Verification Code
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={isLoading || timeLeft === 0}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className="w-12 h-12 text-lg font-medium border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]"
                      />
                      <InputOTPSlot
                        index={1}
                        className="w-12 h-12 text-lg font-medium border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]"
                      />
                      <InputOTPSlot
                        index={2}
                        className="w-12 h-12 text-lg font-medium border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]"
                      />
                      <InputOTPSlot
                        index={3}
                        className="w-12 h-12 text-lg font-medium border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]"
                      />
                      <InputOTPSlot
                        index={4}
                        className="w-12 h-12 text-lg font-medium border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]"
                      />
                      <InputOTPSlot
                        index={5}
                        className="w-12 h-12 text-lg font-medium border-[#e2e2e2] bg-[#fcfcff] text-[#222222] focus:border-[#001d38]"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {errors.otp && (
                  <p className="text-red-500 text-xs mt-1 text-center">
                    {errors.otp.message}
                  </p>
                )}
              </div>

              {/* Timer Display */}
              <div className="text-center">
                {timeLeft > 0 ? (
                  <p className="text-muted text-sm">
                    Code expires in{" "}
                    <span className="font-medium text-[#001d38]">
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                ) : (
                  <p className="text-red-500 text-sm">
                    Verification code has expired
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-[#001d38]/90 text-foreground hover:text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isLoading ||
                  isSubmitting ||
                  otp.length !== 6 ||
                  timeLeft === 0
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              {/* Resend Button */}
              <div className="text-center space-y-2">
                <p className="text-muted text-sm">
                  Didn&apos;t receive the code?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOtp}
                  disabled={timeLeft > 0 || isResending}
                  className="border-[#e2e2e2] text-[#222222] hover:bg-gray-50 hover:text-black font-medium"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Code
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted">
                Having trouble?{" "}
                <Link
                  href="/support"
                  className="text-[#001d38] underline hover:text-[#001d38]/80 font-medium"
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
