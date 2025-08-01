"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function SubscribePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated, redirect to signin
    if (!user) {
      router.push("/signin");
      return;
    }
    
    // If user is authenticated, redirect to dashboard
    router.push("/dashboard");
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Redirecting you to the dashboard...</p>
      </div>
    </div>
  );
}
