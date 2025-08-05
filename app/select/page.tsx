"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
	{
		id: "technology",
		name: "Technology",
		description: "Latest tech news and innovations",
		icon: "💻",
	},
	{
		id: "business",
		name: "Business",
		description: "Business trends and market updates",
		icon: "📈",
	},
	{ 
		id: "sports", 
		name: "Sports", 
		description: "Sports news and highlights",
		icon: "⚽",
	},
	{
		id: "entertainment",
		name: "Entertainment",
		description: "Movies, TV, and celebrity news",
		icon: "🎬",
	},
	{
		id: "science",
		name: "Science",
		description: "Scientific discoveries and research",
		icon: "🔬",
	},
	{ 
		id: "health", 
		name: "Health", 
		description: "Health and wellness updates",
		icon: "🏥",
	},
	{
		id: "politics",
		name: "Politics",
		description: "Political news and current events",
		icon: "🏛️",
	},
	{
		id: "environment",
		name: "Environment",
		description: "Climate and environmental news",
		icon: "🌱",
	},
];

const frequencyOptions = [
	{ id: "daily", name: "Daily", description: "Every day", icon: "📅" },
	{ id: "weekly", name: "Weekly", description: "Once a week", icon: "📆" },
	{ id: "biweekly", name: "Bi-weekly", description: "Twice a week", icon: "📊" },
];

interface PopupMessage {
	type: 'success' | 'error';
	title: string;
	message: string;
}

