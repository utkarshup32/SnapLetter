import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inngest, safeInngestSend } from "@/inngest/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Get the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to save preferences." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { categories, frequency, email } = body;

    console.log("Received preferences data:", { categories, frequency, email });

    // Validate frequency
    const validFrequencies = ['daily', 'weekly', 'biweekly'];
    if (!validFrequencies.includes(frequency)) {
      console.error("Invalid frequency:", frequency);
      return NextResponse.json(
        { error: `Invalid frequency: ${frequency}. Must be one of: ${validFrequencies.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate categories
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: "At least one category must be selected" },
        { status: 400 }
      );
    }

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    console.log("Validation passed, saving to database...");

    // Check if user already has preferences
    const { data: existingPreferences, error: checkError } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking existing preferences:", checkError);
      return NextResponse.json(
        { error: "Database error while checking preferences" },
        { status: 500 }
      );
    }

    let data;
    let upsertError;

    if (existingPreferences) {
      // Update existing preferences
      console.log("Updating existing preferences...");
      const { data: updateData, error: updateError } = await supabase
        .from("user_preferences")
        .update({
          categories: categories,
          frequency: frequency,
          email: email,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();
      
      data = updateData;
      upsertError = updateError;
    } else {
      // Insert new preferences
      console.log("Creating new preferences...");
      const { data: insertData, error: insertError } = await supabase
        .from("user_preferences")
        .insert({
          user_id: user.id,
          categories: categories,
          frequency: frequency,
          email: email,
          is_active: true,
        })
        .select()
        .single();
      
      data = insertData;
      upsertError = insertError;
    }

    if (upsertError) {
      console.error("Database error:", upsertError);
      
      // Check if it's a constraint violation
      if (upsertError.code === '23514') {
        return NextResponse.json(
          { error: `Invalid frequency value: ${frequency}. Please select a valid frequency.` },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to save preferences: ${upsertError.message}` },
        { status: 500 }
      );
    }

    console.log("Successfully saved preferences:", data);

    // Schedule the first newsletter based on frequency
    let scheduleTime: Date;
    const now = new Date();

    console.log("Calculating schedule time for frequency:", frequency);

    switch (frequency) {
      case "daily":
        // Schedule for tomorrow at 9 AM
        scheduleTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        scheduleTime.setHours(9, 0, 0, 0);
        console.log("Scheduled for daily at:", scheduleTime.toISOString());
        break;
      case "weekly":
        // Schedule for next week on the same day at 9 AM
        scheduleTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        scheduleTime.setHours(9, 0, 0, 0);
        console.log("Scheduled for weekly at:", scheduleTime.toISOString());
        break;
      case "biweekly":
        // Schedule for 3 days from now at 9 AM
        scheduleTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        scheduleTime.setHours(9, 0, 0, 0);
        console.log("Scheduled for biweekly at:", scheduleTime.toISOString());
        break;
      default:
        scheduleTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        scheduleTime.setHours(9, 0, 0, 0);
        console.log("Scheduled for default (weekly) at:", scheduleTime.toISOString());
    }

    // Check if Inngest is properly configured
    if (!process.env.INNGEST_SIGNING_KEY) {
      console.warn("INNGEST_SIGNING_KEY not set, skipping newsletter scheduling");
      return NextResponse.json({
        success: true,
        message: "Preferences saved (newsletter scheduling skipped - missing Inngest key)",
      });
    }

    // Send event to Inngest to schedule the newsletter using the safe function
    const inngestResult = await safeInngestSend({
      name: "newsletter.schedule",
      data: {
        userId: user.id,
        email: email,
        categories: categories,
        frequency: frequency,
        scheduledFor: scheduleTime.toISOString(),
        isTest: true,
      },
    });

    if (inngestResult.success) {
      console.log("Inngest event sent successfully:", inngestResult.ids);
      return NextResponse.json({
        success: true,
        message: "Preferences saved and newsletter scheduled",
      });
    } else {
      console.warn("Inngest event failed, but preferences were saved:", inngestResult.error);
      return NextResponse.json({
        success: true,
        message: "Preferences saved (newsletter scheduling failed)",
        warning: inngestResult.error,
      });
    }
  } catch (error) {
    console.error("Error in user-preferences API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  // Get the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to update preferences." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { is_active } = body;

    // Update user preferences
    const { error: updateError } = await supabase
      .from("user_preferences")
      .update({ is_active })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating preferences:", updateError);
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    // If deactivating the newsletter, cancel all scheduled functions for this user
    if (!is_active) {
      try {
        // Cancel all pending newsletter.schedule events for this user
        await cancelUserNewsletterEvents(user.id);
      } catch (cancelError) {
        console.error("Error canceling scheduled events:", cancelError);
        // Don't fail the request if cancellation fails, just log it
      }
    } else {
      // If reactivating the newsletter, schedule the next one
      try {
        await rescheduleUserNewsletter(user.id);
      } catch (rescheduleError) {
        console.error("Error rescheduling newsletter:", rescheduleError);
        // Don't fail the request if rescheduling fails, just log it
      }
    }

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Error in user-preferences PATCH API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Function to cancel all scheduled newsletter events for a user
async function cancelUserNewsletterEvents(userId: string) {
  const INNGEST_API =
    process.env.NODE_ENV === "production"
      ? "https://api.inngest.com/v1"
      : "http://localhost:8288/v1";

  try {
    // Get all events for this user
    const response = await fetch(`${INNGEST_API}/events`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const events = await response.json();

    // Filter events for this user that are newsletter.schedule events
    // 203: Suppress 'any' warning if you use 'any' for event data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userNewsletterEvents =
      events.data?.filter(
        (event: any) =>
          event.name === "newsletter.schedule" && event.data?.userId === userId
      ) || [];

    console.log(
      `Found ${userNewsletterEvents.length} newsletter events for user ${userId}`
    );

    // Log the events that would be affected
    for (const event of userNewsletterEvents) {
      console.log(
        `Event ${event.id} scheduled for ${new Date(event.ts).toISOString()}`
      );
    }

    // Note: We can't actually cancel events via API, but the function will check
    // the user's is_active status and exit early if they've paused their newsletter
    console.log(
      `User ${userId} newsletter paused. Existing events will be skipped when they run.`
    );
  } catch (error) {
    console.error("Error in cancelUserNewsletterEvents:", error);
    throw error;
  }
}

// Function to reschedule newsletter for a user when they reactivate
async function rescheduleUserNewsletter(userId: string) {
  try {
    const supabase = await createClient();

    // Get user preferences
    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .select("categories, frequency, email")
      .eq("user_id", userId)
      .single();

    if (error || !preferences) {
      throw new Error("User preferences not found");
    }

    // Calculate next schedule time
    const now = new Date();
    let nextScheduleTime: Date;

    switch (preferences.frequency) {
      case "daily":
        nextScheduleTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "weekly":
        nextScheduleTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "biweekly":
        nextScheduleTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        break;
      default:
        nextScheduleTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    nextScheduleTime.setHours(9, 0, 0, 0);

    // Check if Inngest is properly configured before sending events
    if (!process.env.INNGEST_SIGNING_KEY && process.env.NODE_ENV === "production") {
      console.warn("INNGEST_SIGNING_KEY not set in production, skipping newsletter scheduling");
      return;
    }

    // Schedule the next newsletter with error handling using the safe function
    const inngestResult = await safeInngestSend({
      name: "newsletter.schedule",
      data: {
        userId: userId,
        email: preferences.email,
        categories: preferences.categories,
        frequency: preferences.frequency,
      },
      ts: nextScheduleTime.getTime(),
    });

    if (inngestResult.success) {
      console.log(
        `Rescheduled newsletter for user ${userId} at ${nextScheduleTime.toISOString()}`
      );
    } else {
      console.warn("Failed to reschedule newsletter:", inngestResult.error);
    }
  } catch (error) {
    console.error("Error in rescheduleUserNewsletter:", error);
    // Don't throw the error - just log it
    // This prevents the entire PATCH request from failing
  }
}

export async function GET() {
  const supabase = await createClient();

  // Get the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to fetch preferences." },
      { status: 401 }
    );
  }

  try {
    // Get user preferences
    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error fetching preferences:", error);
      return NextResponse.json(
        { error: "Failed to fetch preferences" },
        { status: 500 }
      );
    }

    if (!preferences) {
      return NextResponse.json(
        { error: "No preferences found" },
        { status: 404 }
      );
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error in user-preferences GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
