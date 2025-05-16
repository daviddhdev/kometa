"use server";

import { cookies } from "next/headers";
import webpush, { PushSubscription } from "web-push";

webpush.setVapidDetails(
  `mailto:${process.env.NEXT_PUBLIC_VAPID_EMAIL!}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Store subscription in DB via API
export async function subscribeUser(sub: PushSubscription) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  console.log("Subscribing user with data:", {
    endpoint: sub.endpoint,
    keys: sub.keys,
    token: token ? "present" : "missing",
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/push-subscription`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_token=${token}`,
      },
      body: JSON.stringify(sub),
    }
  );

  const responseText = await res.text();
  console.log("Subscription response:", {
    status: res.status,
    ok: res.ok,
    response: responseText,
  });

  if (!res.ok) {
    return { success: false, error: responseText };
  }
  return { success: true };
}

// Remove subscription from DB via API
export async function unsubscribeUser(endpoint: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/push-subscription`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_token=${token}`,
      },
      body: JSON.stringify({ endpoint }),
    }
  );
  if (!res.ok) {
    return { success: false, error: await res.text() };
  }
  return { success: true };
}

// Send notification to all subscriptions in DB
export async function sendNotification(message: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  // Fetch all subscriptions for the current user
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/push-subscription`,
    {
      method: "GET",
      headers: {
        Cookie: `auth_token=${token}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch subscriptions");
  }
  // Use 'any' type for DB objects to avoid linter error
  const subscriptions: any[] = await res.json();
  if (!subscriptions.length) {
    throw new Error("No subscription available");
  }

  let allSuccess = true;
  for (const sub of subscriptions) {
    try {
      const formattedSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };
      await webpush.sendNotification(
        formattedSub,
        JSON.stringify({
          title: "Kometa",
          body: message,
          icon: "/icon-192x192.png",
        })
      );
    } catch (error) {
      allSuccess = false;
      console.error("Error sending push notification:", error);
    }
  }
  return { success: allSuccess };
}
