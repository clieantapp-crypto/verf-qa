import { getMessaging, getToken, onMessage, isSupported, Messaging } from "firebase/messaging";
import { app } from "./firebase";
import { doc, getFirestore, setDoc, serverTimestamp } from "firebase/firestore";

const db = getFirestore(app);

let messaging: Messaging | null = null;

const getMessagingInstance = async () => {
  if (messaging) return messaging;
  
  const supported = await isSupported();
  if (!supported) {
    console.warn("Firebase Messaging is not supported in this browser");
    return null;
  }
  
  messaging = getMessaging(app);
  return messaging;
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) return null;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("VAPID key not configured");
      return null;
    }

    const token = await getToken(messagingInstance, { vapidKey });
    
    if (token) {
      console.log("FCM Token obtained:", token.slice(0, 20) + "...");
      await saveAdminFcmToken(token);
      return token;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

const saveAdminFcmToken = async (token: string) => {
  try {
    const tokenId = `admin_${Date.now()}`;
    await setDoc(doc(db, "admin_fcm_tokens", tokenId), {
      token,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error("Error saving FCM token:", error);
  }
};

export const setupForegroundMessageHandler = (onNotification: (payload: any) => void) => {
  getMessagingInstance().then((messagingInstance) => {
    if (!messagingInstance) return;
    
    onMessage(messagingInstance, (payload) => {
      console.log("Foreground message received:", payload);
      
      if (Notification.permission === "granted") {
        const notification = new Notification(
          payload.notification?.title || "إشعار جديد",
          {
            body: payload.notification?.body || "",
            icon: "/favicon.png",
            tag: "tawtheeq-foreground",
          }
        );
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
      
      onNotification(payload);
    });
  });
};

export const showLocalNotification = (title: string, body: string, onClick?: () => void) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  
  const notification = new Notification(title, {
    body,
    icon: "/favicon.png",
    tag: `tawtheeq-local-${Date.now()}`,
    requireInteraction: true,
  });
  
  if (onClick) {
    notification.onclick = () => {
      onClick();
      notification.close();
    };
  }
};
