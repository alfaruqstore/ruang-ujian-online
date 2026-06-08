/**
 * Firestore Real-time Centralized Database Synchronization Engine
 */

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch,
  DocumentData,
  QuerySnapshot
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { ExamPackage, Question, StudentAttempt, User } from "../types";

// Get active Firebase configuration (with custom user overrides from control panel)
let activeConfig = firebaseConfig;
try {
  const customConfigRaw = localStorage.getItem("KATA_KITA_CUSTOM_FIREBASE_CONFIG");
  if (customConfigRaw) {
    const parsed = JSON.parse(customConfigRaw);
    if (parsed && parsed.apiKey) {
      activeConfig = parsed;
    }
  }
} catch (e) {
  console.error("Failed to parse custom firebase config:", e);
}

// Ensure database ID is set if exists
const app = initializeApp(activeConfig);
export const db = getFirestore(app);

// Helper to chunk large arrays into smaller blocks to prevent Firestore 500 document limits
const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

// Custom Firestore Logger & error catcher wrapper
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

// ------------------- real-time subscription helpers -------------------

/**
 * Subscribe to exam packages collection
 */
export const subscribePackages = (onUpdate: (pkgs: ExamPackage[]) => void) => {
  const path = "packages";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ExamPackage[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as ExamPackage);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
};

/**
 * Subscribe to exam questions collection
 */
export const subscribeQuestions = (onUpdate: (qs: Question[]) => void) => {
  const path = "questions";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Question[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Question);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
};

/**
 * Subscribe to student exam attempts
 */
export const subscribeAttempts = (onUpdate: (attempts: StudentAttempt[]) => void) => {
  const path = "attempts";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: StudentAttempt[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as StudentAttempt);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
};

/**
 * Subscribe to custom user registration registry
 */
export const subscribeUserRegistry = (onUpdate: (users: User[]) => void) => {
  const path = "userRegistry";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: User[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as User);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
};

/**
 * Subscribe to global active locks configuration (and potential custom server configs)
 */
export const subscribeLocks = (onUpdate: (locks: { [key: string]: boolean }, customFirebaseConfig?: any) => void) => {
  const path = "locks";
  return onSnapshot(
    doc(db, path, "current"),
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onUpdate(data.locks || {}, data.customConfig || null);
      } else {
        onUpdate({}, null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${path}/current`);
    }
  );
};

// ------------------- Mutation helpers -------------------

/**
 * Set (overwrite or create) a single package document
 */
export const setFirebasePackage = async (pkg: ExamPackage) => {
  const path = "packages";
  try {
    await setDoc(doc(db, path, pkg.id), pkg);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${pkg.id}`);
  }
};

/**
 * Set multiple packages in chunks
 */
export const batchSetFirebasePackages = async (pkgs: ExamPackage[]) => {
  const path = "packages";
  try {
    const chunks = chunkArray(pkgs, 200);
    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((pkg) => {
        batch.set(doc(db, path, pkg.id), pkg);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Delete a package document
 */
export const deleteFirebasePackage = async (id: string) => {
  const path = "packages";
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
};

/**
 * Set (overwrite or create) a single question document
 */
export const setFirebaseQuestion = async (q: Question) => {
  const path = "questions";
  try {
    await setDoc(doc(db, path, q.id), q);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${q.id}`);
  }
};

/**
 * Set multiple questions in chunked batches
 */
export const batchSetFirebaseQuestions = async (qs: Question[]) => {
  const path = "questions";
  try {
    const chunks = chunkArray(qs, 150);
    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((q) => {
        batch.set(doc(db, path, q.id), q);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Delete a question document
 */
export const deleteFirebaseQuestion = async (id: string) => {
  const path = "questions";
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
};

/**
 * Save single attempt to Firestore
 */
export const setFirebaseAttempt = async (attempt: StudentAttempt) => {
  const path = "attempts";
  try {
    await setDoc(doc(db, path, attempt.id), attempt);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${attempt.id}`);
  }
};

/**
 * Set multiple attempts / results in chunked batches
 */
export const batchSetFirebaseAttempts = async (attempts: StudentAttempt[]) => {
  const path = "attempts";
  try {
    const chunks = chunkArray(attempts, 200);
    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((att) => {
        batch.set(doc(db, path, att.id), att);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Delete single attempt
 */
export const deleteFirebaseAttempt = async (id: string) => {
  const path = "attempts";
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
};

/**
 * Set student registry user profile to Firestore
 */
export const setFirebaseUser = async (user: User) => {
  const path = "userRegistry";
  try {
    await setDoc(doc(db, path, user.id), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${user.id}`);
  }
};

/**
 * Set multiple user accounts in chunked batches
 */
export const batchSetFirebaseUsers = async (users: User[]) => {
  const path = "userRegistry";
  try {
    const chunks = chunkArray(users, 200);
    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((u) => {
        batch.set(doc(db, path, u.id), u);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Save global active locks maps to Firestore
 */
export const setFirebaseLocks = async (locks: { [key: string]: boolean }) => {
  const path = "locks";
  try {
    // Preserve customConfig if any exists
    const tempApp = initializeApp(activeConfig, "tempPreserveLocksApp");
    const tempDb = getFirestore(tempApp);
    const docRef = doc(tempDb, path, "current");
    
    await setDoc(doc(db, path, "current"), { id: "current", locks }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/current`);
  }
};

/**
 * Synchronize custom Firebase configuration to default database's locks/current
 */
import { getFirestore as getFirestoreRaw, doc as docRaw, setDoc as setDocRaw, getDoc as getDocRaw } from "firebase/firestore";
import { initializeApp as initializeAppRaw } from "firebase/app";

export const saveCustomFirebaseToDefault = async (customConfig: any) => {
  try {
    const tempDefaultApp = initializeAppRaw(firebaseConfig, "tempDefaultSyncApp_" + Date.now());
    const tempDefaultDb = getFirestoreRaw(tempDefaultApp);
    
    const docRef = docRaw(tempDefaultDb, "locks", "current");
    const docSnap = await getDocRaw(docRef);
    
    let currentLocks = {};
    if (docSnap.exists()) {
      currentLocks = docSnap.data().locks || {};
    }
    
    await setDocRaw(docRef, {
      id: "current",
      locks: currentLocks,
      customConfig: customConfig
    });
    console.log("Successfully synchronized custom Firebase config to locks/current in default database.");
  } catch (error) {
    console.error("Failed to synchronize custom Firebase configuration to default database:", error);
  }
};

/**
 * Clear custom Firebase configuration from default database's locks/current
 */
export const clearCustomFirebaseFromDefault = async () => {
  try {
    const tempDefaultApp = initializeAppRaw(firebaseConfig, "tempDefaultClearApp_" + Date.now());
    const tempDefaultDb = getFirestoreRaw(tempDefaultApp);
    
    const docRef = docRaw(tempDefaultDb, "locks", "current");
    const docSnap = await getDocRaw(docRef);
    
    let currentLocks = {};
    if (docSnap.exists()) {
      currentLocks = docSnap.data().locks || {};
    }
    
    await setDocRaw(docRef, {
      id: "current",
      locks: currentLocks,
      customConfig: null
    });
    console.log("Successfully cleared custom Firebase config from locks/current in default database.");
  } catch (error) {
    console.error("Failed to clear custom Firebase config from default database:", error);
  }
};
