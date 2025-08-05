import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(request: NextRequest) {
  try {
    // Check if Inngest is configured
    if (!process.env.INNGEST_SIGNING_KEY) {
      return NextResponse.json(
        { 
          error: "Inngest not configured", 
          message: "INNGEST_SIGNING_KEY environment variable is not set" 
        },
        { status: 500 }
      );
    }

    // Send a test event
    const { ids } = await inngest.send({
      name: "test.event",
      data: {
        message: "This is a test event",
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test event sent successfully",
      eventId: ids[0],
      inngestConfigured: true,
    });
  } catch (error) {
    console.error("Error sending test event:", error);
    return NextResponse.json(
      { 
        error: "Failed to send test event",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    inngestConfigured: !!process.env.INNGEST_SIGNING_KEY,
    signingKeyPresent: !!process.env.INNGEST_SIGNING_KEY,
    environment: process.env.NODE_ENV,
  });
}