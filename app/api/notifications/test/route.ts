import { NotificationService } from "@/app/lib/notifications";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await NotificationService.sendNotification(
      "Test Notification",
      "This is a test notification from your comic reader app!"
    );

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
