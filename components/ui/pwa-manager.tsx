"use client";

import {
  sendNotification,
  subscribeUser,
  unsubscribeUser,
} from "@/app/actions";
import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PWAManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }

    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser(subscription?.endpoint as string);
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage("");
    }
  }

  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg">
      {!isStandalone && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Install App</h3>
          {isIOS && (
            <p className="text-sm text-gray-600">
              To install this app on your iOS device, tap the share button
              <span role="img" aria-label="share icon">
                {" "}
                ⎋{" "}
              </span>
              and then &quot;Add to Home Screen&quot;
              <span role="img" aria-label="plus icon">
                {" "}
                ➕{" "}
              </span>
            </p>
          )}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
        {subscription ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              You are subscribed to push notifications.
            </p>
            <button
              onClick={unsubscribeFromPush}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Unsubscribe
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="px-2 py-1 border rounded"
              />
              <button
                onClick={sendTestNotification}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Send Test
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              You are not subscribed to push notifications.
            </p>
            <button
              onClick={subscribeToPush}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Subscribe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
