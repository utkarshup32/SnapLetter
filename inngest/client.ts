import { Inngest } from "inngest";

// Create the Inngest client with better error handling
export const inngest = new Inngest({
  id: "personalized-newsletter",
  name: "Personalized Newsletter Generator",
  signingKey: process.env.NODE_ENV === "production" 
    ? process.env.INNGEST_SIGNING_KEY 
    : "dev", // Use "dev" for local development
});

// Validate Inngest configuration and provide helpful debugging info
if (process.env.NODE_ENV === "production" && !process.env.INNGEST_SIGNING_KEY) {
  console.warn("⚠️  INNGEST_SIGNING_KEY is not set. Inngest functions may not work properly in production.");
} else if (process.env.NODE_ENV !== "production") {
  console.log("🔧 Inngest configured for development with 'dev' signing key");
  console.log("📝 To test Inngest locally, make sure the Inngest dev server is running: npx inngest dev");
}

// Helper function to safely send Inngest events
export async function safeInngestSend(event: any) {
  try {
    // Check if we're in development and Inngest dev server might not be running
    if (process.env.NODE_ENV !== "production") {
      console.log("🔄 Attempting to send Inngest event:", event.name);
    }
    
    const result = await inngest.send(event);
    
    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Inngest event sent successfully:", result.ids);
    }
    
    return { success: true, ids: result.ids };
  } catch (error) {
    console.error("❌ Failed to send Inngest event:", error);
    
    // Provide helpful error messages
    if (error instanceof Error && error.message.includes("401")) {
      console.error("🔑 Inngest signing key issue detected. Check your INNGEST_SIGNING_KEY configuration.");
      if (process.env.NODE_ENV !== "production") {
        console.error("💡 For local development, make sure the Inngest dev server is running: npx inngest dev");
      }
    }
    
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
