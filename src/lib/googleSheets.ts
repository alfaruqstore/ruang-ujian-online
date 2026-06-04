/**
 * Google Sheets API Integration with Firebase Authentication
 * Handles sign-in and direct REST api interaction.
 */

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Get active config (prioritize localStorage custom config if user configured one for self-hosting)
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

// Initialize Firebase
const app = initializeApp(activeConfig);
export const auth = getAuth(app);

// Configure Google OAuth Provider with Sheets scope
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/spreadsheets");
// Force Account Selection Choice Pop-up to solve selection issue
provider.setCustomParameters({ prompt: "select_account" });

// In-memory access token cache with persistent local storage backing
let cachedAccessToken: string | null = localStorage.getItem("KATA_KITA_GOOGLE_ACCESS_TOKEN") || null;
let authStateListenerInitialized = false;

/**
 * Initialize Google Sheets authentication state change listener
 */
export const initSheetsAuth = (
  onSuccess: (user: User, token: string) => void,
  onFailure: () => void
) => {
  if (authStateListenerInitialized) return;
  authStateListenerInitialized = true;
  
  onAuthStateChanged(auth, (user) => {
    const savedToken = localStorage.getItem("KATA_KITA_GOOGLE_ACCESS_TOKEN");
    if (user && savedToken) {
      cachedAccessToken = savedToken;
      onSuccess(user, savedToken);
    } else {
      cachedAccessToken = null;
      localStorage.removeItem("KATA_KITA_GOOGLE_ACCESS_TOKEN");
      onFailure();
    }
  });
};

/**
 * Sign in using Google Auth popup and request Google Sheets read/write permissions
 */
export const signInWithGoogleSheets = async (): Promise<{ user: User; token: string } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential || !credential.accessToken) {
      throw new Error("Gagal memperoleh token akses Google Sheets.");
    }
    cachedAccessToken = credential.accessToken;
    localStorage.setItem("KATA_KITA_GOOGLE_ACCESS_TOKEN", credential.accessToken);
    return { user: result.user, token: cachedAccessToken };
  } catch (err: any) {
    console.error("Gagal login dengan Google Sheets:", err);
    throw err;
  }
};

/**
 * Log out of active Google session
 */
export const logoutGoogleSheets = async () => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
    localStorage.removeItem("KATA_KITA_GOOGLE_ACCESS_TOKEN");
  } catch (err) {
    console.error("Gagal melakukan penutupan sesi Google:", err);
  }
};

/**
 * Retrieve current cached access token or return null
 */
export const getSheetsAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Create a new Google Spreadsheet and fill it with designated headers and rows of data.
 * @returns The public URL of the created Google Sheet.
 */
export const exportToGoogleSheets = async (
  title: string,
  headers: string[],
  rows: any[][]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const token = getSheetsAccessToken();
  if (!token) {
    throw new Error("Silakan hubungkan akun Google Sheets Anda terlebih dahulu.");
  }

  // Phase 1: Create a new blank Google Spreadsheet
  const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
    }),
  });

  if (!createResponse.ok) {
    const errData = await createResponse.json();
    throw new Error(errData?.error?.message || "Gagal membuat dokumen Google Sheets baru.");
  }

  const sheetData = await createResponse.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // Phase 2: Add headers and rows to Sheet1
  const values = [headers, ...rows];
  const writeResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        values: values,
      }),
    }
  );

  if (!writeResponse.ok) {
    const errData = await writeResponse.json();
    throw new Error(errData?.error?.message || "Gagal mengisi data ke halaman dokumen Google Sheets.");
  }

  return { spreadsheetId, spreadsheetUrl };
};

/**
 * Membaca data dari rentang sel tertentu pada Google Spreadsheet yang sudah ada
 */
export const readGoogleSheetValues = async (
  spreadsheetId: string,
  range: string
): Promise<any[][] | null> => {
  const token = getSheetsAccessToken();
  if (!token) {
    throw new Error("Silakan hubungkan akun Google Sheets Anda terlebih dahulu.");
  }
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errData = await response.json();
      throw new Error(errData?.error?.message || "Gagal mengunduh data dari Google Sheets.");
    }
    const data = await response.json();
    return data.values || [];
  } catch (err: any) {
    console.error("Gagal membaca dari Google Sheets:", err);
    throw err;
  }
};

/**
 * Menulis atau menimpa data ke rentang sel tertentu pada Google Spreadsheet yang sudah ada
 */
export const updateGoogleSheetValues = async (
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<{ spreadsheetId: string; updatedCells: number }> => {
  const token = getSheetsAccessToken();
  if (!token) {
    throw new Error("Silakan hubungkan akun Google Sheets Anda terlebih dahulu.");
  }

  // Jika sheet belum ada, Google API akan otomatis membuatnya saat rentang sel baru ditulis.
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        values: values,
      }),
    }
  );

  if (!response.ok) {
    // Jika gagal, coba buat tab sheet barunya dlu jika error terjadi karena rujukan sheet yg tidak valid
    const errData = await response.json();
    throw new Error(
      errData?.error?.message || "Gagal menulis data ke Google Sheets. Pastikan hak akses file sesuai."
    );
  }

  const result = await response.json();
  return {
    spreadsheetId,
    updatedCells: result.updatedCells || 0
  };
};

/**
 * Memastikan tab sheet (misal: "Rekap Nilai") ada di Spreadsheet. 
 * Jika belum ada, maka akan ditambahkan secara dinamis.
 */
export const ensureSheetTabExists = async (spreadsheetId: string, tabTitle: string): Promise<void> => {
  const token = getSheetsAccessToken();
  if (!token) return;

  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: tabTitle,
              },
            },
          },
        ],
      }),
    });
    // Jika status ok atau tab sudah ada (akan dibatasi ignore), anggap sukses
    if (!response.ok) {
      console.warn("ensureSheetTabExists info (Tab mungkin sudah ada):", await response.text());
    }
  } catch (e) {
    console.error("Gagal memastikan tab sheet:", e);
  }
};

