import webpush from "web-push";

webpush.setVapidDetails(
  `mailto:${process.env.NEXT_PUBLIC_VAPID_EMAIL!}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let subscription: webpush.PushSubscription | null = null;

export class NotificationService {
  static setSubscription(sub: webpush.PushSubscription) {
    subscription = sub;
  }

  static clearSubscription() {
    subscription = null;
  }

  static async sendNotification(title: string, message: string) {
    if (!subscription) {
      console.error("No push subscription available");
      return;
    }

    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title,
          body: message,
          icon: "/icon-192x192.png",
        })
      );
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }
}
