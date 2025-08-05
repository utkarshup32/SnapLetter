"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface UserPreferences {
  categories: string[];
  frequency: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface PopupMessage {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export default function DashboardPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [popup, setPopup] = useState<PopupMessage | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const showPopup = (type: 'success' | 'error', title: string, message: string) => {
    setPopup({ type, title, message });
    setTimeout(() => setPopup(null), 5000);
  };

  useEffect(() => {
    fetch("/api/user-preferences")
      .then((response) => {
        if (response && response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        if (data) {
          setPreferences(data);
        }
      })
      .catch(() => {
        router.replace("/subscribe");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleUpdatePreferences = () => {
    router.push("/select");
  };

  const handleDeactivateNewsletter = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/user-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: false }),
      });

      if (response.ok) {
        setPreferences((prev) => (prev ? { ...prev, is_active: false } : null));
        showPopup('success', 'Newsletter Paused', 'Your newsletter has been paused successfully');
      }
    } catch (error) {
      console.error("Error deactivating newsletter:", error);
      showPopup('error', 'Pause Failed', 'Failed to pause newsletter. Please try again.');
    }
  };

  const handleActivateNewsletter = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/user-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      });

      if (response.ok) {
        setPreferences((prev) => (prev ? { ...prev, is_active: true } : null));
        showPopup('success', 'Newsletter Resumed', 'Your newsletter has been resumed successfully');
      }
    } catch (error) {
      console.error("Error activating newsletter:", error);
      showPopup('error', 'Resume Failed', 'Failed to resume newsletter. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-lg">
              <svg className="animate-spin w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Loading Dashboard</h2>
            <p className="text-slate-600">Setting up your personalized experience...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Your Newsletter Dashboard
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Manage your personalized newsletter preferences and stay in control
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Current Preferences */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                  <span className="mr-3 text-2xl">⚙️</span>
                  Current Preferences
                </h2>
              </div>

              {preferences ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                      <span className="mr-2 text-xl">📚</span>
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {preferences.categories.map((category) => (
                        <span
                          key={category}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 rounded-full text-sm font-medium border border-blue-200/50"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center">
                      <span className="mr-2 text-xl">⏰</span>
                      Frequency
                    </h3>
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-green-200/50">
                      <span className="text-green-700 font-medium capitalize">
                        {preferences.frequency}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center">
                      <span className="mr-2 text-xl">📧</span>
                      Email
                    </h3>
                    <p className="text-slate-600 bg-slate-50 rounded-lg px-3 py-2 font-mono text-sm">
                      {preferences.email}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center">
                      <span className="mr-2 text-xl">📊</span>
                      Status
                    </h3>
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full mr-3 ${
                          preferences.is_active 
                            ? "bg-green-500 shadow-lg shadow-green-500/50" 
                            : "bg-red-500 shadow-lg shadow-red-500/50"
                        }`}
                      ></div>
                      <span className={`font-medium ${
                        preferences.is_active ? "text-green-700" : "text-red-700"
                      }`}>
                        {preferences.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center">
                      <span className="mr-2 text-xl">📅</span>
                      Created
                    </h3>
                    <p className="text-slate-600">
                      {new Date(preferences.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No preferences set yet</h3>
                  <p className="text-slate-600 mb-6">Get started by setting up your newsletter preferences</p>
                  <Link
                    href="/select"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Set Up Newsletter
                  </Link>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                  <span className="mr-3 text-2xl">🎛️</span>
                  Quick Actions
                </h2>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleUpdatePreferences}
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Update Preferences
                </button>

                {preferences && (
                  <>
                    {preferences.is_active ? (
                      <button
                        onClick={handleDeactivateNewsletter}
                        className="w-full flex items-center justify-center px-6 py-4 border-2 border-red-300 text-red-700 font-semibold rounded-2xl bg-red-50 hover:bg-red-100 hover:border-red-400 transform hover:scale-105 transition-all duration-300"
                      >
                        <svg
                          className="w-5 h-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                          />
                        </svg>
                        Pause Newsletter
                      </button>
                    ) : (
                      <button
                        onClick={handleActivateNewsletter}
                        className="w-full flex items-center justify-center px-6 py-4 border-2 border-green-300 text-green-700 font-semibold rounded-2xl bg-green-50 hover:bg-green-100 hover:border-green-400 transform hover:scale-105 transition-all duration-300"
                      >
                        <svg
                          className="w-5 h-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Resume Newsletter
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl border border-blue-200/50 p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                <span className="mr-3 text-2xl">ℹ️</span>
                How it works
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                  <p className="text-slate-700 leading-relaxed">
                    Your newsletter is automatically generated based on your selected categories
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                  <p className="text-slate-700 leading-relaxed">
                    Newsletters are delivered to your email at 9 AM according to your chosen frequency
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                  <p className="text-slate-700 leading-relaxed">
                    You can pause or resume your newsletter at any time
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</div>
                  <p className="text-slate-700 leading-relaxed">
                    Update your preferences anytime to change categories or frequency
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Popup Message */}
      {popup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 ${
            popup.type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          }`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 p-3 rounded-2xl ${
                popup.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {popup.type === 'success' ? (
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="ml-4 w-0 flex-1">
                <h3 className={`text-xl font-bold ${
                  popup.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {popup.title}
                </h3>
                <div className={`mt-2 text-base ${
                  popup.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {popup.message}
                </div>
              </div>
              <div className="ml-4 pl-3">
                <button
                  onClick={() => setPopup(null)}
                  className="inline-flex p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
