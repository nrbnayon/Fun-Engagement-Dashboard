// src/app/(auth)/login/page.tsx
import { Suspense } from "react";
import LoginForm from "../components/LoginForm";

// Loading component for suspense
function LoginFormSkeleton() {
  return (
    <div className="min-h-screen flex bg-card">
      <div className="flex-1 bg-card flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
