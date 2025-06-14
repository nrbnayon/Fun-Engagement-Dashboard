// src/app/(dashboard)/layout.tsx
import React from "react";
import DashboardWrapper from "./components/dashboard-wrapper";
import { layoutMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = layoutMetadata;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardWrapper>{children}</DashboardWrapper>;
}
