'use client';

import { useAuth } from "@/contexts/auth.context";
import { redirect } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { token, loading } = useAuth();
  
  if (loading) return null;
  if(token) redirect('/dashboard');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      {children}
    </div>
  );
}
