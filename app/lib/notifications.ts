import { env } from "../env";

interface NotificationConfig {
  gotifyUrl: string;
  applicationToken: string;
}

class NotificationService {
  private config: NotificationConfig;

  constructor() {
    this.config = {
      gotifyUrl: env.GOTIFY_URL || "http://localhost:8081",
      applicationToken: env.GOTIFY_APP_TOKEN || "",
    };
  }

  async sendNotification(title: string, message: string, priority: number = 5) {
    console.log(env.GOTIFY_URL, env.GOTIFY_APP_TOKEN);
    console.log(this.config);
    if (!this.config.applicationToken) {
      console.error("Gotify application token is not configured");
      return false;
    }

    try {
      const response = await fetch(`${this.config.gotifyUrl}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Gotify-Key": this.config.applicationToken,
        },
        body: JSON.stringify({
          title,
          message,
          priority,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to send notification: ${response.statusText} - ${errorText}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