export default function SelectPage() {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedFrequency, setSelectedFrequency] = useState<string>("weekly");
	const [isLoading, setIsLoading] = useState(false);
	const [popup, setPopup] = useState<PopupMessage | null>(null);
	const router = useRouter();
	const { user } = useAuth();

	const handleCategoryToggle = (categoryId: string) => {
		setSelectedCategories((prev) =>
			prev.includes(categoryId)
				? prev.filter((id) => id !== categoryId)
				: [...prev, categoryId]
		);
	};

	const showPopup = (type: 'success' | 'error', title: string, message: string) => {
		setPopup({ type, title, message });
		setTimeout(() => setPopup(null), 5000);
	};

	const handleSavePreferences = async (e: React.FormEvent) => {
		e.preventDefault();

		if (selectedCategories.length === 0) {
			showPopup('error', 'Selection Required', 'Please select at least one category');
			return;
		}

		if (!user) {
			showPopup('error', 'Authentication Required', 'Please sign in to continue');
			return;
		}

		setIsLoading(true);

		// Debug logging
		console.log("Saving preferences:", {
			categories: selectedCategories,
			frequency: selectedFrequency,
			email: user.email
		});

		try {
			const response = await fetch("/api/user-preferences", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					categories: selectedCategories,
					frequency: selectedFrequency,
					email: user.email,
				}),
			});

			const data = await response.json();

			console.log("API Response:", { status: response.status, data });

			if (!response.ok) {
				throw new Error(data.error || "Failed to save preferences");
			}

			showPopup(
				'success',
				'Preferences Saved!',
				'Your newsletter preferences have been saved! You\'ll start receiving newsletters according to your schedule.'
			);

			setTimeout(() => {
				router.push("/dashboard");
			}, 2000);

		} catch (error) {
			console.error("Error:", error);
			showPopup(
				'error',
				'Save Failed',
				error instanceof Error ? error.message : 'Failed to save preferences. Please try again.'
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		router.back();
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
			</div>

			<div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
				{/* Back Button */}
				<div className="max-w-4xl mx-auto mb-8">
					<button
						onClick={handleBack}
						className="group flex items-center text-slate-600 hover:text-slate-800 font-medium transition-all duration-200 hover:scale-105"
					>
						<div className="mr-2 p-1 rounded-full bg-white/80 backdrop-blur-sm group-hover:bg-white transition-all duration-200">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</div>
						Back
					</button>
				</div>

				<div className="max-w-5xl mx-auto">
					{/* Header Section */}
					<div className="text-center mb-12">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
							Customize Your Newsletter
						</h1>
						<p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
							Select your interests and delivery frequency to start receiving
							personalized newsletters tailored just for you
						</p>
					</div>

					<form onSubmit={handleSavePreferences} className="space-y-8">
						{/* Categories Section */}
						<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
							<div className="mb-8">
								<h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
									<span className="mr-3 text-2xl">📚</span>
									Choose Your Categories
								</h2>
								<p className="text-slate-600 text-lg">
									Select the topics you'd like to see in your personalized newsletter
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
								{categories.map((category) => (
									<label
										key={category.id}
										className={`group relative flex items-start p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
											selectedCategories.includes(category.id)
												? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
												: "border-slate-200 hover:border-slate-300 bg-white/60 hover:bg-white/80"
										}`}
									>
										<input
											type="checkbox"
											className="sr-only"
											checked={selectedCategories.includes(category.id)}
											onChange={() => handleCategoryToggle(category.id)}
										/>
										<div className="flex items-center h-6">
											<div
												className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
													selectedCategories.includes(category.id)
														? "border-blue-500 bg-blue-500 shadow-md"
														: "border-slate-300 group-hover:border-blue-400"
												}`}
											>
												{selectedCategories.includes(category.id) && (
													<svg
														className="w-4 h-4 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												)}
											</div>
										</div>
										<div className="ml-4 flex-1">
											<div className="flex items-center mb-2">
												<span className="text-2xl mr-3">{category.icon}</span>
												<div className="text-lg font-semibold text-slate-900">
													{category.name}
												</div>
											</div>
											<div className="text-slate-600 leading-relaxed">
												{category.description}
											</div>
										</div>
									</label>
								))}
							</div>

							<div className="text-center">
								<div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full border border-blue-200/50">
									<span className="text-sm font-medium text-blue-700">
										{selectedCategories.length} categor
										{selectedCategories.length !== 1 ? "ies" : "y"} selected
									</span>
								</div>
							</div>
						</div>

						{/* Frequency Section */}
						<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
							<div className="mb-8">
								<h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
									<span className="mr-3 text-2xl">⏰</span>
									Delivery Frequency
								</h2>
								<p className="text-slate-600 text-lg">
									How often would you like to receive your newsletter?
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{frequencyOptions.map((frequency) => (
									<label
										key={frequency.id}
										className={`group relative flex items-start p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
											selectedFrequency === frequency.id
												? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
												: "border-slate-200 hover:border-slate-300 bg-white/60 hover:bg-white/80"
										}`}
									>
										<input
											type="radio"
											name="frequency"
											className="sr-only"
											checked={selectedFrequency === frequency.id}
											onChange={() => setSelectedFrequency(frequency.id)}
										/>
										<div className="flex items-center h-6">
											<div
												className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${
													selectedFrequency === frequency.id
														? "border-blue-500 bg-blue-500 shadow-md"
														: "border-slate-300 group-hover:border-blue-400"
												}`}
											>
												{selectedFrequency === frequency.id && (
													<div className="w-3 h-3 bg-white rounded-full"></div>
												)}
											</div>
										</div>
										<div className="ml-4 flex-1">
											<div className="flex items-center mb-2">
												<span className="text-2xl mr-3">{frequency.icon}</span>
												<div className="text-lg font-semibold text-slate-900">
													{frequency.name}
												</div>
											</div>
											<div className="text-slate-600 leading-relaxed">
												{frequency.description}
											</div>
										</div>
									</label>
								))}
							</div>
						</div>

						{/* Submit Section */}
						<div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl border border-blue-200/50 p-8">
							<div className="flex flex-col sm:flex-row items-center justify-between gap-6">
								<div className="text-center sm:text-left">
									<div className="text-sm text-slate-600 mb-1">Summary</div>
									<div className="text-lg font-semibold text-slate-900">
										{selectedCategories.length} categor
										{selectedCategories.length !== 1 ? "ies" : "y"} selected • {selectedFrequency} delivery
									</div>
								</div>
								<button
									type="submit"
									disabled={isLoading || selectedCategories.length === 0}
									className={`px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 ${
										isLoading || selectedCategories.length === 0
											? "bg-slate-400 cursor-not-allowed shadow-none"
											: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
									}`}
								>
									{isLoading ? (
										<>
											<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Saving...
										</>
									) : (
										<>
											<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											Save Preferences
										</>
									)}
								</button>
							</div>
						</div>
					</form>
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
			{selectedCategories.length === 0 && (
				<div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-3xl shadow-md max-w-md w-full p-6">
						<div className="text-center">
							<svg className="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l2-2m-2 2h18M9 12l2-2m0 0l2-2m-2 2h10M15 12l2-2m0 0l2-2m-2 2h6" />
							</svg>
							<h2 className="text-xl font-bold text-slate-900 mb-2">
								No Categories Selected
							</h2>
							<p className="text-slate-600 text-sm mb-4">
								You don&apos;t have any preferences selected.
							</p>
							<button
								onClick={() => router.push("/dashboard")}
								className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold transition-all duration-300 hover:from-blue-600 hover:to-indigo-600"
							>
								Go to Dashboard
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
