import { notificationService } from "@/app/lib/notifications";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const success = await notificationService.sendNotification(
      "Test Notification",
      "This is a test notification from your comic reader app!",
      5
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send test notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Test notification sent successfully",
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}
