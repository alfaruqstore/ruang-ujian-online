/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import * as mammoth from "mammoth";
import { ExamPackage, Question, SubExamConfig, APP_THEMES } from "../types";
import { 
  initSheetsAuth, 
  signInWithGoogleSheets, 
  logoutGoogleSheets, 
  exportToGoogleSheets,
  updateGoogleSheetValues,
  ensureSheetTabExists
} from "../lib/googleSheets";
import { User as FirebaseUser } from "firebase/auth";

export const getPackageColorStyles = (index: number) => {
  const schemes = [
    {
      border: "border-blue-200",
      bg: "bg-blue-50/20",
      accent: "text-blue-700 bg-blue-50/80 border-blue-200",
      badge: "bg-blue-600",
      hoverBg: "hover:bg-blue-100/50",
      btnBg: "bg-blue-500 hover:bg-blue-600 text-white",
      leftBorder: "border-l-4 border-l-blue-500",
      text: "text-blue-900"
    },
    {
      border: "border-emerald-200",
      bg: "bg-emerald-50/20",
      accent: "text-emerald-700 bg-emerald-50/80 border-emerald-200",
      badge: "bg-emerald-600",
      hoverBg: "hover:bg-emerald-100/50",
      btnBg: "bg-emerald-500 hover:bg-emerald-600 text-white",
      leftBorder: "border-l-4 border-l-emerald-500",
      text: "text-emerald-950"
    },
    {
      border: "border-orange-200",
      bg: "bg-orange-50/20",
      accent: "text-orange-700 bg-orange-50/80 border-orange-200",
      badge: "bg-orange-600",
      hoverBg: "hover:bg-orange-100/50",
      btnBg: "bg-orange-550 hover:bg-orange-600 text-white",
      leftBorder: "border-l-4 border-l-orange-500",
      text: "text-orange-950"
    },
    {
      border: "border-violet-200",
      bg: "bg-violet-50/20",
      accent: "text-violet-700 bg-violet-50/80 border-violet-200",
      badge: "bg-violet-600",
      hoverBg: "hover:bg-violet-100/50",
      btnBg: "bg-violet-500 hover:bg-violet-600 text-white",
      leftBorder: "border-l-4 border-l-violet-500",
      text: "text-violet-950"
    },
    {
      border: "border-pink-200",
      bg: "bg-pink-50/20",
      accent: "text-pink-700 bg-pink-50/80 border-pink-200",
      badge: "bg-pink-600",
      hoverBg: "hover:bg-pink-100/50",
      btnBg: "bg-pink-500 hover:bg-pink-600 text-white",
      leftBorder: "border-l-4 border-l-pink-500",
      text: "text-pink-950"
    },
    {
      border: "border-amber-200",
      bg: "bg-amber-50/20",
      accent: "text-amber-700 bg-amber-50/80 border-amber-200",
      badge: "bg-amber-600",
      hoverBg: "hover:bg-amber-100/50",
      btnBg: "bg-amber-500 hover:bg-amber-600 text-white",
      leftBorder: "border-l-4 border-l-amber-500",
      text: "text-amber-950"
    },
    {
      border: "border-cyan-200",
      bg: "bg-cyan-50/20",
      accent: "text-cyan-700 bg-cyan-50/80 border-cyan-200",
      badge: "bg-cyan-600",
      hoverBg: "hover:bg-cyan-100/50",
      btnBg: "bg-cyan-500 hover:bg-cyan-600 text-white",
      leftBorder: "border-l-4 border-l-cyan-500",
      text: "text-cyan-950"
    },
    {
      border: "border-teal-200",
      bg: "bg-teal-50/20",
      accent: "text-teal-700 bg-teal-50/80 border-teal-200",
      badge: "bg-teal-600",
      hoverBg: "hover:bg-teal-100/50",
      btnBg: "bg-teal-500 hover:bg-teal-600 text-white",
      leftBorder: "border-l-4 border-l-teal-500",
      text: "text-teal-950"
    },
    {
      border: "border-fuchsia-200",
      bg: "bg-fuchsia-50/20",
      accent: "text-fuchsia-700 bg-fuchsia-50/80 border-fuchsia-200",
      badge: "bg-fuchsia-600",
      hoverBg: "hover:bg-fuchsia-100/50",
      btnBg: "bg-fuchsia-500 hover:bg-fuchsia-600 text-white",
      leftBorder: "border-l-4 border-l-fuchsia-500",
      text: "text-fuchsia-950"
    },
    {
      border: "border-rose-200",
      bg: "bg-rose-50/20",
      accent: "text-rose-700 bg-rose-50/80 border-rose-200",
      badge: "bg-rose-600",
      hoverBg: "hover:bg-rose-100/50",
      btnBg: "bg-rose-500 hover:bg-rose-600 text-white",
      leftBorder: "border-l-4 border-l-rose-500",
      text: "text-rose-950"
    }
  ];
  return schemes[index % schemes.length];
};

interface AdminDashboardProps {
  user: { fullname: string; email: string; photoUrl?: string };
  packages: ExamPackage[];
  questions: Question[];
  onAddQuestion: (q: Question) => void;
  onAddBulkQuestions: (qs: Question[]) => void;
  onLogout: () => void;
  attempts: any[];
  onUpdatePackages?: (updated: ExamPackage[]) => void;
  onUpdateAttempts?: (updatedAttempts: any[]) => void;
  onUpdateQuestions?: (updatedQuestions: Question[]) => void;
  onUpdateUser?: (updatedUser: any) => void;
  themeId?: string;
  onThemeChange?: (themeId: string) => void;
}

export function splitTextAtMiddle(text: string): [string, string] {
  if (!text) return ["", ""];
  
  // Try splitting by newline first
  const newlines = text.split("\n");
  if (newlines.length > 1) {
    const half = Math.ceil(newlines.length / 2);
    const part1 = newlines.slice(0, half).join("\n");
    const part2 = newlines.slice(half).join("\n");
    return [part1, part2];
  }
  
  // Try splitting by a sentence boundary (period followed by space)
  const sentences = text.split(/(?<=\. )/);
  if (sentences.length > 1) {
    const half = Math.ceil(sentences.length / 2);
    const part1 = sentences.slice(0, half).join("");
    const part2 = sentences.slice(half).join("");
    return [part1, part2];
  }

  // If no sentences or newlines, split approximately by words (midpoint of words)
  const words = text.split(" ");
  if (words.length > 4) {
    const half = Math.ceil(words.length / 2);
    const part1 = words.slice(0, half).join(" ");
    const part2 = words.slice(half).join(" ");
    return [part1, part2];
  }

  // Otherwise, just split the string in half
  const mid = Math.floor(text.length / 2);
  return [text.substring(0, mid), text.substring(mid)];
}

export default function AdminDashboard({
  user,
  packages: initialPackages,
  questions: initialQuestions,
  onAddQuestion,
  onAddBulkQuestions,
  onLogout,
  attempts,
  onUpdatePackages,
  onUpdateAttempts,
  onUpdateQuestions,
  onUpdateUser,
  themeId = "ocean",
  onThemeChange
}: AdminDashboardProps) {
  // Navigation tabs: 'questions' | 'bulk' | 'packages' | 'locks' | 'results' | 'sheets' loaded and saved to localStorage
  const [activeTab, setActiveTabState] = useState<"questions" | "bulk" | "packages" | "locks" | "results" | "sheets" | "ai_gen">(() => {
    const saved = localStorage.getItem("KATA_KITA_ADMIN_ACTIVE_TAB");
    if (saved === "ai_gen") return "questions";
    return (saved as any) || "questions";
  });

  const setActiveTab = (tab: "questions" | "bulk" | "packages" | "locks" | "results" | "sheets" | "ai_gen") => {
    setActiveTabState(tab);
    localStorage.setItem("KATA_KITA_ADMIN_ACTIVE_TAB", tab);
  };

  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // System refresh loader states
  const [isRefreshingMenu, setIsRefreshingMenu] = useState(false);
  const [showRefreshToast, setShowRefreshToast] = useState(false);

  // Inline students attempts editing states
  const [editingAttemptId, setEditingAttemptId] = useState<string | null>(null);
  const [editCorrectCount, setEditCorrectCount] = useState<number>(0);
  const [editViolations, setEditViolations] = useState<number>(0);
  const [editPasswordValue, setEditPasswordValue] = useState<string>("");
  const [editFullnameValue, setEditFullnameValue] = useState<string>("");
  const [editEmailValue, setEditEmailValue] = useState<string>("");

  const [showThemePopover, setShowThemePopover] = useState(false);

  // Inline questions editing states in Package Configuration Accordion
  const [expandedPkgId, setExpandedPkgId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQText, setEditQText] = useState("");
  const [editQOptionA, setEditQOptionA] = useState("");
  const [editQOptionB, setEditQOptionB] = useState("");
  const [editQOptionC, setEditQOptionC] = useState("");
  const [editQOptionD, setEditQOptionD] = useState("");
  const [editQOptionE, setEditQOptionE] = useState("");
  const [editQCorrectOption, setEditQCorrectOption] = useState<"A" | "B" | "C" | "D" | "E">("A");
  const [editQExplanation, setEditQExplanation] = useState("");
  const [editQQuestionImg, setEditQQuestionImg] = useState("");
  const [editQQuestionImgPos, setEditQQuestionImgPos] = useState<"above" | "below" | "middle">("below");
  const [editQImgA, setEditQImgA] = useState("");
  const [editQImgB, setEditQImgB] = useState("");
  const [editQImgC, setEditQImgC] = useState("");
  const [editQImgD, setEditQImgD] = useState("");
  const [editQImgE, setEditQImgE] = useState("");
  const [editQImgPosA, setEditQImgPosA] = useState<"above" | "below" | "middle">("below");
  const [editQImgPosB, setEditQImgPosB] = useState<"above" | "below" | "middle">("below");
  const [editQImgPosC, setEditQImgPosC] = useState<"above" | "below" | "middle">("below");
  const [editQImgPosD, setEditQImgPosD] = useState<"above" | "below" | "middle">("below");
  const [editQImgPosE, setEditQImgPosE] = useState<"above" | "below" | "middle">("below");
  const [pkgSubExamFilters, setPkgSubExamFilters] = useState<Record<string, string>>({});

  // Custom Deluxe Confirmation Modal states
  const [deleteConfirmType, setDeleteConfirmType] = useState<"question" | "attempt" | "clear_all_attempts" | "package" | null>(null);
  const [deleteIdTarget, setDeleteIdTarget] = useState<string | null>(null);

  // Sync questions with initialQuestions prop changes
  useEffect(() => {
    if (initialQuestions) {
      setQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  // Sync packages with initialPackages prop changes
  useEffect(() => {
    if (initialPackages) {
      setPackages(initialPackages);
    }
  }, [initialPackages]);

  // Admin Profile configuration states
  const [adminProfileName, setAdminProfileName] = useState(user.fullname);
  const [adminProfileUsername, setAdminProfileUsername] = useState(() => {
    try {
      const savedRaw = localStorage.getItem("KATA_KITA_ADMIN_PROFILE");
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed && parsed.username) {
          return parsed.username;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return "admin"; // Default username
  });
  const [adminProfilePassword, setAdminProfilePassword] = useState("");
  const [adminProfilePhoto, setAdminProfilePhoto] = useState(user.photoUrl || "");

  // Update admin states when user prop changes
  useEffect(() => {
    if (user) {
      setAdminProfileName(user.fullname);
      if (user.photoUrl) {
        setAdminProfilePhoto(user.photoUrl);
      }
    }
  }, [user]);

  // AI manual count toggler state
  const [isManualAIQuantity, setIsManualAIQuantity] = useState(false);
  const [manualAIQuantityText, setManualAIQuantityText] = useState("");

  // Sub Exam configuration interactive list
  const [newPkgSubExams, setNewPkgSubExams] = useState<any[]>([
    { name: "Penalaran Umum", targetCount: 20, durationMinutes: 25 },
    { name: "Penalaran Kuantitatif", targetCount: 15, durationMinutes: 20 },
    { name: "Pemahaman Bacaan & Menulis", targetCount: 20, durationMinutes: 25 },
    { name: "Pengetahuan & Pemahaman Umum", targetCount: 20, durationMinutes: 25 }
  ]);
  const [customSubExamInput, setCustomSubExamInput] = useState("");

  // Google Sheets states
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsFeedback, setSheetsFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Local sync stats
  const [packages, setPackages] = useState<ExamPackage[]>(initialPackages);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [locks, setLocks] = useState<{ [key: string]: boolean }>({});

  // Registered Students Management States
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
  const [resultsSubTab, setResultsSubTab] = useState<"attempts" | "students">("attempts");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentFullname, setEditStudentFullname] = useState("");
  const [editStudentEmail, setEditStudentEmail] = useState("");
  const [editStudentPassword, setEditStudentPassword] = useState("");
  
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentFullname, setNewStudentFullname] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");

  // States for dynamic manual Exam Packages and manual Sub-Exams creation on-the-fly
  const [isManualExamActive, setIsManualExamActive] = useState(false);
  const [manualExamId, setManualExamId] = useState("");
  const [manualExamName, setManualExamName] = useState("");
  const [manualExamCategory, setManualExamCategory] = useState("Umum");

  const [isManualSubExamActive, setIsManualSubExamActive] = useState(false);
  const [manualSubExamText, setManualSubExamText] = useState("");
  const [instructionTab, setInstructionTab] = useState<"word" | "csv" | "text">("word");

  // Success / error labels
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Input states for Manual Question Builder
  const [selectedExamId, setSelectedExamId] = useState<string>(packages[0]?.id || "");
  const selectedPkg = packages.find(p => p.id === selectedExamId);
  const [selectedSubExam, setSelectedSubExam] = useState<string>(selectedPkg?.subExams[0]?.name || "");

  const [questionText, setQuestionText] = useState("");
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D" | "E">("A");
  const [explanation, setExplanation] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [optionE, setOptionE] = useState("");

  const [questionImg, setQuestionImg] = useState("");
  const [questionImgPos, setQuestionImgPos] = useState<"above" | "below" | "middle">("below");
  const [imgA, setImgA] = useState("");
  const [imgB, setImgB] = useState("");
  const [imgC, setImgC] = useState("");
  const [imgD, setImgD] = useState("");
  const [imgE, setImgE] = useState("");
  const [imgPosA, setImgPosA] = useState<"above" | "below" | "middle">("below");
  const [imgPosB, setImgPosB] = useState<"above" | "below" | "middle">("below");
  const [imgPosC, setImgPosC] = useState<"above" | "below" | "middle">("below");
  const [imgPosD, setImgPosD] = useState<"above" | "below" | "middle">("below");
  const [imgPosE, setImgPosE] = useState<"above" | "below" | "middle">("below");

  // Input states for Creating Manual Package
  const [newPkgId, setNewPkgId] = useState("");
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgCategory, setNewPkgCategory] = useState("UTBK SNBT");
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [isCustomCategoryActive, setIsCustomCategoryActive] = useState(false);
  const [newPkgDesc, setNewPkgDesc] = useState("");
  const [newPkgDuration, setNewPkgDuration] = useState("120");
  const [newPkgSubExamsText, setNewPkgSubExamsText] = useState(
    "Penalaran Umum (20), Penalaran Kuantitatif (15)"
  );

  // States of editing package
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editPkgName, setEditPkgName] = useState("");
  const [editPkgCategory, setEditPkgCategory] = useState("");
  const [editPkgDesc, setEditPkgDesc] = useState("");
  const [editPkgSubExams, setEditPkgSubExams] = useState<SubExamConfig[]>([]);
  const [editPkgSubExamInput, setEditPkgSubExamInput] = useState("");

  useEffect(() => {
    const textRepr = newPkgSubExams.map(se => `${se.name} (${se.targetCount})`).join(", ");
    setNewPkgSubExamsText(textRepr);
  }, [newPkgSubExams]);

  // AI Generator Tab States
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(3);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<any[]>([]);

  // Bulk Import text state
  const [bulkText, setBulkText] = useState(
`1. Siapa nama presiden konoha yang merusak negaranya ?
A. TERMULDY
B. BONJOWI
C. MULYADI
D. MULYONO
E. TERMULI
JAWABAN : D

Pembahasan: Mulyono diidentifikasi sesuai format standar nasional tryout humoris.

2. Hasil kalkulasi dari 25% dari 200 adalah...
A. 20
B. 30
C. 40
D. 50
E. 60
JAWABAN : D`
  );
  const [bulkParsedQuestions, setBulkParsedQuestions] = useState<Question[]>([]);

  // Custom Firebase States
  const [customFirebaseJson, setCustomFirebaseJson] = useState(
    JSON.stringify({
      apiKey: "AIzaSyCflzDIBEgyypGrrb0yLXGMdzVDIK9Db3c",
      authDomain: "soal-ujian-online.firebaseapp.com",
      projectId: "soal-ujian-online",
      storageBucket: "soal-ujian-online.firebasestorage.app",
      messagingSenderId: "583250978894",
      appId: "1:583250978894:web:34c41246be8a954b14fb1f",
      measurementId: "G-V30CB7QRCX"
    }, null, 2)
  );
  const [usingCustomFirebase, setUsingCustomFirebase] = useState(false);
  const [firebaseActiveProjectId, setFirebaseActiveProjectId] = useState("soal-ujian-online");

  // New States and Refs for Excel-Style Grouped Student Rekap & Horizontal Navigation
  const [rekapFilterPkgId, setRekapFilterPkgId] = useState<string>("ALL");
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Grouped editing states
  const [editingGroupedKey, setEditingGroupedKey] = useState<string | null>(null);
  const [editGroupedScores, setEditGroupedScores] = useState<{ [subExamName: string]: number }>({});
  const [deleteGroupedKeyTarget, setDeleteGroupedKeyTarget] = useState<string | null>(null);

  const scrollTable = (direction: "left" | "right") => {
    if (tableContainerRef.current) {
      const scrollAmount = 300;
      tableContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const getShortSubExamName = (name: string): string => {
    let clean = name.replace("Seleksi Kompetensi Dasar - ", "SKD ")
                     .replace("TPS - ", "")
                     .replace("Wawasan Kebangsaan (TWK)", "TWK")
                     .replace("Inteligensia Umum (TIU)", "TIU")
                     .replace("Karakteristik Pribadi (TKP)", "TKP");
    return clean;
  };

  const handleStartGroupedEdit = (group: any) => {
    setEditingGroupedKey(`${group.email}_${group.examId}`);
    setEditFullnameValue(group.fullname);
    setEditEmailValue(group.email);
    setEditPasswordValue(getStudentPassword(group.email));
    setEditViolations(group.tabSwitchViolations || 0);

    const scores: { [name: string]: number } = {};
    const pkg = packages.find(p => p.id === group.examId);
    if (pkg) {
      pkg.subExams.forEach(sub => {
        const subRecord = group.subExamAttempts[sub.name];
        scores[sub.name] = subRecord ? subRecord.correctCount : 0;
      });
    }
    setEditGroupedScores(scores);
  };

  const handleSaveGroupedEdit = async (group: any) => {
    const pkg = packages.find(p => p.id === group.examId);
    if (!pkg) return;

    const emailKey = group.email.toLowerCase().trim();
    const updatedAttempts = attempts.map(a => {
      const aEmail = (a.email || "").toLowerCase().trim();
      if (aEmail === emailKey && a.examId === group.examId) {
        const subExamName = a.subExamName || "Sektor Umum";
        let newCorrect = a.correctCount;
        if (editGroupedScores[subExamName] !== undefined) {
          newCorrect = editGroupedScores[subExamName];
        }

        let totalQs = 10;
        const sub = pkg.subExams.find(s => s.name === subExamName);
        if (sub) {
          totalQs = sub.questionCount;
        } else {
          totalQs = pkg.totalQuestions || 10;
        }

        const recalcScore = totalQs > 0 ? (newCorrect / totalQs) * 100 : 0;

        return {
          ...a,
          fullname: editFullnameValue.trim(),
          email: editEmailValue.trim().toLowerCase(),
          correctCount: newCorrect,
          incorrectCount: Math.max(0, totalQs - newCorrect),
          emptyCount: 0,
          tabSwitchViolations: editViolations,
          finalScore: recalcScore
        };
      }
      return a;
    });

    const registryRaw = localStorage.getItem("KATA_KITA_USER_REGISTRY");
    if (registryRaw) {
      try {
        const registry = JSON.parse(registryRaw);
        const updatedReg = registry.map((u: any) => {
          if (u.email.toLowerCase() === emailKey) {
            return {
              ...u,
              fullname: editFullnameValue.trim(),
              email: editEmailValue.trim().toLowerCase(),
              password: editPasswordValue.trim()
            };
          }
          return u;
        });
        localStorage.setItem("KATA_KITA_USER_REGISTRY", JSON.stringify(updatedReg));
      } catch (e) {
        console.error("Failed to update registry:", e);
      }
    }

    if (onUpdateAttempts) {
      onUpdateAttempts(updatedAttempts);
    } else {
      localStorage.setItem("KATA_KITA_ATTEMPTS", JSON.stringify(updatedAttempts));
    }

    setEditingGroupedKey(null);
    await syncAttemptsToSpreadsheet(updatedAttempts);
  };

  const handleDeleteGroupedClick = (group: any) => {
    setDeleteConfirmType("attempt");
    setDeleteGroupedKeyTarget(`${group.email}_${group.examId}`);
  };

  const handleConfirmDeleteGrouped = async () => {
    if (!deleteGroupedKeyTarget) return;
    const parts = deleteGroupedKeyTarget.split("_");
    const targetEmail = parts[0];
    const targetExamId = parts[1];
    
    const updatedAttempts = attempts.filter(a => {
      const aEmail = (a.email || "").toLowerCase().trim();
      const aExamId = a.examId;
      return !(aEmail === targetEmail.toLowerCase().trim() && aExamId === targetExamId);
    });

    if (onUpdateAttempts) {
      onUpdateAttempts(updatedAttempts);
    } else {
      localStorage.setItem("KATA_KITA_ATTEMPTS", JSON.stringify(updatedAttempts));
    }

    setDeleteConfirmType(null);
    setDeleteGroupedKeyTarget(null);
    await syncAttemptsToSpreadsheet(updatedAttempts);
  };

  // Helper to dynamically register packages & sub-exams on-the-fly when custom values are manually supplied
  const ensurePackageAndSubExamExists = (examIdToUse: string, examNameToUse: string, examCategoryToUse: string, subExamToUse: string) => {
    let updatedPkgs = [...packages];
    const existingPkgIndex = updatedPkgs.findIndex(p => p.id === examIdToUse);
    
    if (existingPkgIndex === -1) {
      const newPkg: ExamPackage = {
        id: examIdToUse,
        name: examNameToUse || examIdToUse,
        category: examCategoryToUse || "Umum",
        description: `Paket simulasi kustom ${examNameToUse || examIdToUse}.`,
        totalDurationMinutes: 120,
        totalQuestions: 1,
        subExams: [
          { name: subExamToUse || "Umum", durationMinutes: 120, questionCount: 1 }
        ]
      };
      updatedPkgs.push(newPkg);
      if (onUpdatePackages) {
        onUpdatePackages(updatedPkgs);
      }
      setPackages(updatedPkgs);
    } else {
      const existingPkg = updatedPkgs[existingPkgIndex];
      const hasSubExam = existingPkg.subExams.some(se => se.name === subExamToUse);
      if (!hasSubExam && subExamToUse) {
        const updatedSubExams = [
          ...existingPkg.subExams,
          { name: subExamToUse, durationMinutes: 15, questionCount: 1 }
        ];
        const updatedPkg = {
          ...existingPkg,
          subExams: updatedSubExams,
          totalDurationMinutes: existingPkg.totalDurationMinutes + 15,
          totalQuestions: existingPkg.totalQuestions + 1
        };
        updatedPkgs[existingPkgIndex] = updatedPkg;
        if (onUpdatePackages) {
          onUpdatePackages(updatedPkgs);
        }
        setPackages(updatedPkgs);
      }
    }
  };

  // Load locks and databases
  useEffect(() => {
    loadDatabaseState();

    // Check local storage for persistent Google User for robust survival
    try {
      const savedGoogleUser = localStorage.getItem("KATA_KITA_PERSISTENT_GOOGLE_USER");
      if (savedGoogleUser) {
        setGoogleUser(JSON.parse(savedGoogleUser));
      }
    } catch(e) {
      console.error("Failed to parse cached google user:", e);
    }

    initSheetsAuth(
      (user, token) => {
        setGoogleUser(user);
        localStorage.setItem("KATA_KITA_PERSISTENT_GOOGLE_USER", JSON.stringify({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        }));
      },
      () => {
        // Only clear google user cache if no cached access token is detected to survive refresh mismatch
        const token = localStorage.getItem("KATA_KITA_GOOGLE_ACCESS_TOKEN");
        if (!token) {
          setGoogleUser(null);
          localStorage.removeItem("KATA_KITA_PERSISTENT_GOOGLE_USER");
        }
      }
    );

    // Check custom Firebase config in local storage
    try {
      const customConfigRaw = localStorage.getItem("KATA_KITA_CUSTOM_FIREBASE_CONFIG");
      if (customConfigRaw) {
        const parsed = JSON.parse(customConfigRaw);
        if (parsed && parsed.apiKey) {
          setUsingCustomFirebase(true);
          setFirebaseActiveProjectId(parsed.projectId || "Kustom");
          setCustomFirebaseJson(JSON.stringify(parsed, null, 2));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [initialPackages, initialQuestions]);

  const handleConnectSheets = async () => {
    setSheetsFeedback(null);
    try {
      const result = await signInWithGoogleSheets();
      if (result) {
        setGoogleUser(result.user);
        localStorage.setItem("KATA_KITA_PERSISTENT_GOOGLE_USER", JSON.stringify({
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL
        }));
      }
    } catch (err: any) {
      const errMsg = err.message || "";
      const isDomainError = errMsg.includes("unauthorized-domain") || errMsg.includes("auth/unauthorized-domain") || err.code === "auth/unauthorized-domain";
      
      setSheetsFeedback({
        type: "error",
        message: isDomainError 
          ? `Gagal Login: Domain "${window.location.hostname}" Belum Diotorisasi di Firebase! Untuk memperbaiki, silakan ikuti petunjuk "Solusi Error" di bawah dan tambahkan domain ke Firebase Console.` 
          : (err.message || "Gagal menghubungkan ke akun Google Anda.")
      });
    }
  };

  const handleDisconnectSheets = async () => {
    setSheetsFeedback(null);
    try {
      await logoutGoogleSheets();
      setGoogleUser(null);
      localStorage.removeItem("KATA_KITA_PERSISTENT_GOOGLE_USER");
    } catch (err: any) {
      setSheetsFeedback({
        type: "error",
        message: err.message || "Gagal memutuskan sambungan Google."
      });
    }
  };

  const handleSaveCustomFirebase = () => {
    try {
      let cleaned = customFirebaseJson.trim();
      if (!cleaned) {
        alert("JSON konfigurasi tidak boleh kosong.");
        return;
      }
      
      let parsed: any = null;
      try {
        parsed = JSON.parse(cleaned);
      } catch (strictError) {
        console.log("Strict JSON parse failed, trying relaxed JS object parsing...", strictError);
        try {
          // 1. Add double quotes to unquoted keys (e.g. apiKey: -> "apiKey":)
          let formatted = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          
          // 2. Replace single-quoted values with double-quoted values (e.g. 'abc' -> "abc")
          formatted = formatted.replace(/:\s*'([^']*)'/g, ':"$1"');
          
          // 3. Remove trailing commas (e.g. , } -> })
          formatted = formatted.replace(/,\s*([}\]])/g, '$1');
          
          parsed = JSON.parse(formatted);
        } catch (relaxedError: any) {
          console.log("Relaxed parsing failed, falling back to regex extraction...", relaxedError);
          // If relaxed fails, do regex matching for each key-value pair
          const apiKeyMatch = cleaned.match(/apiKey\s*:\s*["']([^"']+)["']/);
          const authDomainMatch = cleaned.match(/authDomain\s*:\s*["']([^"']+)["']/);
          const projectIdMatch = cleaned.match(/projectId\s*:\s*["']([^"']+)["']/);
          const storageBucketMatch = cleaned.match(/storageBucket\s*:\s*["']([^"']+)["']/);
          const messagingSenderIdMatch = cleaned.match(/messagingSenderId\s*:\s*["']([^"']+)["']/);
          const appIdMatch = cleaned.match(/appId\s*:\s*["']([^"']+)["']/);
          
          if (apiKeyMatch) {
            parsed = {
              apiKey: apiKeyMatch[1],
              authDomain: authDomainMatch ? authDomainMatch[1] : "",
              projectId: projectIdMatch ? projectIdMatch[1] : "",
              storageBucket: storageBucketMatch ? storageBucketMatch[1] : "",
              messagingSenderId: messagingSenderIdMatch ? messagingSenderIdMatch[1] : "",
              appId: appIdMatch ? appIdMatch[1] : ""
            };
          } else {
            throw new Error("Format konfigurasi tidak dikenal. Harap salin dari Firebase Web App Anda.");
          }
        }
      }

      if (!parsed || !parsed.apiKey) {
        alert("Konfigurasi tidak valid! Format harus memiliki properti 'apiKey'.");
        return;
      }

      localStorage.setItem("KATA_KITA_CUSTOM_FIREBASE_CONFIG", JSON.stringify(parsed));
      alert("Konfigurasi Firebase kustom berhasil disimpan! Halaman akan otomatis dimuat ulang untuk menerapkan konfigurasi baru.");
      window.location.reload();
    } catch (e: any) {
      alert("Gagal menyimpan: Format tidak valid! Pastikan Anda menyalin seluruh object konfigurasi Firebase Anda dengan benar.");
    }
  };

  const handleResetCustomFirebase = () => {
    if (confirm("Apakah Anda yakin ingin mematikan Firebase Kustom dan kembali menggunakan konfigurasi sistem bawaan Bimbel Kata Kita?")) {
      localStorage.removeItem("KATA_KITA_CUSTOM_FIREBASE_CONFIG");
      alert("Kembali ke Sistem Bawaan Sukses! Halaman akan dimuat ulang.");
      window.location.reload();
    }
  };

  const handleExportAttemptsToSheets = async () => {
    setSheetsFeedback(null);
    setIsSyncingSheets(true);
    const spreadsheetId = "15btbpTleamWiLaUVIErxbIZvkOHpL-o9LS-mzzjg8pc";
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/15btbpTleamWiLaUVIErxbIZvkOHpL-o9LS-mzzjg8pc/edit?gid=0#gid=0";
    try {
      const headers = [
        "Sesi ID",
        "Nama Lengkap Siswa",
        "Alamat Email",
        "Password Peserta",
        "Paket Ujian",
        "Sub-Ujian",
        "Jawaban Benar",
        "Jawaban Salah",
        "Jawaban Kosong",
        "Total Pelanggaran Tab-Switch",
        "Integritas Status",
        "Nilai Akhir (%)",
        "Waktu Mulai"
      ];
      const rows = attempts.map(att => {
        const pkg = packages.find(p => p.id === att.examId);
         const isBanned = att.tabSwitchViolations >= 3;
         return [
           att.id,
           att.fullname || "Siswa Anonim",
           att.email || "Siswa Anonim",
           getStudentPassword(att.email),
           pkg?.name || "Paket Dihapus",
           att.subExamName || "Semua Sektor",
           att.correctCount,
           att.incorrectCount || 0,
           att.emptyCount || 0,
           att.tabSwitchViolations || 0,
           isBanned ? "Diskualifikasi (Banned)" : "Sikap Jujur/Lolos",
           isBanned ? 0 : (att.finalScore != null ? att.finalScore.toFixed(1) : "0.0"),
           att.startTime ? new Date(att.startTime).toLocaleString("id-ID") : "-"
         ];
      });

      await ensureSheetTabExists(spreadsheetId, "Rekap Nilai");
      await updateGoogleSheetValues(
        spreadsheetId,
        "Rekap Nilai!A1",
        [headers, ...rows]
      );
      setSheetsFeedback({
        type: "success",
        message: `Rekap nilai siswa berhasil disinkronkan langsung ke 'Platform Tryout Online'! Silakan buka di: ` + spreadsheetUrl
      });
    } catch (err: any) {
      console.error(err);
      setSheetsFeedback({
        type: "error",
        message: err.message || "Gagal melakukan ekspor data ke Google Sheets."
      });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleExportQuestionsToSheets = async (targetExamPkgId: string) => {
    setSheetsFeedback(null);
    setIsSyncingSheets(true);
    const spreadsheetId = "15btbpTleamWiLaUVIErxbIZvkOHpL-o9LS-mzzjg8pc";
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/15btbpTleamWiLaUVIErxbIZvkOHpL-o9LS-mzzjg8pc/edit?gid=0#gid=0";
    try {
      const targetPkg = packages.find(p => p.id === targetExamPkgId);
      if (!targetPkg) throw new Error("Paket ujian tidak valid atau tidak ditemukan.");

      const pkgQs = questions.filter(q => q.examId === targetExamPkgId);
      if (pkgQs.length === 0) {
        throw new Error(`Belum ada butir soal dalam database untuk paket: ${targetPkg.name}.`);
      }

      const headers = [
        "Sektor Sub-Ujian",
        "ID Soal (Database)",
        "Teks Konstruksi Pertanyaan",
        "Pilihan Jawaban A",
        "Pilihan Jawaban B",
        "Pilihan Jawaban C",
        "Pilihan Jawaban D",
        "Pilihan Jawaban E",
        "Sumbu Kunci Jawaban Benar",
        "Materi Argumentasi (Pembahasan)"
      ];

      const rows = pkgQs.map(q => [
        q.subExamName || "Umum",
        q.id,
        q.questionText || "",
        q.options?.A || "",
        q.options?.B || "",
        q.options?.C || "",
        q.options?.D || "",
        q.options?.E || "",
        q.correctOption || "A",
        q.explanation || ""
      ]);

      const tabTitle = `Bank Soal - ${targetPkg.name.substring(0, 20)}`;
      await ensureSheetTabExists(spreadsheetId, tabTitle);
      await updateGoogleSheetValues(
        spreadsheetId,
        `${tabTitle}!A1`,
        [headers, ...rows]
      );

      setSheetsFeedback({
        type: "success",
        message: `Kemasan bank soal "${targetPkg.name}" (${pkgQs.length} soal) berhasil disinkronkan ke tab '${tabTitle}'! ` + spreadsheetUrl
      });
    } catch (err: any) {
      console.error(err);
      setSheetsFeedback({
        type: "error",
        message: err.message || "Gagal melakukan ekspor bank soal ke Google Sheets."
      });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleExportUsersToSheets = async () => {
    setSheetsFeedback(null);
    setIsSyncingSheets(true);
    const spreadsheetId = "15btbpTleamWiLaUVIErxbIZvkOHpL-o9LS-mzzjg8pc";
    const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/15btbpTleamWiLaUVIErxbIZvkOHpL-o9LS-mzzjg8pc/edit?gid=0#gid=0";
    try {
      const rawUserRegistry = localStorage.getItem("KATA_KITA_USER_REGISTRY");
      const userList = rawUserRegistry ? JSON.parse(rawUserRegistry) : [];
      if (userList.length === 0) {
        throw new Error("Tidak ada siswa terdaftar di dalam database lokal.");
      }

      const headers = ["ID Siswa (Database)", "Nama Lengkap Siswa", "Alamat Email Terdaftar", "Kredensial Role", "Password"];
      const rows = userList.map((usr: any) => [
        usr.id || "-",
        usr.fullname || "-",
        usr.email || "-",
        usr.role || "student",
        usr.password || "siswa123"
      ]);

      await ensureSheetTabExists(spreadsheetId, "Daftar Siswa");
      await updateGoogleSheetValues(
        spreadsheetId,
        "Daftar Siswa!A1",
        [headers, ...rows]
      );

      setSheetsFeedback({
        type: "success",
        message: `Daftar akun registrasi siswa (${userList.length} siswa) berhasil disinkronkan ke tab 'Daftar Siswa'! Silakan akses: ` + spreadsheetUrl
      });
    } catch (err: any) {
      console.error(err);
      setSheetsFeedback({
        type: "error",
        message: err.message || "Gagal mengekspor data registrasi siswa."
      });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Query student credentials password from registry database
  const getStudentPassword = (studentEmail: string): string => {
    const registryRaw = localStorage.getItem("KATA_KITA_USER_REGISTRY");
    if (registryRaw) {
      try {
        const registry = JSON.parse(registryRaw);
        const studentObj = registry.find((u: any) => u.email.toLowerCase() === studentEmail.toLowerCase());
        if (studentObj) {
          return studentObj.password || "siswa123";
        }
      } catch (e) {
        console.error("Failed to parse registry: ", e);
      }
    }
    return "siswa123";
  };

  // User Registry CRUD operators for absolute integration & sync
  const handleStartEditStudent = (student: any) => {
    setEditingStudentId(student.id);
    setEditStudentFullname(student.fullname || "");
    setEditStudentEmail(student.email || "");
    setEditStudentPassword(student.password || "siswa123");
  };

  const handleSaveEditStudent = () => {
    if (!editStudentFullname.trim() || !editStudentEmail.trim()) {
      alert("Nama dan email wajib diisi!");
      return;
    }

    const updated = registeredStudents.map(student => {
      if (student.id === editingStudentId) {
        return {
          ...student,
          fullname: editStudentFullname.trim(),
          email: editStudentEmail.trim().toLowerCase(),
          password: editStudentPassword.trim()
        };
      }
      return student;
    });

    setRegisteredStudents(updated);
    localStorage.setItem("KATA_KITA_USER_REGISTRY", JSON.stringify(updated));
    setEditingStudentId(null);
    setSuccessMsg("Berhasil memperbarui data registrasi siswa!");
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus akun registrasi siswa ini? Siswa bersangkutan tidak akan bisa login lagi.")) {
      const updated = registeredStudents.filter(u => u.id !== studentId);
      setRegisteredStudents(updated);
      localStorage.setItem("KATA_KITA_USER_REGISTRY", JSON.stringify(updated));
      setSuccessMsg("Berhasil menghapus akun registrasi siswa dari database!");
    }
  };

  const handleAddStudentManual = () => {
    if (!newStudentFullname.trim() || !newStudentEmail.trim() || !newStudentPassword.trim()) {
      alert("Seluruh isian data siswa baru wajib dilengkapi!");
      return;
    }

    const emailCheck = newStudentEmail.trim().toLowerCase();
    const alreadyRegistered = registeredStudents.some(u => u.email === emailCheck);
    if (alreadyRegistered) {
      alert("Alamat email ini sudah terdaftar!");
      return;
    }

    const newStudent = {
      id: `USR-${Math.floor(10000 + Math.random() * 90000)}`,
      fullname: newStudentFullname.trim(),
      email: emailCheck,
      password: newStudentPassword.trim(),
      role: "student",
      categoryInterest: "UTBK SNBT",
      photoUrl: "https://img.icons8.com/color/150/student-male--v1.png"
    };

    const updated = [...registeredStudents, newStudent];
    setRegisteredStudents(updated);
    localStorage.setItem("KATA_KITA_USER_REGISTRY", JSON.stringify(updated));
    
    // Clear inputs
    setNewStudentFullname("");
    setNewStudentEmail("");
    setNewStudentPassword("");
    setIsAddingStudent(false);
    
    setSuccessMsg("Siswa baru berhasil didaftarkan langsung ke database!");
  };

  // Sync rekap attempts list directly to 15btbpTleamWiLaUVIErxbIZvkOHpL-o9LS-mzzjg8pc
  const syncAttemptsToSpreadsheet = async (currentAttemptsList: any[]): Promise<void> => {
    const spreadsheetId = "15btbpTleamWiLaUVIErxbIZvkOHpL-o9LS-mzzjg8pc";
    try {
      const headers = [
        "ID Sesi",
        "Nama Siswa",
        "Email",
        "Password Peserta",
        "Nama Paket",
        "Sektor Sub-Ujian",
        "Benar",
        "Salah",
        "Kosong",
        "Tab Switch Violations",
        "Status Integritas",
        "Nilai Akhir (%)",
        "Waktu Mulai"
      ];
      const rows = currentAttemptsList.map(att => {
        const pkg = packages.find(p => p.id === att.examId);
        const isBanned = att.tabSwitchViolations >= 3;
        return [
          att.id,
          att.fullname || "Siswa Anonim",
          att.email || "Siswa Anonim",
          getStudentPassword(att.email),
          pkg?.name || "Paket Ujian",
          att.subExamName || "Semua Sektor",
          att.correctCount,
          att.incorrectCount || 0,
          att.emptyCount || 0,
          att.tabSwitchViolations || 0,
          isBanned ? "Diskualifikasi (Banned)" : "Sikap Jujur/Lolos",
          isBanned ? 0 : (att.finalScore != null ? att.finalScore.toFixed(1) : "0.0"),
          att.startTime ? new Date(att.startTime).toLocaleString("id-ID") : "-"
        ];
      });

      await ensureSheetTabExists(spreadsheetId, "Rekap Nilai");
      await updateGoogleSheetValues(
        spreadsheetId,
        "Rekap Nilai!A1",
        rows.length > 0 ? [headers, ...rows] : [headers]
      );
      console.log("Successfully synced list to official Google Sheets spreadsheet ID 15btbpTleamWiLaUVIErxbIZvkOHpL-o9LS-mzzjg8pc!");
    } catch (err) {
      console.error("Spreadsheet auto-sync failed:", err);
    }
  };

  const handleStartEditAttempt = (att: any) => {
    setEditingAttemptId(att.id);
    setEditCorrectCount(att.correctCount || 0);
    setEditViolations(att.tabSwitchViolations || 0);
    setEditPasswordValue(getStudentPassword(att.email));
    setEditFullnameValue(att.fullname || "");
    setEditEmailValue(att.email || "");
  };

  const handleSaveEditAttempt = async (attId: string, attEmail: string) => {
    const att = attempts.find(a => a.id === attId);
    if (!att) return;

    let totalQs = 10;
    const pkg = packages.find(p => p.id === att.examId);
    if (pkg) {
      const sub = pkg.subExams.find(s => s.name === att.subExamName);
      if (sub) {
        totalQs = sub.questionCount;
      } else {
        totalQs = pkg.totalQuestions || 10;
      }
    }

    const recalcScore = totalQs > 0 ? (editCorrectCount / totalQs) * 100 : 0;

    const updatedAttempts = attempts.map(a => {
      if (a.id === attId) {
        return {
          ...a,
          fullname: editFullnameValue,
          email: editEmailValue,
          correctCount: editCorrectCount,
          incorrectCount: Math.max(0, totalQs - editCorrectCount),
          emptyCount: 0,
          tabSwitchViolations: editViolations,
          finalScore: recalcScore
        };
      }
      return a;
    });

    const registryRaw = localStorage.getItem("KATA_KITA_USER_REGISTRY");
    if (registryRaw) {
      try {
        const registry = JSON.parse(registryRaw);
        const updatedReg = registry.map((u: any) => {
          if (u.email.toLowerCase() === attEmail.toLowerCase()) {
            return { 
              ...u, 
              fullname: editFullnameValue, 
              email: editEmailValue, 
              password: editPasswordValue 
            };
          }
          return u;
        });
        localStorage.setItem("KATA_KITA_USER_REGISTRY", JSON.stringify(updatedReg));
      } catch (e) {
        console.error("Failed to update user registry:", e);
      }
    }

    if (onUpdateAttempts) {
      onUpdateAttempts(updatedAttempts);
    } else {
      localStorage.setItem("KATA_KITA_ATTEMPTS", JSON.stringify(updatedAttempts));
    }

    setEditingAttemptId(null);
    await syncAttemptsToSpreadsheet(updatedAttempts);
  };

  const handleDeleteAttemptClick = (attId: string) => {
    setDeleteConfirmType("attempt");
    setDeleteIdTarget(attId);
  };

  const handleConfirmDeleteAttempt = async () => {
    if (!deleteIdTarget) return;
    const updatedAttempts = attempts.filter(a => a.id !== deleteIdTarget);

    if (onUpdateAttempts) {
      onUpdateAttempts(updatedAttempts);
    } else {
      localStorage.setItem("KATA_KITA_ATTEMPTS", JSON.stringify(updatedAttempts));
    }

    setDeleteConfirmType(null);
    setDeleteIdTarget(null);
    await syncAttemptsToSpreadsheet(updatedAttempts);
  };

  const handleConfirmClearAllAttempts = async () => {
    const updatedAttempts: any[] = [];
    if (onUpdateAttempts) {
      onUpdateAttempts(updatedAttempts);
    } else {
      localStorage.setItem("KATA_KITA_ATTEMPTS", JSON.stringify(updatedAttempts));
    }
    setDeleteConfirmType(null);
    setDeleteIdTarget(null);
    await syncAttemptsToSpreadsheet(updatedAttempts);
  };

  // Inline Questions Database Edit & Delete Handlers
  const handleEditQuestionClick = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditQText(q.questionText);
    setEditQOptionA(q.options.A || "");
    setEditQOptionB(q.options.B || "");
    setEditQOptionC(q.options.C || "");
    setEditQOptionD(q.options.D || "");
    setEditQOptionE(q.options.E || "");
    setEditQCorrectOption(q.correctOption as any || "A");
    setEditQExplanation(q.explanation || "");
    setEditQQuestionImg(q.questionImage || "");
    setEditQQuestionImgPos(q.questionImagePosition || "below");
    setEditQImgA(q.optionImages?.A || "");
    setEditQImgB(q.optionImages?.B || "");
    setEditQImgC(q.optionImages?.C || "");
    setEditQImgD(q.optionImages?.D || "");
    setEditQImgE(q.optionImages?.E || "");
    setEditQImgPosA(q.optionImagePositions?.A || "below");
    setEditQImgPosB(q.optionImagePositions?.B || "below");
    setEditQImgPosC(q.optionImagePositions?.C || "below");
    setEditQImgPosD(q.optionImagePositions?.D || "below");
    setEditQImgPosE(q.optionImagePositions?.E || "below");
  };

  const handleSaveEditedQuestion = (qId: string) => {
    const updatedQs = questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          questionText: editQText,
          questionImage: editQQuestionImg || undefined,
          questionImagePosition: editQQuestionImgPos,
          options: {
            A: editQOptionA,
            B: editQOptionB,
            C: editQOptionC,
            D: editQOptionD,
            E: editQOptionE
          },
          optionImages: (editQImgA || editQImgB || editQImgC || editQImgD || editQImgE) ? {
            A: editQImgA || undefined,
            B: editQImgB || undefined,
            C: editQImgC || undefined,
            D: editQImgD || undefined,
            E: editQImgE || undefined
          } : undefined,
          optionImagePositions: {
            A: editQImgPosA,
            B: editQImgPosB,
            C: editQImgPosC,
            D: editQImgPosD,
            E: editQImgPosE
          },
          correctOption: editQCorrectOption,
          explanation: editQExplanation
        };
      }
      return q;
    });

    setQuestions(updatedQs);
    localStorage.setItem("KATA_KITA_QUESTIONS", JSON.stringify(updatedQs));
    if (onUpdateQuestions) {
      onUpdateQuestions(updatedQs);
    }
    setEditingQuestionId(null);
    alert("Berhasil memperbarui butir soal di database paket!");
  };

  const handleDeleteQuestionClick = (qId: string) => {
    setDeleteConfirmType("question");
    setDeleteIdTarget(qId);
  };

  const handleConfirmDeleteQuestion = () => {
    if (!deleteIdTarget) return;
    const updatedQs = questions.filter(q => q.id !== deleteIdTarget);
    setQuestions(updatedQs);
    localStorage.setItem("KATA_KITA_QUESTIONS", JSON.stringify(updatedQs));
    if (onUpdateQuestions) {
      onUpdateQuestions(updatedQs);
    }
    setDeleteConfirmType(null);
    setDeleteIdTarget(null);
  };

  const handlePublishToggle = (qId: string) => {
    const qObj = questions.find(q => q.id === qId);
    if (!qObj) return;

    const isCurrentlyPublished = qObj.isPublished !== false;
    const nextPublishedStatus = !isCurrentlyPublished;

    if (nextPublishedStatus) {
      // Find package and check quota limit
      const pkg = packages.find(p => p.id === qObj.examId);
      if (pkg) {
        const subConfig = pkg.subExams?.find(se => se.name === qObj.subExamName);
        if (subConfig) {
          const limit = subConfig.questionCount;
          const currentPubCount = questions.filter(
            item => item.examId === qObj.examId && item.subExamName === qObj.subExamName && item.isPublished !== false
          ).length;

          if (currentPubCount >= limit) {
            alert(
              `Kapasitas kuota untuk sub-ujian "${qObj.subExamName}" telah maksimal!\n` +
              `Batas maksimal berkisar ${limit} butir soal, sedangkan saat ini sudah ada ${currentPubCount} butir lain yang aktif diterbitkan.\n\n` +
              `Batalkan/tarik penerbitan soal lain terlebih dahulu sebelum menerbitkan soal ini.`
            );
            return;
          }
        }
      }
    }

    const updatedQs = questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          isPublished: nextPublishedStatus
        };
      }
      return q;
    });

    setQuestions(updatedQs);
    localStorage.setItem("KATA_KITA_QUESTIONS", JSON.stringify(updatedQs));
    if (onUpdateQuestions) {
      onUpdateQuestions(updatedQs);
    }

    // Dynamic toast alerts
    if (nextPublishedStatus) {
      setSuccessMsg(`Berhasil menerbitkan butir soal ke ruang ujian siswa secara langsung!`);
    } else {
      setSuccessMsg(`Soal berhasil ditarik kembali ke Bank Soal (Draf) dengan sukses!`);
    }
  };

  const handleConfirmDeletePackage = () => {
    if (!deleteIdTarget) return;
    const pkgId = deleteIdTarget;
    const targetPkg = packages.find(p => p.id === pkgId);
    const pkgName = targetPkg ? targetPkg.name : "Paket";

    const updatedPackagesList = packages.filter(pkg => pkg.id !== pkgId);
    const updatedQuestionsList = questions.filter(q => q.examId !== pkgId);

    if (onUpdatePackages) {
      onUpdatePackages(updatedPackagesList);
    }
    if (onUpdateQuestions) {
      onUpdateQuestions(updatedQuestionsList);
    }

    localStorage.setItem("KATA_KITA_PACKAGES", JSON.stringify(updatedPackagesList));
    localStorage.setItem("KATA_KITA_QUESTIONS", JSON.stringify(updatedQuestionsList));

    setPackages(updatedPackagesList);
    setQuestions(updatedQuestionsList);

    if (selectedExamId === pkgId) {
      setSelectedExamId(updatedPackagesList[0]?.id || "");
    }

    setSuccessMsg(`Paket Ujian "${pkgName}" berhasil dihapus sepenuhnya.`);
    setTimeout(() => {
      setSuccessMsg("");
    }, 4500);

    setDeleteConfirmType(null);
    setDeleteIdTarget(null);
  };

  // Admin Account & Profile Configuration Saving
  const handleAdminProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProfileName.trim()) {
      alert("Nama administrator tidak boleh kosong.");
      return;
    }
    if (!adminProfileUsername.trim()) {
      alert("Username administrator tidak boleh kosong.");
      return;
    }
    
    const updatedAdmin = {
      ...user,
      fullname: adminProfileName,
      photoUrl: adminProfilePhoto
    };

    const savedAdminCreds = {
      fullname: adminProfileName,
      username: adminProfileUsername.trim(),
      password: adminProfilePassword || "adminkatakita",
      photoUrl: adminProfilePhoto
    };

    localStorage.setItem("KATA_KITA_ADMIN_PROFILE", JSON.stringify(savedAdminCreds));
    
    if (onUpdateUser) {
      onUpdateUser(updatedAdmin);
    }
    
    alert("Profil Administrator berhasil diperbarui!\nNama Lengkap, Username, dan password baru aktif sepenuhnya sekarang.");
  };

  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar melebihi 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAdminProfilePhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Cache/Dashboard refresh button handler
  const handleSystemRefresh = () => {
    setIsRefreshingMenu(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    // Reload database from local storage
    loadDatabaseState();
    
    setTimeout(() => {
      setIsRefreshingMenu(false);
      setShowRefreshToast(true);
      setTimeout(() => setShowRefreshToast(false), 2000);
    }, 800);
  };

  const loadDatabaseState = () => {
    const savedLocks = localStorage.getItem("KATA_KITA_LOCKS");
    if (savedLocks) {
      setLocks(JSON.parse(savedLocks));
    } else {
      const defaultLocks = {
        "EXM-MAT": true,
        "EXM-AN": true,
        "EXM-LAINNYA": true,
        "Aljabar & Teori Bilangan": true
      };
      localStorage.setItem("KATA_KITA_LOCKS", JSON.stringify(defaultLocks));
      setLocks(defaultLocks);
    }

    const stPkg = localStorage.getItem("KATA_KITA_PACKAGES");
    if (stPkg) setPackages(JSON.parse(stPkg));
    else setPackages(initialPackages);

    const stQst = localStorage.getItem("KATA_KITA_QUESTIONS");
    if (stQst) setQuestions(JSON.parse(stQst));
    else setQuestions(initialQuestions);

    const registryRaw = localStorage.getItem("KATA_KITA_USER_REGISTRY");
    if (registryRaw) {
      try {
        setRegisteredStudents(JSON.parse(registryRaw));
      } catch (e) {
        console.error("Failed to parse registry:", e);
      }
    } else {
      setRegisteredStudents([]);
    }
  };

  // Helper trigger image conversions to base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!questionText || !optionA || !optionB || !optionC || !optionD || !optionE) {
      setErrorMsg("Harap isi teks pertanyaan dan kelima pilihan jawaban (A sampai E)!");
      return;
    }

    const finalExamId = isManualExamActive ? manualExamId.trim() : selectedExamId;
    const finalExamName = isManualExamActive ? manualExamName.trim() : (packages.find(p => p.id === selectedExamId)?.name || "");
    const finalExamCategory = isManualExamActive ? manualExamCategory.trim() : (packages.find(p => p.id === selectedExamId)?.category || "Umum");
    const finalSubExamName = isManualSubExamActive ? manualSubExamText.trim() : selectedSubExam;

    if (isManualExamActive && (!finalExamId || !finalExamName)) {
      setErrorMsg("Untuk sektor manual, ID Paket dan Nama Paket kustom wajib diisi!");
      return;
    }

    if (isManualSubExamActive && !finalSubExamName) {
      setErrorMsg("Untuk sub-ujian manual, nama sub-ujian kustom wajib diisi!");
      return;
    }

    // Ensure package & sub-exam exist / are appended dynamically
    ensurePackageAndSubExamExists(finalExamId, finalExamName, finalExamCategory, finalSubExamName);

    const newQ: Question = {
      id: `QST-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      examId: finalExamId,
      subExamName: finalSubExamName || "Umum",
      questionText,
      questionImage: questionImg || undefined,
      questionImagePosition: questionImgPos,
      options: {
        A: optionA,
        B: optionB,
        C: optionC,
        D: optionD,
        E: optionE
      },
      optionImages: (imgA || imgB || imgC || imgD || imgE) ? {
        A: imgA || undefined,
        B: imgB || undefined,
        C: imgC || undefined,
        D: imgD || undefined,
        E: imgE || undefined,
      } : undefined,
      optionImagePositions: {
        A: imgPosA,
        B: imgPosB,
        C: imgPosC,
        D: imgPosD,
        E: imgPosE
      },
      correctOption: correctOption as "A" | "B" | "C" | "D" | "E",
      explanation: explanation || "Sesuai petunjuk manual jawaban benar.",
      isPublished: false // Saved in Question Bank, unpublished by default
    };

    onAddQuestion(newQ);
    
    // update locally
    const updatedQs = [...questions, newQ];
    localStorage.setItem("KATA_KITA_QUESTIONS", JSON.stringify(updatedQs));
    setQuestions(updatedQs);

    setSuccessMsg("Soal baru berhasil ditambahkan ke Bank Soal (Draf). Silakan terbitkan di tab 'Paket Ujian'!");
    
    // Clear
    setQuestionText("");
    setOptionA(""); setOptionB(""); setOptionC(""); setOptionD(""); setOptionE("");
    setQuestionImg(""); setImgA(""); setImgB(""); setImgC(""); setImgD(""); setImgE("");
    setQuestionImgPos("below");
    setImgPosA("below"); setImgPosB("below"); setImgPosC("below"); setImgPosD("below"); setImgPosE("below");
    setExplanation("");
  };

  const handleDeleteParsedQuestion = (indexToDelete: number) => {
    setBulkParsedQuestions(prev => prev.filter((_, idx) => idx !== indexToDelete));
    setSuccessMsg("Pilihan butir soal pratinjau berhasil dihapus sebelum disimpan.");
  };

  const handleClearAllParsedQuestions = () => {
    setBulkParsedQuestions([]);
    setSuccessMsg("Semua butir soal pratinjau berhasil dibersihkan.");
  };

  const handleParseBulk = () => {
    setErrorMsg("");
    setSuccessMsg("");
    setBulkParsedQuestions([]);

    if (!bulkText.trim()) {
      setErrorMsg("Input copy-paste kosong! Seharusnya masukkan format.");
      return;
    }

    try {
      const qs: Question[] = [];
      const lines = bulkText.split("\n");
      
      const isQuestionStartLine = (lineStr: string): boolean => {
        const s = lineStr.trim();
        if (!s) return false;
        
        // Jangan deteksi opsi A-E sebagai mulai soal
        if (/^\s*[A-E]\s*[\.\)\-\:\s]/i.test(s)) return false;

        // Kasus 1: SOAL 1, SOAL NO 1, QUESTION 1, BUTIR 1, NO. 1, SOAL 01
        if (/^\s*(?:SOAL|QUESTION|BUTIR|NO\.?)\s*\d+/i.test(s)) {
          return true;
        }
        
        // Kasus 2: Angka biasa diikuti petunjuk teks di awal, misal "1. ", "02) ", "1 - "
        if (/^\s*\d+[\.\)\-]\s+\S+/i.test(s)) {
          return true;
        }
        
        return false;
      };

      let currentQuestion: any = null;
      let lastOptionModified: "A" | "B" | "C" | "D" | "E" | null = null;

      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const rawLine = lines[lineIdx];
        const line = rawLine.trim();

        if (!line) {
          // Tetap tambahkan baris baru untuk menjaga keterbacaan tabel dan paragraf
          if (currentQuestion) {
            if (currentQuestion.lastField === "question" && currentQuestion.questionText) {
              currentQuestion.questionText += "\n";
            } else if (currentQuestion.lastField === "explanation" && currentQuestion.explanation) {
              currentQuestion.explanation += "\n";
            } else if (currentQuestion.lastField === "options" && lastOptionModified) {
              currentQuestion.options[lastOptionModified] += "\n";
            }
          }
          continue;
        }

        const isStart = isQuestionStartLine(line);

        if (isStart || !currentQuestion) {
          // Commit previous question if valid
          if (currentQuestion) {
            if (currentQuestion.questionText.trim()) {
              currentQuestion.questionText = currentQuestion.questionText.trim();
              currentQuestion.explanation = currentQuestion.explanation.trim() || "Sesuai petunjuk manual jawaban.";
              
              qs.push({
                id: currentQuestion.id,
                examId: currentQuestion.examId,
                subExamName: currentQuestion.subExamName,
                questionText: currentQuestion.questionText,
                options: {
                  A: currentQuestion.options.A.trim() || "Opsi A",
                  B: currentQuestion.options.B.trim() || "Opsi B",
                  C: currentQuestion.options.C.trim() || "Opsi C",
                  D: currentQuestion.options.D.trim() || "Opsi D",
                  E: currentQuestion.options.E.trim() || "-"
                },
                correctOption: currentQuestion.correctOption,
                explanation: currentQuestion.explanation,
                isPublished: false
              });
            }
          }

          const finalExamId = isManualExamActive ? manualExamId.trim() : selectedExamId;
          const finalSubExamName = isManualSubExamActive ? manualSubExamText.trim() : selectedSubExam;

          // Ekstrak teks setelah angka/label jika ada
          let cleanInitText = "";
          const labelMatch = line.match(/^\s*(?:(?:SOAL|QUESTION|BUTIR|NO\.?)\s*\d+|^\s*\d+[\.\)\-])\s*(.*)/i);
          if (labelMatch && labelMatch[1]) {
            cleanInitText = labelMatch[1].trim();
          } else {
            cleanInitText = line.replace(/^\s*(?:SOAL|QUESTION|BUTIR|NO\.?)\s*\d+[:\-\s]*/i, "")
                                .replace(/^\s*\d+[\.\)\-]\s*/, "")
                                .trim();
          }

          currentQuestion = {
            id: `QST-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`,
            examId: finalExamId,
            subExamName: finalSubExamName || "Umum",
            questionText: cleanInitText,
            options: { A: "", B: "", C: "", D: "", E: "" },
            correctOption: "A",
            explanation: "",
            hasOptions: false,
            hasAnswer: false,
            hasExplanation: false,
            lastField: "question"
          };
          lastOptionModified = null;
        } else {
          const optMatch = line.match(/^([A-E])\s*[\.\)\-\:\s]\s*(.*)/i);
          const ansMatch = line.match(/^(?:JAWABAN|KUNCI|KUNCI\s*JAWABAN|KUNCI\s*JAWABANNYA)\s*[:=\-\s]\s*([A-E])\b/i);
          const expMatch = line.match(/^(?:Pembahasan|Penjelasan|Solusi|Analisis|Tips)\s*[:\-]?\s*(.*)/i);

          if (optMatch) {
            const letter = optMatch[1].toUpperCase() as "A" | "B" | "C" | "D" | "E";
            const optText = optMatch[2].trim();
            currentQuestion.options[letter] = optText;
            currentQuestion.hasOptions = true;
            currentQuestion.lastField = "options";
            lastOptionModified = letter;
          } else if (ansMatch) {
            const ans = ansMatch[1].toUpperCase() as "A" | "B" | "C" | "D" | "E";
            currentQuestion.correctOption = ans;
            currentQuestion.hasAnswer = true;
            currentQuestion.lastField = "options";
          } else if (expMatch) {
            const expText = expMatch[1].trim();
            currentQuestion.explanation = expText;
            currentQuestion.hasExplanation = true;
            currentQuestion.lastField = "explanation";
          } else {
            if (currentQuestion.lastField === "question") {
              const currentText = currentQuestion.questionText;
              if (currentText.endsWith("\n")) {
                currentQuestion.questionText += line;
              } else {
                currentQuestion.questionText += (currentText ? " " : "") + line;
              }
            } else if (currentQuestion.lastField === "explanation" || currentQuestion.hasExplanation) {
              const currentExp = currentQuestion.explanation;
              if (currentExp.endsWith("\n")) {
                currentQuestion.explanation += line;
              } else {
                currentQuestion.explanation += (currentExp ? " " : "") + line;
              }
            } else if (currentQuestion.lastField === "options" && lastOptionModified) {
              const currentOptVal = currentQuestion.options[lastOptionModified];
              if (currentOptVal.endsWith("\n")) {
                currentQuestion.options[lastOptionModified] += line;
              } else {
                currentQuestion.options[lastOptionModified] += (currentOptVal ? " " : "") + line;
              }
            } else {
              const currentText = currentQuestion.questionText;
              if (currentText.endsWith("\n")) {
                currentQuestion.questionText += line;
              } else {
                currentQuestion.questionText += (currentText ? " " : "") + line;
              }
            }
          }
        }
      }

      // Save final dangling question block
      if (currentQuestion) {
        if (currentQuestion.questionText.trim()) {
          currentQuestion.questionText = currentQuestion.questionText.trim();
          currentQuestion.explanation = currentQuestion.explanation.trim() || "Sesuai petunjuk manual jawaban.";
          
          qs.push({
            id: currentQuestion.id,
            examId: currentQuestion.examId,
            subExamName: currentQuestion.subExamName,
            questionText: currentQuestion.questionText,
            options: {
              A: currentQuestion.options.A.trim() || "Opsi A",
              B: currentQuestion.options.B.trim() || "Opsi B",
              C: currentQuestion.options.C.trim() || "Opsi C",
              D: currentQuestion.options.D.trim() || "Opsi D",
              E: currentQuestion.options.E.trim() || "-"
            },
            correctOption: currentQuestion.correctOption,
            explanation: currentQuestion.explanation,
            isPublished: false
          });
        }
      }

      if (qs.length === 0) {
        setErrorMsg("Gagal melakukan parse. Tiada soal yang dapat diringkas. Periksa format atau pastikan opsi A, B, C, D diisi.");
      } else {
        setBulkParsedQuestions(qs);
        setSuccessMsg(`Berhasil mengurai ${qs.length} soal dengan sempurna tanpa ada yang terlewat! Tinjau hasilnya di bawah.`);
      }
    } catch (err: any) {
      setErrorMsg(`Gagal memproses parsing, harap cek kesesuaian template penulisan. Error: ${err.message}`);
    }
  };

  const saveBulkImport = (publishDirectly: boolean = false) => {
    if (bulkParsedQuestions.length === 0) return;

    const finalExamId = isManualExamActive ? manualExamId.trim() : selectedExamId;
    const finalExamName = isManualExamActive ? manualExamName.trim() : (packages.find(p => p.id === selectedExamId)?.name || "");
    const finalExamCategory = isManualExamActive ? manualExamCategory.trim() : (packages.find(p => p.id === selectedExamId)?.category || "Umum");
    const finalSubExamName = isManualSubExamActive ? manualSubExamText.trim() : selectedSubExam;

    if (isManualExamActive && (!finalExamId || !finalExamName)) {
      setErrorMsg("Untuk sektor manual, ID Paket dan Nama Paket kustom wajib diisi!");
      return;
    }

    if (isManualSubExamActive && !finalSubExamName) {
      setErrorMsg("Untuk sub-ujian manual, nama sub-ujian kustom wajib diisi!");
      return;
    }

    ensurePackageAndSubExamExists(finalExamId, finalExamName, finalExamCategory, finalSubExamName);

    // Prepare questions with desired isPublished value
    const preparedQuestions = bulkParsedQuestions.map(q => ({
      ...q,
      isPublished: publishDirectly
    }));

    onAddBulkQuestions(preparedQuestions);

    const updatedQs = [...questions, ...preparedQuestions];
    localStorage.setItem("KATA_KITA_QUESTIONS", JSON.stringify(updatedQs));
    setQuestions(updatedQs);

    if (publishDirectly) {
      setSuccessMsg(`Sukses menambahkan & menerbitkan ${preparedQuestions.length} soal massal langsung ke Ruang Ujian Siswa!`);
    } else {
      setSuccessMsg(`Sukses menambahkan ${preparedQuestions.length} soal massal baru ke Bank Soal (Draf)! Silakan terbitkan di tab 'Paket Ujian'.`);
    }
    setBulkParsedQuestions([]);
    setBulkText("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    setSuccessMsg("");

    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (fileType === 'docx') {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const arrayBuffer = evt.target?.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          if (!result.value.trim()) {
            throw new Error("Konten file Word kosong atau tidak dapat diekstrak.");
          }
          setBulkText(result.value);
          setSuccessMsg(`Berhasil membaca file Word (.docx): "${file.name}"! Silakan klik 'Proses Penguraian Teks' di bawah.`);
        } catch (err: any) {
          setErrorMsg(`Gagal memproses file Word: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileType === 'csv') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          const lines = text.split('\n').map(line => {
            return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
          }).filter(line => line.length > 0 && line[0] !== "");

          if (lines.length < 1) {
            throw new Error("File CSV kosong.");
          }

          let formatted = "";
          let startIndex = 0;
          
          const isHeader = lines[0].some(cell => 
            /soal|pertanyaan|question|opsi|jawaban|correct|pembahasan|explanation/i.test(cell)
          );
          if (isHeader) {
            startIndex = 1;
          }

          let qCount = 1;
          for (let i = startIndex; i < lines.length; i++) {
            const row = lines[i];
            if (row.length < 5) continue; // Must have question + options
            const qStr = row[0];
            const a = row[1] || "";
            const b = row[2] || "";
            const c = row[3] || "";
            const d = row[4] || "";
            const eOpt = row[5] || "";
            const correct = (row[6] || "A").toUpperCase();
            const pbh = row[7] || "";

            formatted += `${qCount}. ${qStr}\nA. ${a}\nB. ${b}\nC. ${c}\nD. ${d}\nE. ${eOpt}\nJAWABAN : ${correct}\nPembahasan:\n${pbh}\n\n`;
            qCount++;
          }

          if (formatted.trim() === "") {
            throw new Error("Tidak menemukan baris data soal yang valid di file CSV.");
          }

          setBulkText(formatted.trim());
          setSuccessMsg(`Berhasil mengonversi CSV "${file.name}" menjadi format standar teks (${qCount - 1} soal).`);
        } catch (err: any) {
          setErrorMsg(`Gagal membaca file CSV: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else {
      // Treat as standard raw text (.txt/etc)
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        setBulkText(text);
        setSuccessMsg(`Berhasil memuat file teks "${file.name}"! Silakan klik 'Proses Penguraian Teks' di bawah.`);
      };
      reader.readAsText(file);
    }
  };

  // AI-Powered Question Generator caller
  const handleGenerateAIQuestions = async () => {
    if (!aiPrompt.trim()) {
      alert("Harap masukkan prompt instruksi materi soal AI!");
      return;
    }

    setAiGenerating(true);
    setErrorMsg("");
    setSuccessMsg("");
    setAiGeneratedQuestions([]);

    const finalExamId = isManualExamActive ? manualExamId.trim() : selectedExamId;
    const finalExamCategory = isManualExamActive ? manualExamCategory.trim() : (packages.find(p => p.id === selectedExamId)?.category || "Umum");
    const finalSubExamName = isManualSubExamActive ? manualSubExamText.trim() : selectedSubExam;

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          category: finalExamCategory || "Umum",
          subExam: finalSubExamName || "Umum",
          count: aiQuestionCount
        })
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Format respons bermasalah (bukan JSON resmi). Kemungkinan server backend sedang berstatus idle/membangun koneksi atau server-key API belum diatur.\n\nDetail Server: ${text.substring(0, 150)}...`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Gagal berkomunikasi dengan asisten AI.");
      }

      if (data.questions && data.questions.length > 0) {
        setAiGeneratedQuestions(data.questions);
        setSuccessMsg(`Berhasil membangkitkan ${data.questions.length} soal orisinal HOTS dari server Gemini AI!`);
      } else {
        throw new Error("Format AI questions tidak valid.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terdapat kegagalan server AI. Silakan periksa kunci API Anda.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveAIGeneratedQuestions = () => {
    if (aiGeneratedQuestions.length === 0) return;

    const finalExamId = isManualExamActive ? manualExamId.trim() : selectedExamId;
    const finalExamName = isManualExamActive ? manualExamName.trim() : (packages.find(p => p.id === selectedExamId)?.name || "");
    const finalExamCategory = isManualExamActive ? manualExamCategory.trim() : (packages.find(p => p.id === selectedExamId)?.category || "Umum");
    const finalSubExamName = isManualSubExamActive ? manualSubExamText.trim() : selectedSubExam;

    if (isManualExamActive && (!finalExamId || !finalExamName)) {
      setErrorMsg("Untuk sektor manual, ID Paket dan Nama Paket kustom wajib diisi!");
      return;
    }

    if (isManualSubExamActive && !finalSubExamName) {
      setErrorMsg("Untuk sub-ujian manual, nama sub-ujian kustom wajib diisi!");
      return;
    }

    // Dynamic registration
    ensurePackageAndSubExamExists(finalExamId, finalExamName, finalExamCategory, finalSubExamName);

    const targetSubTest = finalSubExamName || "Umum";
    const existingCount = questions.filter(
      q => q.examId === finalExamId && q.subExamName === targetSubTest
    ).length;

    const parsedQs: Question[] = aiGeneratedQuestions.map((q: any, index: number) => {
      // Strip any existing leading sequence numbers like "1. ", "10. ", "(1) "
      const cleanText = q.questionText.replace(/^\s*\d+[\.\-\)]\s*/, "").trim();
      const currentSeqNum = existingCount + index + 1;
      const finalSeqText = `${currentSeqNum}. ${cleanText}`;

      return {
        id: `QST-AI-${Date.now()}-${index}-${Math.floor(100 + Math.random() * 900)}`,
        examId: finalExamId,
        subExamName: targetSubTest,
        questionText: finalSeqText,
        options: {
          A: q.options?.A || "Pilihan A",
          B: q.options?.B || "Pilihan B",
          C: q.options?.C || "Pilihan C",
          D: q.options?.D || "Pilihan D",
          E: q.options?.E || "Pilihan E"
        },
        correctOption: (q.correctOption || "A") as "A" | "B" | "C" | "D" | "E",
        explanation: q.explanation || "Sesuai petunjuk kunci jawaban terpilih.",
        isPublished: false // Saved in Bank Soal (Draf) by default
      };
    });

    onAddBulkQuestions(parsedQs);

    const updatedQs = [...questions, ...parsedQs];
    localStorage.setItem("KATA_KITA_QUESTIONS", JSON.stringify(updatedQs));
    setQuestions(updatedQs);

    setSuccessMsg(`Telah menyimpan ${parsedQs.length} soal AI ke dalam Bank Soal (Draf) paket secara teratur! Silakan terbitkan di tab 'Paket Ujian'.`);
    setAiGeneratedQuestions([]);
    setAiPrompt("");
  };

  const handleUpdateAIQuestionField = (idx: number, field: string, value: any) => {
    const updated = [...aiGeneratedQuestions];
    updated[idx] = {
      ...updated[idx],
      [field]: value
    };
    setAiGeneratedQuestions(updated);
  };

  const handleUpdateAIQuestionOption = (idx: number, optLetter: string, value: string) => {
    const updated = [...aiGeneratedQuestions];
    updated[idx] = {
      ...updated[idx],
      options: {
        ...(updated[idx].options || {}),
        [optLetter]: value
      }
    };
    setAiGeneratedQuestions(updated);
  };

  const handleDeleteAIQuestionField = (idx: number) => {
    const updated = aiGeneratedQuestions.filter((_, i) => i !== idx);
    setAiGeneratedQuestions(updated);
  };

  const handleAddManualToAIGrid = () => {
    const nextIdx = aiGeneratedQuestions.length + 1;
    const targetSubTest = selectedSubExam || "Umum";
    const existingCount = questions.filter(
      q => q.examId === selectedExamId && q.subExamName === targetSubTest
    ).length;
    const seqNum = existingCount + nextIdx;

    const newManualQ = {
      questionText: `${seqNum}. [Silakan tulis materi pertanyaan baru Anda disini...]`,
      options: {
        A: "",
        B: "",
        C: "",
        D: "",
        E: ""
      },
      correctOption: "A",
      explanation: "Diterbitkan manual lewat antarmuka komposer bank soal."
    };
    setAiGeneratedQuestions([...aiGeneratedQuestions, newManualQ]);
  };

  // Create Manual Package inside Dashboard
  const handleCreatePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!newPkgName.trim() || !newPkgId.trim()) {
      setErrorMsg("ID Paket dan Nama Paket tidak boleh kosong!");
      return;
    }

    // Build subExams directly from structured state newPkgSubExams
    const subExams: SubExamConfig[] = newPkgSubExams.map(se => ({
      name: se.name,
      questionCount: se.targetCount,
      durationMinutes: se.durationMinutes || Math.round(se.targetCount * 1.25)
    }));

    if (subExams.length === 0) {
      setErrorMsg("Minimal harus ada satu sub-ujian/sektor terpilih!");
      return;
    }

    const totalDuration = subExams.reduce((acc, current) => acc + current.durationMinutes, 0);
    const totalQuestionsCount = subExams.reduce((acc, current) => acc + current.questionCount, 0);

    const finalCategory = isCustomCategoryActive ? customCategoryInput.trim() : newPkgCategory;
    if (!finalCategory) {
      setErrorMsg("Kategori Bidang tidak boleh kosong! Silakan isi bidang manual Anda.");
      return;
    }

    const checkExisting = packages.find(p => p.id === newPkgId.trim());
    if (checkExisting) {
      setErrorMsg("ID Paket Ujian sudah terdaftar! Harap tentukan ID unik lainnya.");
      return;
    }

    const newPkg: ExamPackage = {
      id: newPkgId.trim(),
      name: newPkgName.trim(),
      category: finalCategory.toUpperCase().trim(),
      description: newPkgDesc.trim() || `Paket simulasi tryout sektor khusus ${newPkgName.trim()}.`,
      totalDurationMinutes: totalDuration > 0 ? totalDuration : parseInt(newPkgDuration),
      totalQuestions: totalQuestionsCount > 0 ? totalQuestionsCount : 15,
      subExams: subExams
    };

    const updatedPackagesList = [...packages, newPkg];
    if (onUpdatePackages) {
      onUpdatePackages(updatedPackagesList);
    }
    localStorage.setItem("KATA_KITA_PACKAGES", JSON.stringify(updatedPackagesList));
    setPackages(updatedPackagesList);

    setSuccessMsg(`Paket baru "${newPkg.name}" berhasil dibuat secara manual dan didaftarkan nasional!`);
    
    // reset form
    setNewPkgId("");
    setNewPkgName("");
    setNewPkgDesc("");
    setCustomCategoryInput("");
    setIsCustomCategoryActive(false);
    setNewPkgSubExams([
      { name: "Penalaran Umum", targetCount: 20, durationMinutes: 25 },
      { name: "Penalaran Kuantitatif", targetCount: 15, durationMinutes: 20 },
      { name: "Pemahaman Bacaan & Menulis", targetCount: 20, durationMinutes: 25 },
      { name: "Pengetahuan & Pemahaman Umum", targetCount: 20, durationMinutes: 25 }
    ]);
  };

  const handleStartEditPackage = (pkg: ExamPackage) => {
    setEditingPackageId(pkg.id);
    setEditPkgName(pkg.name);
    setEditPkgCategory(pkg.category);
    setEditPkgDesc(pkg.description);
    setEditPkgSubExams([...pkg.subExams]);
    setEditPkgSubExamInput("");
  };

  const handleSavePackage = (pkgId: string) => {
    if (!editPkgName.trim()) {
      alert("Nama paket tidak boleh kosong!");
      return;
    }
    if (!editPkgCategory.trim()) {
      alert("Kategori bidang tidak boleh kosong!");
      return;
    }
    if (editPkgSubExams.length === 0) {
      alert("Minimal harus ada satu sub-ujian!");
      return;
    }

    const totalDuration = editPkgSubExams.reduce((acc, current) => acc + current.durationMinutes, 0);
    const totalQuestionsCount = editPkgSubExams.reduce((acc, current) => acc + current.questionCount, 0);

    const updatedPackagesList = packages.map(pkg => {
      if (pkg.id === pkgId) {
        return {
          ...pkg,
          name: editPkgName.trim(),
          category: editPkgCategory.toUpperCase().trim(),
          description: editPkgDesc.trim(),
          totalDurationMinutes: totalDuration,
          totalQuestions: totalQuestionsCount,
          subExams: editPkgSubExams
        };
      }
      return pkg;
    });

    if (onUpdatePackages) {
      onUpdatePackages(updatedPackagesList);
    }
    localStorage.setItem("KATA_KITA_PACKAGES", JSON.stringify(updatedPackagesList));
    setPackages(updatedPackagesList);
    setEditingPackageId(null);
    alert("Paket ujian berhasil diperbarui!");
  };

  const handleDeletePackage = (pkgId: string, pkgName: string) => {
    setDeleteConfirmType("package");
    setDeleteIdTarget(pkgId);
  };

  // Toggle activation and lock keys for packages and sub-exams
  const handleToggleLock = (keyId: string) => {
    const nextLocks = {
      ...locks,
      [keyId]: !locks[keyId]
    };
    setLocks(nextLocks);
    localStorage.setItem("KATA_KITA_LOCKS", JSON.stringify(nextLocks));
  };

  const handlePkgChange = (examId: string) => {
    setSelectedExamId(examId);
    const pkg = packages.find(p => p.id === examId);
    if (pkg && pkg.subExams.length > 0) {
      setSelectedSubExam(pkg.subExams[0].name);
    } else {
      setSelectedSubExam("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden relative">
      
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Warna Biru Pendidikan Sidebar Left Pane */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#111827] to-[#1f2937] text-white flex flex-col justify-between shrink-0 shadow-2xl border-r border-[#374151] lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div>
          {/* Logo Brand bar */}
          <div className="p-6 border-b border-[#374151] flex items-center gap-3 bg-slate-900/40">
            <img
              src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png"
              alt="Bimbel Kata Kita Logo"
              className="h-10 w-auto bg-white/10 p-1 rounded-md"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold font-mono tracking-wider text-orange-400">ADMIN CONTROL</h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="lg:hidden text-white/60 hover:text-white p-1"
                  title="Close Sidebar Menu"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>
              <h1 className="text-xs font-extrabold tracking-tight">KATA KITA ONLINE</h1>
            </div>
          </div>

          {/* Admin Profil details indicator */}
          <div className="p-5 border-b border-[#374151] bg-[#111827]/60 flex items-center gap-3">
            {adminProfilePhoto ? (
              <img
                src={adminProfilePhoto}
                alt="Admin Avatar"
                className="w-10 h-10 rounded-full object-cover border border-slate-600 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt="Admin Avatar"
                className="w-10 h-10 rounded-full object-cover border border-slate-600 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#0F4C81] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                <i className="fa-solid fa-user-lock"></i>
              </div>
            )}
            <div className="truncate">
              <h3 className="text-xs font-extrabold truncate">{adminProfileName || user.fullname}</h3>
              <span className="text-[9px] text-[#A0AEC0] bg-[#2D3748] px-2 py-0.5 rounded-full inline-block mt-1">
                Kredensial Penguji Utama
              </span>
            </div>
          </div>

          {/* Navigasi Control Panels */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab("questions"); loadDatabaseState(); setIsMobileSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "questions" ? "bg-[#0F4C81] text-white shadow" : "text-[#A0AEC0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>Input Soal Manual</span>
            </button>

            <button
              onClick={() => { setActiveTab("bulk"); loadDatabaseState(); setIsMobileSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "bulk" ? "bg-[#0F4C81] text-white shadow" : "text-[#A0AEC0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <i className="fa-solid fa-file-import text-xs"></i>
              <span>Copy Paste Massal</span>
            </button>

            <button
              onClick={() => { setActiveTab("packages"); loadDatabaseState(); setIsMobileSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "packages" ? "bg-[#0F4C81] text-white shadow" : "text-[#A0AEC0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <i className="fa-solid fa-box-archive text-xs"></i>
              <span>Konfigurasi Paket Ujian</span>
            </button>

            <button
              onClick={() => { setActiveTab("locks"); loadDatabaseState(); setIsMobileSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "locks" ? "bg-red-700 text-white shadow" : "text-[#A0AEC0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <i className="fa-solid fa-lock text-xs"></i>
              <span>Pengaturan & Kunci Sesi</span>
            </button>

            <button
              onClick={() => { setActiveTab("results"); loadDatabaseState(); setIsMobileSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "results" ? "bg-[#0F4C81] text-white shadow" : "text-[#A0AEC0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <i className="fa-solid fa-users text-xs"></i>
              <span>Hasil & Rekap Siswa</span>
              {attempts.length > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {attempts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab("sheets"); loadDatabaseState(); setIsMobileSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "sheets" ? "bg-emerald-600 text-white shadow" : "text-[#A0AEC0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <i className="fa-solid fa-file-excel text-xs"></i>
              <span>Google Sheets Sync</span>
            </button>
          </nav>
        </div>

        {/* Bottom controls panel */}
        <div className="p-4 border-t border-[#374151] bg-[#111827]/80">
          <button
            onClick={onLogout}
            className="w-full bg-red-650/40 hover:bg-red-650 text-red-200 text-xs py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-500/20"
          >
            <i className="fa-solid fa-power-off text-xs"></i>
            <span>Log Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Workspace Area Right Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Workspace Top Header navbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile Hamburger menu trigger icon */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-[#0F4C81] hover:bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer transition-all"
              title="Buka Menu Navigasi"
            >
              <i className="fa-solid fa-bars text-sm"></i>
            </button>
            <h2 className="text-xs sm:text-sm font-black text-slate-700 capitalize truncate max-w-[140px] sm:max-w-none">
              {activeTab === "questions" ? "Manual" : activeTab === "bulk" ? "Copy Paste" : activeTab === "ai_gen" ? "Soal AI (Instant)" : activeTab === "packages" ? "Paket Ujian" : activeTab === "locks" ? "Kunci Nasional" : activeTab === "results" ? "Hasil Evaluasi" : "Sheets Sync"}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-mono text-slate-450 shrink-0">
            {/* System Refresh Button with spinner */}
            <button
              onClick={handleSystemRefresh}
              disabled={isRefreshingMenu}
              className={`p-1.5 sm:p-2 text-slate-700 hover:text-[#0F4C81] border border-slate-200 transition-all rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer font-sans ${isRefreshingMenu ? 'opacity-50' : ''}`}
              title="Refresh Database & Sync State"
            >
              <i className={`fa-solid fa-arrows-rotate text-[11px] sm:text-xs ${isRefreshingMenu ? 'animate-spin text-[#0F4C81]' : ''} ${isRefreshingMenu ? 'mr-0' : 'mr-1'}`}></i>
              <span className="text-[10px] font-extrabold hidden sm:inline">{isRefreshingMenu ? 'Memuat...' : 'Refresh DB'}</span>
            </button>

            {/* Paint brush theme selector popover */}
            <div className="relative">
              <button
                onClick={() => setShowThemePopover(!showThemePopover)}
                className="p-1.5 sm:p-2 text-slate-500 hover:text-orange-500 transition-colors rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer font-sans border border-slate-200"
                title="Pilih Kombinasi Warna Tema Platform"
              >
                <i className="fa-solid fa-paintbrush text-[11px] sm:text-xs sm:mr-1"></i>
                <span className="text-[10px] font-bold hidden sm:inline">Ubah Tema</span>
              </button>

              {showThemePopover && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowThemePopover(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50 animate-fade-in text-left">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-2.5 border-b border-slate-100 pb-1.5 flex items-center gap-1 font-sans">
                      <i className="fa-solid fa-palette text-[#F58220]"></i> Skema Warna Tema
                    </h4>
                    <div className="space-y-1.5">
                      {APP_THEMES.map((theme) => {
                        const isCurrent = theme.id === themeId;
                        return (
                          <button
                            key={theme.id}
                            onClick={() => {
                              if (onThemeChange) onThemeChange(theme.id);
                              setShowThemePopover(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all text-xs border font-sans ${
                              isCurrent 
                                ? "bg-slate-50 border-[#F58220] font-extrabold" 
                                : "bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-650"
                            }`}
                          >
                            <span className="truncate">{theme.name}</span>
                            <div className="flex gap-1 shrink-0 ml-2">
                              <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: theme.primaryColor }} />
                              <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: theme.accentColor }} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <span className="hidden md:inline">SOAL: <strong className="text-blue-600">{questions.length}</strong></span>
          </div>
        </header>

        {/* Scrollable Container workspace content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          
          {/* Active status banners */}
          {successMsg && (
            <div className="mb-6 bg-emerald-50 text-emerald-800 text-xs font-bold p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 bg-rose-50 text-rose-800 text-xs font-bold p-4 rounded-xl border border-rose-200 shadow-sm flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-rose-600 text-sm"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: INPUT SOAL MANUAL */}
          {activeTab === "questions" && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-950 font-display">
                  Formulir Penerbitan Soal Simulasi Tryout
                </h3>
                <p className="text-xs text-slate-400 mt-1">Sertakan detail butir pertanyaan dan visualisasi gambar jika dibutuhkan.</p>
              </div>

              <form onSubmit={handleManualQuestionSubmit} className="space-y-6">
                
                {/* Exam target selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4.5 rounded-xl border border-slate-200">
                  {/* Sektor Paket Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-500 uppercase">Sektor Paket Tryout (Tujuan Paket)</label>
                      <button
                        type="button"
                        onClick={() => setIsManualExamActive(!isManualExamActive)}
                        className="text-[10px] text-[#0F4C81] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <i className={`fa-solid ${isManualExamActive ? "fa-list" : "fa-pen-to-square"}`}></i>
                        <span>{isManualExamActive ? "Pilih dari Daftar" : "Isi Paket Manual..."}</span>
                      </button>
                    </div>

                    {isManualExamActive ? (
                      <div className="space-y-2.5 p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-150/60 font-sans text-left">
                        <div>
                          <label className="block text-[10px] font-bold text-[#0F4C81] uppercase mb-1">ID Paket Kustom (Contoh: EXM-PRIBADI)</label>
                          <input
                            type="text"
                            placeholder="Contoh: EXM-MAT-S2"
                            className="block w-full rounded-lg border border-indigo-200 bg-white p-2 text-xs text-slate-800 font-mono"
                            value={manualExamId}
                            onChange={(e) => setManualExamId(e.target.value.toUpperCase())}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#0F4C81] uppercase mb-1">Nama Paket Kustom</label>
                          <input
                            type="text"
                            placeholder="Contoh: Tryout Matematika Lanjutan"
                            className="block w-full rounded-lg border border-indigo-200 bg-white p-2 text-xs text-slate-800"
                            value={manualExamName}
                            onChange={(e) => setManualExamName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#0F4C81] uppercase mb-1">Kategori Bidang</label>
                          <input
                            type="text"
                            placeholder="Contoh: UTBK, CPNS, Kedinasan"
                            className="block w-full rounded-lg border border-indigo-200 bg-white p-2 text-xs text-slate-800"
                            value={manualExamCategory}
                            onChange={(e) => setManualExamCategory(e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <select
                        value={selectedExamId}
                        onChange={(e) => handlePkgChange(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                      >
                        {packages.map(p => (
                          <option key={p.id} value={p.id}>{p.category} - {p.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Kategori Sub-Ujian Selection */}
                  <div className="space-y-2 self-start font-sans text-left">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-500 uppercase">Kategori Sub-Ujian (Sub-Test)</label>
                      <button
                        type="button"
                        onClick={() => setIsManualSubExamActive(!isManualSubExamActive)}
                        className="text-[10px] text-[#0F4C81] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <i className={`fa-solid ${isManualSubExamActive ? "fa-list" : "fa-pen-to-square"}`}></i>
                        <span>{isManualSubExamActive ? "Pilih dari Daftar" : "Isi Sub-Test Manual..."}</span>
                      </button>
                    </div>

                    {isManualSubExamActive ? (
                      <div className="p-3.5 bg-orange-50/40 rounded-xl border border-orange-150/60 font-sans text-left">
                        <label className="block text-[10px] font-bold text-[#F58220] uppercase mb-1">Nama Sub-Ujian Kustom</label>
                        <input
                          type="text"
                          placeholder="Contoh: Tes Integritas Bangsa, TOEFL Reading"
                          className="block w-full rounded-lg border border-orange-200 bg-white p-2 text-xs text-slate-800"
                          value={manualSubExamText}
                          onChange={(e) => setManualSubExamText(e.target.value)}
                        />
                      </div>
                    ) : (
                      <select
                        value={selectedSubExam}
                        onChange={(e) => setSelectedSubExam(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                      >
                        {selectedPkg?.subExams.map(se => (
                          <option key={se.name} value={se.name}>{se.name}</option>
                        ))}
                        {!selectedPkg?.subExams.length && <option value="Umum">Umum</option>}
                      </select>
                    )}
                  </div>
                </div>

                {/* Narration area */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Pertanyaan Utama (Soal)</label>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      rows={4}
                      className="block w-full rounded-lg border border-slate-300 p-3 text-xs bg-white text-slate-800 focus:outline-none"
                      placeholder="Tuliskan pertanyaan disini..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                      <i className="fa-solid fa-image text-blue-500"></i> Lampiran Gambar Pertanyaan (Opsional)
                    </label>
                    <div className="flex gap-4 items-center flex-wrap">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, setQuestionImg)}
                        className="text-xs text-slate-500 cursor-pointer"
                      />
                      {questionImg && (
                        <div className="flex items-center gap-3">
                          <img src={questionImg} alt="Preview" className="h-10 w-auto rounded border" />
                          <button 
                            type="button"
                            onClick={() => setQuestionImg("")}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-200 text-[10px] font-extrabold px-2.5 py-1 rounded"
                          >
                            <i className="fa-solid fa-trash mr-1"></i>Hapus Gambar
                          </button>
                        </div>
                      )}
                    </div>
                    {questionImg && (
                      <div className="mt-2.5 p-3 bg-blue-50/45 rounded-lg border border-blue-100/70 flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Posisikan Gambar:</span>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-bold">
                            <input 
                              type="radio" 
                              name="questionImgPos" 
                              checked={questionImgPos === "above"} 
                              onChange={() => setQuestionImgPos("above")}
                              className="text-blue-600 focus:ring-blue-550 h-3.5 w-3.5"
                            />
                            Di Atas Teks
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-bold">
                            <input 
                              type="radio" 
                              name="questionImgPos" 
                              checked={questionImgPos === "middle"} 
                              onChange={() => setQuestionImgPos("middle")}
                              className="text-blue-600 focus:ring-blue-550 h-3.5 w-3.5"
                            />
                            Di Tengah Teks
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-bold">
                            <input 
                              type="radio" 
                              name="questionImgPos" 
                              checked={questionImgPos === "below"} 
                              onChange={() => setQuestionImgPos("below")}
                              className="text-blue-600 focus:ring-blue-550 h-3.5 w-3.5"
                            />
                            Di Bawah Teks
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question choices A to E */}
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block pt-2">Jawaban Ganda (A-E)</span>
                
                <div className="space-y-4">
                  {[
                    { label: "A", val: optionA, setter: setOptionA, img: imgA, imgSetter: setImgA, imgPos: imgPosA, imgPosSetter: setImgPosA },
                    { label: "B", val: optionB, setter: setOptionB, img: imgB, imgSetter: setImgB, imgPos: imgPosB, imgPosSetter: setImgPosB },
                    { label: "C", val: optionC, setter: setOptionC, img: imgC, imgSetter: setImgC, imgPos: imgPosC, imgPosSetter: setImgPosC },
                    { label: "D", val: optionD, setter: setOptionD, img: imgD, imgSetter: setImgD, imgPos: imgPosD, imgPosSetter: setImgPosD },
                    { label: "E", val: optionE, setter: setOptionE, img: imgE, imgSetter: setImgE, imgPos: imgPosE, imgPosSetter: setImgPosE }
                  ].map((item, idx) => (
                    <div key={item.label} className="p-4 bg-slate-50/50 rounded-xl border border-slate-150 flex flex-col md:flex-row md:items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                        {item.label}
                      </span>
                      <input
                        type="text"
                        value={item.val}
                        onChange={(e) => item.setter(e.target.value)}
                        placeholder={`Teks pilihan ${item.label}...`}
                        className="flex-1 rounded-lg border border-slate-300 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />

                      {/* Image attachments & positioning for choices */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0 bg-white p-2 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileChange(e, item.imgSetter)}
                            id={`manual-choice-img-${item.label}`}
                            className="hidden"
                          />
                          <label
                            htmlFor={`manual-choice-img-${item.label}`}
                            className={`px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-black cursor-pointer hover:bg-slate-100 uppercase ${
                              item.img ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-white text-slate-550"
                            }`}
                          >
                            {item.img ? "Ubah Gambar" : "+ Gambar"}
                          </label>
                          {item.img && (
                            <button
                              type="button"
                              onClick={() => item.imgSetter("")}
                              className="text-[9px] text-rose-500 hover:underline font-black uppercase"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                        {item.img && (
                          <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
                            <img src={item.img} alt="review" className="h-6 w-auto rounded border" />
                            <select
                              value={item.imgPos}
                              onChange={(e) => item.imgPosSetter(e.target.value as "above" | "below" | "middle")}
                              className="text-[9px] bg-slate-50 border border-slate-250 rounded px-1.5 py-1 text-slate-700 font-extrabold focus:outline-none"
                            >
                              <option value="above">Di Atas Teks</option>
                              <option value="middle">Di Tengah Teks</option>
                              <option value="below">Di Bawah Teks</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Answer & official explanation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase mb-1.5">Kunci Jawaban</label>
                    <select
                      value={correctOption}
                      onChange={(e) => setCorrectOption(e.target.value as any)}
                      className="block w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-bold text-slate-800"
                    >
                      <option value="A">Pilihan A</option>
                      <option value="B">Pilihan B</option>
                      <option value="C">Pilihan C</option>
                      <option value="D">Pilihan D</option>
                      <option value="E">Pilihan E</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-550 uppercase mb-1.5">Teks Argumentasi Jawaban (Pembahasan)</label>
                    <textarea
                      rows={3}
                      className="block w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:outline-none"
                      placeholder="Tuliskan analisis detail mengapa kunci tersebut memenangi penyelesaian (dapat menekan Enter untuk spasi/baris baru)..."
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white font-extrabold text-xs py-3.5 px-8 rounded-lg border-b-2 border-b-black transition-all shadow-md cursor-pointer"
                  >
                    Simpan Soal Baru
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: COPY-PAST MASSAL */}
          {activeTab === "bulk" && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-950 font-display">
                    Uraian Copy-Paste / Impor Massal
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Impor puluhan soal tryout instan dari lembar berkas teks atau word dokumen dengan format penulisan teratur.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Lef Inputs */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Sektor & Sub selection with manual kustom option */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4.5 rounded-xl border border-slate-200">
                      {/* Sektor Paket Selection */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-500 uppercase">Tujuan Paket</label>
                          <button
                            type="button"
                            onClick={() => setIsManualExamActive(!isManualExamActive)}
                            className="text-[10px] text-[#0F4C81] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <i className={`fa-solid ${isManualExamActive ? "fa-list" : "fa-pen-to-square"}`}></i>
                            <span>{isManualExamActive ? "Pilih Daftar" : "Ujian Manual..."}</span>
                          </button>
                        </div>

                        {isManualExamActive ? (
                          <div className="space-y-2 p-3 bg-indigo-50/40 rounded-xl border border-indigo-150/60 font-sans text-left">
                            <div>
                              <label className="block text-[9px] font-bold text-[#0F4C81] uppercase mb-0.5">ID Paket Kustom</label>
                              <input
                                type="text"
                                placeholder="Contoh: EXM-MAT-S2"
                                className="block w-full rounded-lg border border-indigo-200 bg-white p-2 text-[11px] text-slate-800 font-mono"
                                value={manualExamId}
                                onChange={(e) => setManualExamId(e.target.value.toUpperCase())}
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-[#0F4C81] uppercase mb-0.5">Nama Paket Kustom</label>
                              <input
                                type="text"
                                placeholder="Contoh: Tryout Matematika Lanjutan"
                                className="block w-full rounded-lg border border-indigo-200 bg-white p-2 text-[11px] text-slate-800"
                                value={manualExamName}
                                onChange={(e) => setManualExamName(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-[#0F4C81] uppercase mb-0.5">Kategori Bidang</label>
                              <input
                                type="text"
                                placeholder="Contoh: UTBK, CPNS, Kedinasan"
                                className="block w-full rounded-lg border border-indigo-200 bg-white p-2 text-[11px] text-slate-800"
                                value={manualExamCategory}
                                onChange={(e) => setManualExamCategory(e.target.value)}
                              />
                            </div>
                          </div>
                        ) : (
                          <select
                            value={selectedExamId}
                            onChange={(e) => handlePkgChange(e.target.value)}
                            className="block w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:outline-none"
                          >
                            {packages.map(p => (
                              <option key={p.id} value={p.id}>{p.category} - {p.name}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Kategori Sub-Ujian Selection */}
                      <div className="space-y-2 self-start font-sans text-left">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-500 uppercase">Sub-Ujian Target</label>
                          <button
                            type="button"
                            onClick={() => setIsManualSubExamActive(!isManualSubExamActive)}
                            className="text-[10px] text-[#0F4C81] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <i className={`fa-solid ${isManualSubExamActive ? "fa-list" : "fa-pen-to-square"}`}></i>
                            <span>{isManualSubExamActive ? "Pilih Daftar" : "Sub-Test Manual..."}</span>
                          </button>
                        </div>

                        {isManualSubExamActive ? (
                          <div className="p-3 bg-orange-50/40 rounded-xl border border-orange-150/60 font-sans text-left">
                            <label className="block text-[9px] font-bold text-[#F58220] uppercase mb-0.5">Nama Sub-Ujian Kustom</label>
                            <input
                              type="text"
                              placeholder="Contoh: Tes Integritas Bangsa"
                              className="block w-full rounded-lg border border-orange-200 bg-white p-2 text-[11px] text-slate-800"
                              value={manualSubExamText}
                              onChange={(e) => setManualSubExamText(e.target.value)}
                            />
                          </div>
                        ) : (
                          <select
                            value={selectedSubExam}
                            onChange={(e) => setSelectedSubExam(e.target.value)}
                            className="block w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:outline-none"
                          >
                            {selectedPkg?.subExams.map(se => (
                              <option key={se.name} value={se.name}>{se.name}</option>
                            ))}
                            {!selectedPkg?.subExams.length && <option value="Umum">Umum</option>}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* FILE DRAG/DROP & SELECT PANEL */}
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center space-y-2 mt-4">
                      <div className="mx-auto w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[#0F4C81]">
                        <i className="fa-solid fa-file-arrow-up text-lg"></i>
                      </div>
                      <div className="space-y-1">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 bg-[#0F4C81] hover:bg-[#0c3e6a] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                          <i className="fa-solid fa-cloud-arrow-up"></i>
                          <span>Unggah File Soal</span>
                          <input
                            type="file"
                            accept=".docx,.csv,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-slate-550">
                          Mendukung berkas Word (<span className="font-semibold text-slate-700">.docx</span>), Excel/CSV (<span className="font-semibold text-slate-700">.csv</span>), atau Dokumen Teks (<span className="font-semibold text-slate-700">.txt</span>).
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Area Teks Salinan</label>
                      <textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        rows={10}
                        className="block w-full rounded-lg border border-slate-300 bg-slate-900 text-emerald-400 font-mono text-xs p-4 leading-relaxed focus:ring-1 focus:ring-indigo-500"
                        placeholder="Tempel dokumen anda disini atau gunakan tombol unggah berkas..."
                      />
                    </div>

                    <div className="flex flex-wrap gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={handleParseBulk}
                        className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white font-extrabold text-xs py-3 px-4.5 rounded-lg border-b border-b-indigo-900 shadow transition-all cursor-pointer flex items-center gap-1.5 justify-center"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        <span>Proses Penguraian Teks</span>
                      </button>

                      {bulkParsedQuestions.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => saveBulkImport(false)}
                            className="bg-[#2ECC71] hover:bg-emerald-600 text-white font-extrabold text-xs py-3 px-4 rounded-lg border-b border-b-emerald-800 shadow transition-all cursor-pointer flex items-center gap-1.5 justify-center"
                            title="Simpan soal sebagai Draf saja di Bank Soal (belum diterbitkan)"
                          >
                            <i className="fa-solid fa-floppy-disk"></i>
                            <span>Simpan Draf ({bulkParsedQuestions.length} Soal)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => saveBulkImport(true)}
                            className="bg-gradient-to-r from-orange-500 to-[#F58220] hover:from-orange-600 hover:to-orange-700 text-white font-black text-xs py-3 px-4 rounded-lg border-b border-b-orange-800 shadow transition-all cursor-pointer flex items-center gap-1.5 justify-center"
                            title="Simpan soal dan langsung terbitkan ke Ruang Ujian siswa"
                          >
                            <i className="fa-solid fa-cloud-arrow-up"></i>
                            <span>Simpan &amp; Terbitkan Langsung ke Siswa</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Instruction Right with Interactive Tabs */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-orange-50/80 to-amber-50/40 border border-orange-200 rounded-xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-orange-200 pb-2">
                      <i className="fa-solid fa-circle-info text-[#F58220]"></i> Panduan Format & Berkas
                    </h4>
                    
                    {/* Segment Tab Selector */}
                    <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-orange-200">
                      <button
                        type="button"
                        onClick={() => setInstructionTab("word")}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                          instructionTab === "word" ? "bg-orange-105 bg-orange-100 text-orange-900 shadow-sm font-black" : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <i className="fa-solid fa-file-word mr-1"></i>
                        Word (.docx)
                      </button>
                      <button
                        type="button"
                        onClick={() => setInstructionTab("csv")}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                          instructionTab === "csv" ? "bg-emerald-100 text-emerald-950 shadow-sm font-black" : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <i className="fa-solid fa-file-csv mr-1"></i>
                        Excel / CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => setInstructionTab("text")}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                          instructionTab === "text" ? "bg-slate-200 text-slate-900 shadow-sm font-black" : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <i className="fa-solid fa-file-lines mr-1"></i>
                        Teks Salinan
                      </button>
                    </div>

                    {instructionTab === "word" && (
                      <div className="space-y-3 font-sans text-left animate-fade-in text-[11px] text-slate-650 leading-relaxed">
                        <p className="font-semibold text-slate-800">
                          💼 <span className="underline">Pengunggahan Word (.docx)</span>:
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Sistem akan mengekstrak otomatis seluruh teks di dokumen Anda.</li>
                          <li>Struktur penulisan wajib konsisten diawali dengan penomoran angka, misal: <span className="font-mono bg-white px-1 font-bold">1. </span></li>
                          <li>Tulis tanda kunci jawaban dengan <span className="font-mono font-bold bg-white px-1">JAWABAN : [Opsi]</span>.</li>
                          <li>Simpan pembahasan di bawah tag baris <span className="font-mono font-bold bg-white px-1">Pembahasan:</span>.</li>
                        </ul>
                        <div className="bg-white p-3 rounded border border-orange-200 text-[10px] text-slate-700 font-mono leading-normal whitespace-pre-wrap">
<span className="text-indigo-650 font-bold">// FORMAT DI WORD DOCUMENT (.DOCX):</span>
1. Ibukota Indonesia yang ditetapkan di Pulau Kalimantan adalah...
A. Palangkaraya
B. Nusantara
C. Samarinda
D. Balikpapan
E. Pontianak

JAWABAN : B

Pembahasan:
Presiden meresmikan kota Nusantara sebagai IKN baru Republik Indonesia.
                        </div>
                      </div>
                    )}

                    {instructionTab === "csv" && (
                      <div className="space-y-3 font-sans text-left animate-fade-in text-[11px] text-slate-650 leading-relaxed">
                        <p className="font-semibold text-slate-800">
                          📊 <span className="underline">Panduan Format File Excel / CSV</span>:
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>File wajib disimpan dengan akhiran ekstensi <span className="font-bold">.csv</span> (Comma Separated).</li>
                          <li>Sediakan 8 kolom penting dengan urutan berikut:</li>
                        </ul>
                        <div className="bg-white p-2.5 rounded border border-orange-200 font-normal">
                          <table className="w-full text-[9px] border-collapse border border-slate-200 font-mono">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="border border-slate-200 p-0.5 font-bold">No</th>
                                <th className="border border-slate-200 p-0.5 font-bold">Kolom</th>
                                <th className="border border-slate-200 p-0.5 font-bold">Contoh Isian</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-slate-100 p-0.5 font-bold text-center">1</td>
                                <td className="border border-slate-100 p-0.5">Pertanyaan</td>
                                <td className="border border-slate-100 p-0.5">Hasil dari 5 x 5 adalah...</td>
                              </tr>
                              <tr>
                                <td className="border border-slate-100 p-0.5 font-bold text-center">2-6</td>
                                <td className="border border-slate-100 p-0.5">Opsi A s/d E</td>
                                <td className="border border-slate-100 p-0.5">A: 10, B: 25, dst.</td>
                              </tr>
                              <tr>
                                <td className="border border-slate-100 p-0.5 font-bold text-center">7</td>
                                <td className="border border-slate-100 p-0.5">Jawaban</td>
                                <td className="border border-slate-100 p-0.5">B</td>
                              </tr>
                              <tr>
                                <td className="border border-slate-100 p-0.5 font-bold text-center">8</td>
                                <td className="border border-slate-100 p-0.5">Pembahasan</td>
                                <td className="border border-slate-100 p-0.5">Karena 5 kali 5 sama dengan 25.</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="text-[10px] text-amber-700 font-medium italic">
                          *Sistem akan auto-format isi spreadsheet menjadi format teks salinan siap parse di text area!
                        </p>
                      </div>
                    )}

                    {instructionTab === "text" && (
                      <div className="space-y-3 font-sans text-left animate-fade-in text-[11px] text-slate-650 leading-relaxed">
                        <p className="font-semibold text-slate-800">
                          ✍️ <span className="underline">Format Salinan Teks Langsung</span>:
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Tempel teks salinan langsung di kolom sebelah kiri.</li>
                          <li>Gunakan format penulisan bersih yang sejenis dengan contoh pengetikan di atas.</li>
                          <li>Pastikan kunci jawaban <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1">JAWABAN : [A-E]</span> tertera di setiap butir soal guna mendeteksi kunci otomatis.</li>
                          <li>Pembahasan di bawah kata <span className="font-bold">Pembahasan:</span> akan diekstrak penuh tanpa tertinggal.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Previews Table */}
              {bulkParsedQuestions.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 shadow-inner">
                  <div className="flex flex-wrap justify-between items-center border-b border-slate-150 pb-3 gap-2">
                    <h4 className="text-xs font-bold text-[#0F4C81] uppercase tracking-widest pl-1 flex items-center">
                      <i className="fa-solid fa-list-check text-blue-800 mr-2 text-sm"></i>
                      Pratinjau Hasil Parser ({bulkParsedQuestions.length} Soal Terdeteksi)
                    </h4>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleClearAllParsedQuestions}
                        className="bg-red-50 hover:bg-red-105 hover:bg-red-100 text-red-650 hover:text-red-800 font-extrabold text-[10px] py-1.5 px-3 rounded-lg border border-red-200 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        title="Hapus seluruh soal dari daftar pratinjau"
                      >
                        <i className="fa-solid fa-trash-can text-red-600"></i>
                        <span>Hapus Seluruh Soal</span>
                      </button>
                      <span className="text-[10px] font-bold text-slate-500 italic">Tinjau kunci &amp; penjelasan sebelum disimpan ke basis data</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6 divide-y divide-slate-200 max-h-120 overflow-y-auto pr-2">
                    {bulkParsedQuestions.map((q, idx) => (
                      <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200 pt-4 space-y-3 relative group transition-all hover:border-slate-300">
                        {/* Remove button inside the card header */}
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold bg-indigo-50 text-[#0F4C81] px-2.5 py-0.5 rounded-full uppercase font-mono">
                            Butir #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteParsedQuestion(idx)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Hapus butir soal ini dari pratinjau"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                            <span>Hapus</span>
                          </button>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-800 whitespace-pre-wrap leading-relaxed">{q.questionText}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2 pt-1 text-[11px] text-slate-600 font-sans">
                          <div className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-200">
                            <span className="font-extrabold text-blue-900 font-mono">A.</span> {q.options.A}
                          </div>
                          <div className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-200">
                            <span className="font-extrabold text-blue-900 font-mono">B.</span> {q.options.B}
                          </div>
                          <div className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-200">
                            <span className="font-extrabold text-blue-900 font-mono">C.</span> {q.options.C}
                          </div>
                          <div className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-200">
                            <span className="font-extrabold text-blue-900 font-mono">D.</span> {q.options.D}
                          </div>
                          <div className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-200">
                            <span className="font-extrabold text-blue-900 font-mono">E.</span> {q.options.E}
                          </div>
                        </div>

                        {/* Rich KUNCI & PEMBAHASAN PRATINJAU */}
                        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4.5 space-y-2 mt-3 text-left">
                          <div className="flex items-center gap-1.5 text-xs font-black text-amber-850">
                            <i className="fa-solid fa-lightbulb text-amber-600"></i>
                            <span>Analisis &amp; Pembahasan Resmi</span>
                          </div>
                          
                          <div className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5 font-sans">
                            <span>KUNCI JAWABAN:</span>
                            <span className="font-mono bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded font-black border border-emerald-300">
                              {q.correctOption}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-700 leading-relaxed font-sans whitespace-pre-wrap border-t border-amber-250 border-dashed pt-2 mt-2">
                            {q.explanation || "Tidak ada pembahasan yang terbaca."}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DYNAMIC AI GENERATOR GENERATOR */}
          {activeTab === "ai_gen" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-bold bg-[#F58220] text-white px-2.5 py-0.5 rounded">FITUR PREMIUM</span>
                  <h3 className="text-xl font-bold font-display text-slate-900 mt-2">
                    Penetasan Butir Soal Instan melalui Gemini AI
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Gunakan prompt asisten cerdas untuk melahirkan soal Tryout HOTS nasional instan.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left parameter inputs */}
                  <div className="space-y-4 bg-slate-50/55 p-5 rounded-xl border border-slate-200">
                    {/* Sektor Target Custom / Manual */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-500 uppercase">Sektor Target</label>
                          <button
                            type="button"
                            onClick={() => setIsManualExamActive(!isManualExamActive)}
                            className="text-[10px] text-[#0F4C81] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <i className={`fa-solid ${isManualExamActive ? "fa-list" : "fa-pen-to-square"}`}></i>
                            <span>{isManualExamActive ? "Daftar" : "Manual..."}</span>
                          </button>
                        </div>

                        {isManualExamActive ? (
                          <div className="space-y-2 p-3 bg-indigo-50/40 rounded-xl border border-indigo-150/60 font-sans text-left">
                            <div>
                              <label className="block text-[9px] font-bold text-[#0F4C81] uppercase mb-0.5">ID Paket Kustom</label>
                              <input
                                type="text"
                                placeholder="Contoh: EXM-MAT-S2"
                                className="block w-full rounded-lg border border-indigo-200 bg-white p-2 text-[11px] text-slate-800 font-mono"
                                value={manualExamId}
                                onChange={(e) => setManualExamId(e.target.value.toUpperCase())}
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-[#0F4C81] uppercase mb-0.5">Nama Paket</label>
                              <input
                                type="text"
                                placeholder="Contoh: Tryout MTK"
                                className="block w-full rounded-lg border border-indigo-200 bg-white p-2 text-[11px] text-slate-800"
                                value={manualExamName}
                                onChange={(e) => setManualExamName(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-[#0F4C81] uppercase mb-0.5">Kategori</label>
                              <input
                                type="text"
                                placeholder="Contoh: UTBK"
                                className="block w-full rounded-lg border border-indigo-200 bg-white p-2 text-[11px] text-slate-800"
                                value={manualExamCategory}
                                onChange={(e) => setManualExamCategory(e.target.value)}
                              />
                            </div>
                          </div>
                        ) : (
                          <select
                            value={selectedExamId}
                            onChange={(e) => handlePkgChange(e.target.value)}
                            className="block w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:outline-none"
                          >
                            {packages.map(p => (
                              <option key={p.id} value={p.id}>{p.category} - {p.name}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-500 uppercase">Sektor Sub-Ujian</label>
                          <button
                            type="button"
                            onClick={() => setIsManualSubExamActive(!isManualSubExamActive)}
                            className="text-[10px] text-[#0F4C81] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <i className={`fa-solid ${isManualSubExamActive ? "fa-list" : "fa-pen-to-square"}`}></i>
                            <span>{isManualSubExamActive ? "Daftar" : "Manual..."}</span>
                          </button>
                        </div>

                        {isManualSubExamActive ? (
                          <div className="p-3 bg-orange-50/40 rounded-xl border border-orange-150/60 font-sans text-left font-sans text-left">
                            <label className="block text-[9px] font-bold text-[#F58220] uppercase mb-0.5">Sub-Ujian Kustom</label>
                            <input
                              type="text"
                              placeholder="Contoh: Tes Integritas"
                              className="block w-full rounded-lg border border-orange-200 bg-white p-2 text-[11px] text-slate-800"
                              value={manualSubExamText}
                              onChange={(e) => setManualSubExamText(e.target.value)}
                            />
                          </div>
                        ) : (
                          <select
                            value={selectedSubExam}
                            onChange={(e) => setSelectedSubExam(e.target.value)}
                            className="block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                          >
                            {selectedPkg?.subExams.map(se => (
                              <option key={se.name} value={se.name}>{se.name}</option>
                            ))}
                            {!selectedPkg?.subExams.length && <option value="Umum">Umum</option>}
                          </select>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Jumlah Soal</label>
                      <select
                        value={isManualAIQuantity ? "manual" : aiQuestionCount}
                        onChange={(e) => {
                          if (e.target.value === "manual") {
                            setIsManualAIQuantity(true);
                          } else {
                            setIsManualAIQuantity(false);
                            setAiQuestionCount(parseInt(e.target.value));
                          }
                        }}
                        className="block w-full rounded-lg border border-slate-300 p-2.5 bg-white text-xs text-slate-800 font-bold focus:outline-none"
                      >
                        <option value={1}>1 Soal</option>
                        <option value={3}>3 Soal</option>
                        <option value={5}>5 Soal</option>
                        <option value={10}>10 Soal</option>
                        <option value="manual">Isi Manual...</option>
                      </select>

                      {isManualAIQuantity && (
                        <div className="mt-2.5 animate-fade-in text-left">
                          <input
                            type="number"
                            min={1}
                            max={50}
                            placeholder="Contoh: 15"
                            value={manualAIQuantityText}
                            onChange={(e) => {
                              setManualAIQuantityText(e.target.value);
                              const parsed = parseInt(e.target.value);
                              if (!isNaN(parsed) && parsed > 0) {
                                setAiQuestionCount(parsed);
                              }
                            }}
                            className="block w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-850 font-bold bg-white focus:outline-none"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Masukkan jumlah soal yang Anda kehendaki secara manual (1 - 50).</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right description prompt area */}
                  <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-bold text-[#F58220] uppercase tracking-wider mb-1.5">Perintah Prompting Materi & Topik</label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={4}
                        placeholder="Contoh: Buatlah materi logaritma eksponensial matematika SMA tingkat rumit dengan mengecoh pada opsi jawaban C atau D."
                        className="block w-full rounded-lg border border-slate-300 p-3 bg-white text-xs text-slate-800 focus:outline-none leading-relaxed"
                      />
                      <p className="text-[10px] text-slate-400 mt-1.5">Teks prompt harus merincikan materi spesifik yang diujikan secara rinci.</p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      {aiGenerating ? (
                        <button
                          type="button"
                          disabled
                          className="bg-orange-500 text-white font-extrabold text-xs py-3 px-8 rounded-lg cursor-not-allowed flex items-center gap-2 select-none"
                        >
                          <i className="fa-solid fa-spinner animate-spin"></i>
                          <span>Merumuskan Butir Soal Nasional (Harap Tunggu)...</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleGenerateAIQuestions}
                          className="bg-[#F58220] hover:bg-[#e07116] text-white font-extrabold text-xs py-3 px-8 rounded-lg border-b-2 border-b-amber-800 shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <i className="fa-solid fa-bolt"></i>
                          <span>Hasilkan Soal Instant Sekarang</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Previews for AI questions */}
              {aiGeneratedQuestions.length > 0 && (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-4 gap-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Daftar Pertanyaan AI Terpilih ({aiGeneratedQuestions.length} Soal)</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Edit butir materi, koreksi kunci, tambahkan soal manual baru, atau rapikan sebelum disubmit.</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleAddManualToAIGrid}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-plus text-xs"></i>
                        <span>Tambah Manual</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAIGeneratedQuestions}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-5 rounded-lg shadow cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-cloud-arrow-up text-xs"></i>
                        <span>Urutkan & Integrasikan</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-8 divide-y divide-slate-150">
                    {aiGeneratedQuestions.map((q, idx) => (
                      <div key={idx} className="space-y-4 pt-6 first:pt-0">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                          <span className="text-indigo-750 uppercase tracking-widest font-mono text-[10px]">SOAL KATA KITA #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAIQuestionField(idx)}
                            className="text-red-500 hover:text-red-750 text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can text-[10px]"></i> Hapus
                          </button>
                        </div>

                        {/* Editable Question Body */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Draf Teks Pertanyaan</label>
                          <textarea
                            value={q.questionText}
                            onChange={(e) => handleUpdateAIQuestionField(idx, "questionText", e.target.value)}
                            rows={3}
                            className="block w-full rounded-xl border border-slate-200 p-3 bg-slate-50/50 text-xs text-slate-800 font-extrabold focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Editable Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                          {["A", "B", "C", "D", "E"].map(opt => (
                            <div key={opt} className="space-y-1" id={`option-container-${opt}`}>
                              <label className="text-[10px] font-bold text-slate-400 block pl-1">Opsi {opt}</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={q.options?.[opt] || ""}
                                  onChange={(e) => handleUpdateAIQuestionOption(idx, opt, e.target.value)}
                                  className="block w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-700 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAIQuestionField(idx, "correctOption", opt)}
                                  className={`px-3 py-2 text-[10px] font-black rounded-lg shrink-0 cursor-pointer ${
                                    q.correctOption === opt ? "bg-emerald-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                                  }`}
                                >
                                  KUNCI {q.correctOption === opt ? "✓" : ""}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Explanation Area */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1">Pembahasan Logika Soal</label>
                          <textarea
                            rows={3}
                            value={q.explanation || ""}
                            onChange={(e) => handleUpdateAIQuestionField(idx, "explanation", e.target.value)}
                            className="block w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 bg-amber-50/20 italic focus:outline-none"
                            placeholder="Uraian penjelasan kunci jawaban benar (dapat menekan Enter untuk spasi/baris baru)..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DAFTAR PAKET UJIAN NO-YEAR */}
          {activeTab === "packages" && (
            <div className="space-y-8 animate-fade-in">
              {/* Manual package maker card */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-950 font-display">
                    Instansiasi / Daftarkan Paket Ujian Masal Manual
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Daftarkan jenis kurikulum diluar 10 format standard untuk disimulasikan otomatis ke siswa.</p>
                </div>

                <form className="space-y-5 text-slate-700 font-sans" onSubmit={handleCreatePackageSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-550 uppercase mb-1.5">ID Unik Paket</label>
                      <input
                        type="text"
                        placeholder="Contoh: EXM-PRIBADI-1"
                        className="block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 font-mono"
                        value={newPkgId}
                        onChange={(e) => setNewPkgId(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-550 uppercase mb-1.5">Nama Paket Ujian (Tanpa Tahun)</label>
                      <input
                        type="text"
                        placeholder="Contoh: Tryout Khusus Universitas"
                        className="block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800"
                        value={newPkgName}
                        onChange={(e) => setNewPkgName(e.target.value)}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-550 uppercase">Kategori Bidang</label>
                        <button
                          type="button"
                          onClick={() => setIsCustomCategoryActive(!isCustomCategoryActive)}
                          className="text-[10px] text-[#0F4C81] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <i className={`fa-solid ${isCustomCategoryActive ? "fa-list" : "fa-pen-to-square"}`}></i>
                          <span>{isCustomCategoryActive ? "Pilih dari Daftar" : "Isi Kategori Manual..."}</span>
                        </button>
                      </div>

                      {isCustomCategoryActive ? (
                        <input
                          type="text"
                          placeholder="Masukkan nama kategori bidang kustom (contoh: Tes S2, TOEFL, STAN)"
                          className="block w-full rounded-lg border border-[#F58220]/40 p-2.5 text-xs text-slate-800 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] bg-[#F58220]/5"
                          value={customCategoryInput}
                          onChange={(e) => setCustomCategoryInput(e.target.value)}
                        />
                      ) : (
                        <select
                          className="block w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                          value={newPkgCategory}
                          onChange={(e) => setNewPkgCategory(e.target.value)}
                        >
                          {(() => {
                            const defaultCategories = [
                              "UTBK SNBT",
                              "KEDINASAN",
                              "CPNS",
                              "TNI-POLRI",
                              "BUMN",
                              "PPPK",
                              "PSIKOTES",
                              "TKA",
                              "BAHASA INGGRIS",
                              "MATEMATIKA",
                              "TEST ASESMEN NASIONAL (AN)",
                              "TEST/UJIAN LAINNYA"
                            ];
                            // Dynamically collect unique categories from existing packages
                            const uniqueCats = Array.from(new Set([
                              ...defaultCategories,
                              ...packages.map(p => p.category.toUpperCase().trim()).filter(Boolean)
                            ]));
                            return uniqueCats.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ));
                          })()}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Interactive Sub-exam Sektor & target Count selector */}
                  <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      <i className="fa-solid fa-gears text-[#0F4C81]"></i> Konfigurasi Sub-Ujian (Sektor & Jumlah Soal Target)
                    </label>
                    
                    {/* Quick Add popular sectors list */}
                    <div className="space-y-2">
                      <span className="text-[10.5px] text-slate-450 font-extrabold block uppercase tracking-wide">Pilihan Sektor Populer:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Penalaran Umum", "Penalaran Kuantitatif", "Pemahaman Bacaan & Menulis",
                          "Pengetahuan & Pemahaman Umum", "Literasi Bahasa Indonesia", "Literasi Bahasa Inggris",
                          "Tes Inteligensia Umum (TIU)", "Tes Wawasan Kebangsaan (TWK)", "Tes Karakteristik Pribadi (TKP)"
                        ].map((popularName) => {
                          const isAlreadyAdded = newPkgSubExams.some(se => se.name === popularName);
                          return (
                            <button
                              key={popularName}
                              type="button"
                              onClick={() => {
                                if (isAlreadyAdded) {
                                  setNewPkgSubExams(newPkgSubExams.filter(se => se.name !== popularName));
                                } else {
                                  setNewPkgSubExams([...newPkgSubExams, { name: popularName, targetCount: 15 }]);
                                }
                              }}
                              className={`text-[10px] font-black px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                                isAlreadyAdded 
                                  ? "bg-orange-500 text-white shadow" 
                                  : "bg-white text-slate-650 hover:bg-slate-100 border border-slate-200"
                              }`}
                            >
                              {popularName} {isAlreadyAdded ? "✓" : "+"}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active sub-exams configuration builder table */}
                    <div className="space-y-2.5">
                      <span className="text-[10.5px] text-slate-450 font-extrabold block uppercase tracking-wide">Konfigurasi Target Soal:</span>
                      {newPkgSubExams.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">Belum ada sub-ujian aktif yang dipilih. Silakan pilih salah satu sektor di atas atau ketik manual di bawah.</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {newPkgSubExams.map((se, sIdx) => (
                            <div key={sIdx} className="flex flex-col xl:flex-row xl:items-center justify-between bg-white p-3 rounded-lg border border-slate-200 text-xs gap-3">
                              <span className="font-extrabold text-slate-800 truncate mr-2">{se.name}</span>
                              <div className="flex flex-wrap items-center gap-3 shrink-0 ml-auto xl:ml-0">
                                {/* Question count buttons */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-450 font-extrabold block text-slate-500">Jumlah Soal:</span>
                                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden shrink-0 bg-slate-50">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...newPkgSubExams];
                                        updated[sIdx].targetCount = Math.max(1, se.targetCount - 5);
                                        setNewPkgSubExams(updated);
                                      }}
                                      className="px-2 py-1 hover:bg-slate-200 text-slate-650 font-black text-[10px] transition-colors cursor-pointer"
                                      title="Kurangi 5 soal"
                                    >
                                      -5
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...newPkgSubExams];
                                        updated[sIdx].targetCount = Math.max(1, se.targetCount - 1);
                                        setNewPkgSubExams(updated);
                                      }}
                                      className="px-2.5 py-1 hover:bg-slate-200 text-slate-650 font-bold text-[10px] transition-colors cursor-pointer border-l border-slate-200"
                                      title="Kurangi 1 soal"
                                    >
                                      -
                                    </button>
                                    <span className="px-3 py-1 text-[#0F4C81] font-black bg-white text-center min-w-[32px] font-mono text-[11px] border-l border-r border-slate-200">
                                      {se.targetCount}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...newPkgSubExams];
                                        updated[sIdx].targetCount += 1;
                                        setNewPkgSubExams(updated);
                                      }}
                                      className="px-2.5 py-1 hover:bg-slate-200 text-slate-650 font-bold text-[10px] transition-colors cursor-pointer"
                                      title="Tambah 1 soal"
                                    >
                                      +
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...newPkgSubExams];
                                        updated[sIdx].targetCount += 5;
                                        setNewPkgSubExams(updated);
                                      }}
                                      className="px-2 py-1 hover:bg-slate-200 text-slate-650 font-black text-[10px] transition-colors cursor-pointer border-l border-slate-200"
                                      title="Tambah 5 soal"
                                    >
                                      +5
                                    </button>
                                  </div>
                                </div>

                                {/* Duration minutes buttons */}
                                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                                  <span className="text-[10px] text-slate-450 font-extrabold block text-slate-500">Waktu (Menit):</span>
                                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden shrink-0 bg-slate-50">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...newPkgSubExams];
                                        updated[sIdx].durationMinutes = Math.max(1, (se.durationMinutes || 15) - 5);
                                        setNewPkgSubExams(updated);
                                      }}
                                      className="px-1.5 py-1 hover:bg-slate-200 text-slate-650 font-black text-[10px] transition-colors cursor-pointer"
                                      title="Kurangi 5 menit"
                                    >
                                      -5
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...newPkgSubExams];
                                        updated[sIdx].durationMinutes = Math.max(1, (se.durationMinutes || 15) - 1);
                                        setNewPkgSubExams(updated);
                                      }}
                                      className="px-2 py-1 hover:bg-slate-200 text-slate-650 font-bold text-[10px] transition-colors cursor-pointer border-l border-slate-200"
                                      title="Kurangi 1 menit"
                                    >
                                      -
                                    </button>
                                    <span className="px-2.5 py-1 text-orange-500 font-black bg-white text-center min-w-[32px] font-mono text-[11px] border-l border-r border-slate-200">
                                      {se.durationMinutes || 20}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...newPkgSubExams];
                                        updated[sIdx].durationMinutes = (se.durationMinutes || 15) + 1;
                                        setNewPkgSubExams(updated);
                                      }}
                                      className="px-2 py-1 hover:bg-slate-200 text-slate-650 font-bold text-[10px] transition-colors cursor-pointer"
                                      title="Tambah 1 menit"
                                    >
                                      +
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...newPkgSubExams];
                                        updated[sIdx].durationMinutes = (se.durationMinutes || 15) + 5;
                                        setNewPkgSubExams(updated);
                                      }}
                                      className="px-1.5 py-1 hover:bg-slate-200 text-slate-650 font-black text-[10px] transition-colors cursor-pointer border-l border-slate-200"
                                      title="Tambah 5 menit"
                                    >
                                      +5
                                    </button>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewPkgSubExams(newPkgSubExams.filter((_, idx) => idx !== sIdx));
                                  }}
                                  className="p-1 px-[10px] text-rose-500 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-all cursor-pointer font-bold shrink-0 ml-auto xl:ml-0"
                                  title="Buang sektor ini"
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Manual Custom Sector Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ketik Sektor Ujian Lainnya... (misal: Tes Logika Spasial)"
                        value={customSubExamInput}
                        onChange={(e) => setCustomSubExamInput(e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 flex-1 focus:outline-none focus:border-[#0F4C81]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = customSubExamInput.trim();
                            if (val) {
                              if (newPkgSubExams.some(se => se.name.toLowerCase() === val.toLowerCase())) {
                                setCustomSubExamInput("");
                                return;
                              }
                              setNewPkgSubExams([...newPkgSubExams, { name: val, targetCount: 15 }]);
                              setCustomSubExamInput("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = customSubExamInput.trim();
                          if (val) {
                            if (newPkgSubExams.some(se => se.name.toLowerCase() === val.toLowerCase())) {
                              setCustomSubExamInput("");
                              return;
                            }
                            setNewPkgSubExams([...newPkgSubExams, { name: val, targetCount: 15 }]);
                            setCustomSubExamInput("");
                          }
                        }}
                        className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white font-extrabold text-[11px] py-2 px-4 rounded-lg cursor-pointer shrink-0 transition-opacity"
                      >
                        Tambah Sektor
                      </button>
                    </div>

                    {/* Backing Text Sync State (kept only for validation feedback and backwards-compatibility) */}
                    <div className="pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Representasi data sinkronisasi:</span>
                      <span className="font-bold text-[#0F4C81] max-w-xs truncate">{newPkgSubExamsText || "-"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase mb-1.5">Narasi Deskripsi Ringkas</label>
                    <textarea
                      rows={2.5}
                      className="block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:outline-none"
                      placeholder="Uraian penjelasan tryout..."
                      value={newPkgDesc}
                      onChange={(e) => setNewPkgDesc(e.target.value)}
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white font-extrabold text-xs py-3 px-8 rounded-lg border-b-2 border-b-black transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-folder-plus text-xs"></i>
                      <span>Daftarkan Paket Khusus</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Display existing 11 packages */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Database Kurikulum Paket Nasional Terdaftar ({packages.length})</h3>

                {/* Elegant Interactive Navigation Anchor Jump Panel */}
                <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border-t-4 border-t-[#F58220] shadow-md space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#F58220] rounded-full animate-ping"></span>
                    <div className="flex items-center gap-1.5 font-display text-xs font-black uppercase text-amber-400 tracking-wide">
                      <i className="fa-solid fa-compass text-sm"></i>
                      <span>PANEL KOMPAS INTERAKTIF &mdash; NAVIGASI ANCHOR BANK SOAL</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Klik tombol paket di bawah ini untuk <strong className="text-amber-300">melompat (smooth scroll)</strong>, membuka <strong className="text-[#38BDF8]">Bank Soal</strong> paket ybs secara otomatis. Anda juga dapat langsung menyaring ke sektor sub-ujian tertentu agar tidak lelah melakukan scroll visual yang terlalu panjang.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {packages.map((pkg, idx) => {
                      const theme = getPackageColorStyles(idx);
                      const numQ = questions.filter(q => q.examId === pkg.id).length;
                      return (
                        <div 
                          key={`nav-${pkg.id}`} 
                          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/85 p-3 rounded-xl transition-all shadow-sm flex flex-col justify-between gap-2.5"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full text-slate-200 bg-slate-700`}>
                              {pkg.category}
                            </span>
                            <span className="text-[9.5px] font-mono font-bold text-[#F58220] px-1.5 py-0.5 rounded bg-amber-500/10">
                              {numQ} Soal DB
                            </span>
                          </div>
                          
                          <h4 className="text-[11px] font-extrabold text-slate-150 line-clamp-2 leading-snug">{pkg.name}</h4>
                          
                          {/* Anchor action buttons */}
                          <div className="space-y-1.5 border-t border-slate-700/60 pt-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedPkgId(pkg.id);
                                setPkgSubExamFilters(prev => ({
                                  ...prev,
                                  [pkg.id]: "Semua"
                                }));
                                setTimeout(() => {
                                  const el = document.getElementById(`pkg-card-${pkg.id}`);
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 150);
                              }}
                              className="w-full bg-slate-750 hover:bg-[#0F4C81] text-xs py-1.5 px-3 rounded-lg text-slate-100 font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:shadow-xs border border-transparent hover:border-blue-400/35"
                            >
                              <i className="fa-solid fa-compass text-[10px]"></i>
                              <span>Lompat ke Paket {idx + 1}</span>
                            </button>
                            
                            {/* Nest sector anchors if present */}
                            {pkg.subExams && pkg.subExams.length > 0 && (
                              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                                {pkg.subExams.map((sub, sIdx) => (
                                  <button
                                    key={`sub-nav-${pkg.id}-${sIdx}`}
                                    type="button"
                                    onClick={() => {
                                      setExpandedPkgId(pkg.id);
                                      setPkgSubExamFilters(prev => ({
                                        ...prev,
                                        [pkg.id]: sub.name
                                      }));
                                      setTimeout(() => {
                                        const el = document.getElementById(`pkg-card-${pkg.id}`);
                                        if (el) {
                                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                      }, 150);
                                    }}
                                    className="text-[8px] font-black hover:text-[#F58220] transition-colors bg-[#0a1120] px-1.5 py-0.5 rounded border border-slate-750 text-slate-400 shrink-0 capitalize truncate max-w-full"
                                    title={`Buka sub-ujian ${sub.name}`}
                                  >
                                    {sub.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  {packages.map((pkg, idx) => {
                    const numQ = questions.filter(q => q.examId === pkg.id).length;
                    const isEditingPkg = editingPackageId === pkg.id;
                    const theme = getPackageColorStyles(idx);
                    return (
                      <div 
                        key={pkg.id} 
                        id={`pkg-card-${pkg.id}`} 
                        className={`p-5 bg-white border-2 ${theme.border} ${theme.bg} rounded-xl hover:shadow-md transition-all ${theme.leftBorder} scroll-mt-20`}
                      >
                        {isEditingPkg ? (
                          /* EDIT MODE FOR EXAM PACKAGE AND ITS SECTORS/SUB-TITLES */
                          <div className="space-y-4 text-xs">
                            <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                              <span className="font-extrabold text-[#0F4C81] tracking-wider uppercase text-[10px]">
                                <i className="fa-solid fa-pen-to-square"></i> Mengubah Paket ID: {pkg.id}
                              </span>
                              <span className="text-xs font-mono font-bold text-[#F58220] bg-orange-50 px-2.5 py-1 rounded shrink-0">{numQ} Soal DB</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Paket Ujian</label>
                                <input 
                                  type="text"
                                  value={editPkgName}
                                  onChange={(e) => setEditPkgName(e.target.value)}
                                  className="w-full bg-white p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0F4C81]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kategori Bidang</label>
                                <input 
                                  type="text"
                                  value={editPkgCategory}
                                  onChange={(e) => setEditPkgCategory(e.target.value)}
                                  className="w-full bg-white p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0F4C81]"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deskripsi Paket</label>
                              <textarea 
                                rows={2}
                                value={editPkgDesc}
                                onChange={(e) => setEditPkgDesc(e.target.value)}
                                className="w-full bg-white p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0F4C81]"
                              />
                            </div>

                            {/* Edit subExams configured inside this edited package */}
                            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Daftar Sub-Ujian (Sektor / Sub-Judul):</span>
                                <button
                                  type="button"
                                  onClick={() => setEditPkgSubExams([...editPkgSubExams, { name: "Sektor Sub-Ujian Baru", questionCount: 15, durationMinutes: 20 }])}
                                  className="text-[10px] bg-[#0F4C81]/10 hover:bg-[#0F4C81]/20 text-[#0F4C81] font-extrabold px-2.5 py-1 rounded border border-[#0F4C81]/25 transition-all cursor-pointer hidden sm:inline-block"
                                >
                                  + Tambah Cepat
                                </button>
                              </div>

                              {/* Manual Custom Sector Input in Edit Mode */}
                              <div className="flex gap-2 mb-2 p-2 bg-white rounded-lg border border-slate-200">
                                <input
                                  type="text"
                                  placeholder="Ketik nama sub-ujian / sektor baru... (contoh: Tes Penalaran Figural)"
                                  value={editPkgSubExamInput}
                                  onChange={(e) => setEditPkgSubExamInput(e.target.value)}
                                  className="bg-slate-50 border border-slate-250 rounded-md px-2.5 py-1.5 text-xs text-slate-800 flex-1 focus:outline-none focus:border-[#0F4C81]"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const val = editPkgSubExamInput.trim();
                                      if (val) {
                                        if (editPkgSubExams.some(se => se.name.toLowerCase() === val.toLowerCase())) {
                                          setEditPkgSubExamInput("");
                                          return;
                                        }
                                        setEditPkgSubExams([...editPkgSubExams, { name: val, questionCount: 15, durationMinutes: 20 }]);
                                        setEditPkgSubExamInput("");
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = editPkgSubExamInput.trim();
                                    if (val) {
                                      if (editPkgSubExams.some(se => se.name.toLowerCase() === val.toLowerCase())) {
                                        setEditPkgSubExamInput("");
                                        return;
                                      }
                                      setEditPkgSubExams([...editPkgSubExams, { name: val, questionCount: 15, durationMinutes: 20 }]);
                                      setEditPkgSubExamInput("");
                                    }
                                  }}
                                  className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white font-extrabold text-[10.5px] px-3.5 py-1.5 rounded-md cursor-pointer transition-opacity shrink-0"
                                >
                                  + Tambah Sektor
                                </button>
                              </div>
                              
                              {editPkgSubExams.length === 0 ? (
                                <p className="text-[10px] text-slate-400 italic font-mono">Belum ada sub-ujian. Pastikan minimal ada 1 sub-ujian.</p>
                              ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                  {editPkgSubExams.map((sub, sIdx) => (
                                    <div key={sIdx} className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-3xs">
                                      <input 
                                        type="text"
                                        placeholder="Nama Sektor Sub-Ujian"
                                        value={sub.name}
                                        onChange={(e) => {
                                          const updated = [...editPkgSubExams];
                                          updated[sIdx].name = e.target.value;
                                          setEditPkgSubExams(updated);
                                        }}
                                        className="font-bold text-slate-805 bg-slate-50/50 hover:bg-white px-2 py-1.5 rounded border border-slate-250 flex-1 focus:outline-none focus:border-[#0F4C81]"
                                      />
                                      
                                      <div className="flex items-center gap-2.5 shrink-0 ml-auto sm:ml-0">
                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] text-slate-400 font-bold">Soal:</span>
                                          <input 
                                            type="number"
                                            min={1}
                                            value={sub.questionCount}
                                            onChange={(e) => {
                                              const updated = [...editPkgSubExams];
                                              updated[sIdx].questionCount = Math.max(1, parseInt(e.target.value) || 1);
                                              setEditPkgSubExams(updated);
                                            }}
                                            className="w-14 text-center text-xs p-1 rounded border border-slate-250 font-mono focus:border-[#0F4C81]"
                                          />
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] text-slate-400 font-bold">Durasi (Menit):</span>
                                          <input 
                                            type="number"
                                            min={1}
                                            value={sub.durationMinutes}
                                            onChange={(e) => {
                                              const updated = [...editPkgSubExams];
                                              updated[sIdx].durationMinutes = Math.max(1, parseInt(e.target.value) || 1);
                                              setEditPkgSubExams(updated);
                                            }}
                                            className="w-14 text-center text-xs p-1 rounded border border-slate-250 font-mono focus:border-[#0F4C81]"
                                          />
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => setEditPkgSubExams(editPkgSubExams.filter((_, idx) => idx !== sIdx))}
                                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-all font-bold"
                                          title="Hapus sub-judul ini"
                                        >
                                          <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Actions saving package */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => handleSavePackage(pkg.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] py-2 px-4 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                              >
                                <i className="fa-solid fa-cloud-arrow-up text-xs"></i>
                                <span>Simpan Perubahan</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPackageId(null);
                                }}
                                className="bg-slate-400 hover:bg-slate-500 text-white font-bold text-[11px] py-2 px-4 rounded-lg transition-all cursor-pointer"
                              >
                                <span>Batal</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* NORMAL VIEW MODE */
                          <>
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="text-[9px] font-bold bg-[#0F4C81]/10 text-[#0F4C81] px-2 py-0.5 rounded">
                                  {pkg.category}
                                </span>
                                <h4 className="text-xs font-extrabold text-slate-800 font-display mt-2">{pkg.name}</h4>
                                <p className="text-[11px] text-slate-550 mt-1">{pkg.description}</p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="text-xs font-mono font-bold text-[#F58220] bg-orange-50 px-2.5 py-1 rounded inline-block">{numQ} Soal DB</span>
                                
                                {/* Edit & Delete Action Buttons */}
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditPackage(pkg)}
                                    className="bg-sky-50 hover:bg-sky-100 text-[#0F4C81] font-bold rounded-lg px-2.5 py-1.5 text-[10.5px] cursor-pointer flex items-center gap-1 border border-sky-150 transition-all shadow-3xs"
                                    title="Edit rincian paket, kategori bidang, dan sub-ujian"
                                  >
                                    <i className="fa-solid fa-pencil text-[9px] text-[#0F4C81]"></i>
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg px-2.5 py-1.5 text-[10.5px] cursor-pointer flex items-center gap-1 border border-rose-150 transition-all shadow-3xs"
                                    title="Hapus paket ini beserta semua sub-ujian"
                                  >
                                    <i className="fa-solid fa-trash-can text-[9px] text-rose-600"></i>
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* List nested sub-exams */}
                            <div className="mt-3 bg-slate-50 p-3 rounded border border-slate-100 flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono">
                              <strong className="text-[9px] text-slate-400 uppercase mr-1 pt-0.5">Sub-Tests:</strong>
                              {pkg.subExams.map((sub, sIdx) => (
                                <span key={sIdx} className="bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {sub.name} ({sub.questionCount} Soal &mdash; {sub.durationMinutes} Menit)
                                </span>
                              ))}
                            </div>
                          </>
                        )}

                        {/* ACCORDION MENU LIST QUESTIONS IN BANK SOAL */}
                        <div className="mt-4 pt-3 border-t border-slate-150">
                          <button
                            type="button"
                            onClick={() => setExpandedPkgId(expandedPkgId === pkg.id ? null : pkg.id)}
                            className="bg-slate-100/50 hover:bg-slate-100 border border-slate-200 text-[#0F4C81] hover:text-[#0b3b64] font-bold text-xs py-2 px-4 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <i className={`fa-solid ${expandedPkgId === pkg.id ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                            <span>{expandedPkgId === pkg.id ? "Tutup Daftar Soal" : "Kelola Daftar Soal dalam DB"}</span> ({numQ} Butir)
                          </button>

                          {expandedPkgId === pkg.id && (
                            <div className="mt-4 space-y-4 animate-fade-in pl-1">
                              {/* Live Sub-Ujian Quota Status Tracker */}
                              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 font-sans text-xs text-left text-slate-700 space-y-3 shadow-xs">
                                <h4 className="font-extrabold text-[#0F4C81] flex items-center gap-2 text-sm">
                                  <i className="fa-solid fa-chart-column text-[#0F4C81]"></i>
                                  <span>Pemantau Kuota & Status Penerbitan CBT</span>
                                </h4>
                                <p className="text-[11px] text-slate-400">
                                  Hanya soal dengan status <strong className="text-emerald-600">Diterbitkan</strong> yang akan diujikan ke siswa. Jumlah kuota per sub-ujian diatur secara fleksibel oleh Admin.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                                  {pkg.subExams && pkg.subExams.length > 0 ? (
                                    pkg.subExams.map((sub, sIdx) => {
                                      const publishedCount = questions.filter(
                                        item => item.examId === pkg.id && item.subExamName === sub.name && item.isPublished !== false
                                      ).length;
                                      const totalCount = questions.filter(
                                        item => item.examId === pkg.id && item.subExamName === sub.name
                                      ).length;
                                      const quota = sub.questionCount;
                                      const percentage = Math.min(100, (publishedCount / quota) * 100);

                                      return (
                                        <div key={sIdx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
                                          <div className="flex justify-between items-center font-bold text-[11px] text-slate-750">
                                            <span className="truncate max-w-[140px] font-display" title={sub.name}>{sub.name}</span>
                                            <span className="font-mono text-xs text-[#0F4C81]">{publishedCount} / {quota}</span>
                                          </div>
                                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-100">
                                            <div 
                                              className={`h-full rounded-full transition-all duration-300 ${percentage >= 100 ? 'bg-[#F58220]' : 'bg-[#0F4C81]'}`}
                                              style={{ width: `${percentage}%` }}
                                            />
                                          </div>
                                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                            <span>Bank: {totalCount} draf</span>
                                            <span className="font-extrabold text-[#F58220]">{percentage.toFixed(0)}% terisi</span>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="col-span-full py-2 text-center text-slate-450 italic text-[11px]">Tidak ada sub-ujian yang didefinisikan untuk paket ini.</div>
                                  )}
                                </div>
                              </div>

                              {/* Inner filtering bar & question list mapper based on selected filter */}
                              {(() => {
                                const pkgQuestions = questions.filter(q => q.examId === pkg.id);
                                if (pkgQuestions.length === 0) {
                                  return (
                                    <p className="text-xs text-slate-450 font-sans italic py-4 pl-2 text-left bg-slate-50 border border-slate-200 rounded-xl">
                                      Tidak ada soal terkait paket ini dalam database. Silakan impor atau ketik manual.
                                    </p>
                                  );
                                }

                                const activeFilter = pkgSubExamFilters[pkg.id] || "Semua";
                                const filteredQuestions = pkgQuestions.filter(
                                  q => activeFilter === "Semua" || q.subExamName === activeFilter
                                );

                                return (
                                  <div className="space-y-4">
                                    {/* Selector Filtering Bar inside Expanded database view */}
                                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
                                      <div className="flex items-center gap-2">
                                        <i className="fa-solid fa-filter text-[#0F4C81] text-xs"></i>
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Saring Tampilan Sektor:</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => setPkgSubExamFilters(prev => ({ ...prev, [pkg.id]: "Semua" }))}
                                          className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                                            activeFilter === "Semua"
                                              ? `${theme.btnBg} shadow-sm font-black`
                                              : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-650"
                                          }`}
                                        >
                                          Semua Sektor ({pkgQuestions.length})
                                        </button>
                                        {pkg.subExams && pkg.subExams.map((sub, sIdx) => {
                                          const count = pkgQuestions.filter(item => item.subExamName === sub.name).length;
                                          const isActive = activeFilter === sub.name;
                                          return (
                                            <button
                                              key={`inner-se-filter-${pkg.id}-${sIdx}`}
                                              type="button"
                                              onClick={() => setPkgSubExamFilters(prev => ({ ...prev, [pkg.id]: sub.name }))}
                                              className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                                                isActive
                                                  ? `${theme.btnBg} shadow-sm font-black`
                                                  : "bg-white hover:bg-emerald-50 border border-slate-200 text-slate-650"
                                              }`}
                                            >
                                              {sub.name} ({count})
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {filteredQuestions.length === 0 ? (
                                      <p className="text-xs text-slate-450 font-sans italic py-4 pl-4 text-left border rounded-xl bg-orange-50/50 border-orange-200">
                                        Tidak ada soal untuk sektor <strong className="text-orange-600">"{activeFilter}"</strong> dalam database. Silakan ganti filter di atas atau tambahkan draf dprd.
                                      </p>
                                    ) : (
                                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                                        {filteredQuestions.map((q) => {
                                          const originalQIdx = pkgQuestions.findIndex(item => item.id === q.id);
                                          const isQEditing = editingQuestionId === q.id;
                                          return (
                                            <div key={q.id} className={`p-4 bg-white rounded-2xl border-2 ${theme.border} ${theme.bg} space-y-4 text-xs text-slate-705 shadow-xs text-left transition-all hover:bg-white`}>
                                              <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center ${theme.accent} p-3 rounded-xl gap-2 border`}>
                                                <div className="flex flex-wrap items-center gap-2">
                                                  <span className="font-black text-slate-900 font-mono uppercase text-left break-all">
                                                    SOAL #{originalQIdx + 1} ({q.subExamName || "Sektor Umum"})
                                                  </span>
                                                  {q.isPublished !== false ? (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-sans font-black flex items-center gap-1 uppercase">
                                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                      Aktif CBT (Diterbitkan)
                                                    </span>
                                                  ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-sans font-black flex items-center gap-1 uppercase">
                                                      Draf Bank Soal (Tertahan)
                                                    </span>
                                                  )}
                                                </div>
                                          
                                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                                            {isQEditing ? (
                                              <>
                                                <button
                                                  type="button"
                                                  onClick={() => handleSaveEditedQuestion(q.id)}
                                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1 bg-[#2ECC71] rounded text-[10px] cursor-pointer flex items-center gap-1 shadow-xs"
                                                >
                                                  <i className="fa-solid fa-floppy-disk text-[9px] text-white"></i>
                                                  <span>Save</span>
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setEditingQuestionId(null)}
                                                  className="bg-slate-500 hover:bg-slate-650 text-white font-extrabold px-3 py-1 rounded text-[10px] cursor-pointer flex items-center gap-1 shadow-xs"
                                                >
                                                  <i className="fa-solid fa-xmark text-[9px] text-white"></i>
                                                  <span>Batal</span>
                                                </button>
                                              </>
                                            ) : (
                                              <>
                                                {/* PUBLISH TOGGLE BUTTON */}
                                                <button
                                                  type="button"
                                                  onClick={() => handlePublishToggle(q.id)}
                                                  className={`font-extrabold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer flex items-center gap-1.5 border transition-all duration-150 font-sans ${
                                                    q.isPublished !== false
                                                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                                      : "bg-slate-100 text-slate-700 border-slate-350 hover:bg-slate-200"
                                                  }`}
                                                >
                                                  <i className={`fa-solid ${q.isPublished !== false ? "fa-circle-check text-emerald-600" : "fa-regular fa-circle text-slate-400"} text-[10px]`}></i>
                                                  <span>{q.isPublished !== false ? "Tarik / Batalkan" : "Terbitkan ke Siswa"}</span>
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() => handleEditQuestionClick(q)}
                                                  className="bg-sky-50 hover:bg-sky-200 active:bg-sky-300 text-[#0F4C81] font-extrabold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer flex items-center gap-1 border border-sky-300 transition-all hover:shadow-[0_0_12px_rgba(15,76,129,0.25)] duration-150 font-sans"
                                                >
                                                  <i className="fa-solid fa-pencil text-[9px] text-[#0F4C81]"></i>
                                                  <span>Edit</span>
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteQuestionClick(q.id)}
                                                  className="bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 font-extrabold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer flex items-center gap-1 border border-rose-350 transition-all hover:shadow-[0_0_12px_rgba(244,63,94,0.3)] duration-150 font-sans"
                                                >
                                                  <i className="fa-solid fa-trash-can text-[9px] text-rose-600"></i>
                                                  <span>Hapus</span>
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>

                                        {isQEditing ? (
                                          <div className="space-y-4 font-sans text-left bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                                            {/* Edit Question Text & Image */}
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                              <div className="lg:col-span-8">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pertanyaan Soal</label>
                                                <textarea
                                                  rows={3}
                                                  value={editQText}
                                                  onChange={(e) => setEditQText(e.target.value)}
                                                  className="w-full bg-white p-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                                                />
                                              </div>
                                              <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                                                <div>
                                                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Gambar Soal (Posisi Bebas)</label>
                                                  <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => handleImageFileChange(e, setEditQQuestionImg)}
                                                    className="text-[9px] text-slate-500 cursor-pointer w-full"
                                                  />
                                                </div>
                                                {editQQuestionImg && (
                                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                      <img src={editQQuestionImg} alt="Preview" className="h-8 w-auto rounded border" />
                                                      <button 
                                                        type="button" 
                                                        onClick={() => setEditQQuestionImg("")}
                                                        className="text-[8px] text-rose-600 font-extrabold uppercase hover:underline"
                                                      >
                                                        Hapus
                                                      </button>
                                                    </div>
                                                    <select
                                                      value={editQQuestionImgPos}
                                                      onChange={(e) => setEditQQuestionImgPos(e.target.value as "above" | "below" | "middle")}
                                                      className="text-[9.5px] bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-slate-700 font-bold focus:outline-none"
                                                    >
                                                      <option value="above">Di Atas Soal</option>
                                                      <option value="middle">Di Tengah Soal</option>
                                                      <option value="below">Di Bawah Soal</option>
                                                    </select>
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            {/* Edit Choice Options A-E */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                              {["A", "B", "C", "D", "E"].map((opt) => {
                                                const val = opt === "A" ? editQOptionA : opt === "B" ? editQOptionB : opt === "C" ? editQOptionC : opt === "D" ? editQOptionD : editQOptionE;
                                                const setter = opt === "A" ? setEditQOptionA : opt === "B" ? setEditQOptionB : opt === "C" ? setEditQOptionC : opt === "D" ? setEditQOptionD : setEditQOptionE;
                                                
                                                const imgVal = opt === "A" ? editQImgA : opt === "B" ? editQImgB : opt === "C" ? editQImgC : opt === "D" ? editQImgD : editQImgE;
                                                const imgSetter = opt === "A" ? setEditQImgA : opt === "B" ? setEditQImgB : opt === "C" ? setEditQImgC : opt === "D" ? setEditQImgD : setEditQImgE;
                                                const imgPosVal = opt === "A" ? editQImgPosA : opt === "B" ? editQImgPosB : opt === "C" ? editQImgPosC : opt === "D" ? editQImgPosD : editQImgPosE;
                                                const imgPosSetter = opt === "A" ? setEditQImgPosA : opt === "B" ? setEditQImgPosB : opt === "C" ? setEditQImgPosC : opt === "D" ? setEditQImgPosD : setEditQImgPosE;

                                                return (
                                                  <div key={opt} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                                                    <div>
                                                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Pilihan {opt}</label>
                                                      <input
                                                        type="text"
                                                        value={val}
                                                        onChange={(e) => setter(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                      />
                                                    </div>

                                                    <div className="space-y-1 pt-1.5 border-t border-slate-100">
                                                      <div className="flex items-center justify-between gap-1">
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Gambar {opt}:</span>
                                                        {imgVal && (
                                                          <button 
                                                            type="button" 
                                                            onClick={() => imgSetter("")}
                                                            className="text-[8px] text-rose-500 font-extrabold uppercase hover:underline"
                                                          >
                                                            Hapus
                                                          </button>
                                                        )}
                                                      </div>
                                                      <div className="flex items-center gap-1 flex-wrap">
                                                        <input 
                                                          type="file" 
                                                          accept="image/*"
                                                          onChange={(e) => handleImageFileChange(e, imgSetter)}
                                                          id={`edit-list-choice-img-${opt}-${q.id}`}
                                                          className="hidden"
                                                        />
                                                        <label 
                                                          htmlFor={`edit-list-choice-img-${opt}-${q.id}`}
                                                          className="flex-1 text-center bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 py-1 text-[8px] font-extrabold cursor-pointer text-slate-655 uppercase"
                                                        >
                                                          {imgVal ? "Ubah" : "+ Gbr"}
                                                        </label>
                                                        {imgVal && (
                                                          <img src={imgVal} alt="img preview" className="h-5 w-auto rounded border" />
                                                        )}
                                                      </div>
                                                      {imgVal && (
                                                        <div className="pt-1">
                                                          <select
                                                            value={imgPosVal}
                                                            onChange={(e) => imgPosSetter(e.target.value as "above" | "below" | "middle")}
                                                            className="w-full text-[8.5px] bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-slate-700 font-extrabold focus:outline-none"
                                                          >
                                                            <option value="above">Di Atas Teks</option>
                                                            <option value="middle">Di Tengah Teks</option>
                                                            <option value="below">Di Bawah Teks</option>
                                                          </select>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>

                                            {/* Key and Discussion row */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                              <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Kunci Jawaban</label>
                                                <select
                                                  value={editQCorrectOption}
                                                  onChange={(e) => setEditQCorrectOption(e.target.value as any)}
                                                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none"
                                                >
                                                  <option value="A">Pilihan A</option>
                                                  <option value="B">Pilihan B</option>
                                                  <option value="C">Pilihan C</option>
                                                  <option value="D">Pilihan D</option>
                                                  <option value="E">Pilihan E</option>
                                                </select>
                                              </div>
                                              <div className="md:col-span-2">
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Pembahasan (Argumentasi Jawaban)</label>
                                                <textarea
                                                  rows={2}
                                                  value={editQExplanation}
                                                  onChange={(e) => setEditQExplanation(e.target.value)}
                                                  className="w-full bg-white p-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none"
                                                  placeholder="Analisis penyelesaian soal (dapat menggunakan Enter)..."
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="space-y-3.5 text-slate-755 font-sans text-left bg-slate-50/30 p-3 rounded-2xl border border-dashed border-slate-250">
                                            {/* Question Text and relative image position */}
                                            <div className="flex flex-col gap-3">
                                              {q.questionImage && q.questionImagePosition === "above" && (
                                                <div className="bg-white border border-slate-200 p-2.5 rounded-xl max-w-sm">
                                                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Gambar Lampiran (Atas):</span>
                                                  <img src={q.questionImage} alt="question illustration" className="max-h-32 w-auto object-contain rounded" />
                                                </div>
                                              )}
                                              
                                              {q.questionImage && q.questionImagePosition === "middle" ? (
                                                <div className="space-y-2">
                                                  {(() => {
                                                    const [part1, part2] = splitTextAtMiddle(q.questionText);
                                                    return (
                                                      <>
                                                        <p className="font-extrabold text-slate-900 whitespace-pre-wrap leading-relaxed">{part1}</p>
                                                        <div className="bg-white border border-slate-200 p-2.5 rounded-xl max-w-sm my-1.5">
                                                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Gambar Lampiran (Tengah):</span>
                                                          <img src={q.questionImage} alt="question illustration" className="max-h-32 w-auto object-contain rounded" />
                                                        </div>
                                                        {part2 && <p className="font-extrabold text-slate-900 whitespace-pre-wrap leading-relaxed">{part2}</p>}
                                                      </>
                                                    );
                                                  })()}
                                                </div>
                                              ) : (
                                                <p className="font-extrabold text-slate-900 whitespace-pre-wrap leading-relaxed">{q.questionText}</p>
                                              )}
                                              
                                              {q.questionImage && q.questionImagePosition !== "above" && q.questionImagePosition !== "middle" && (
                                                <div className="bg-white border border-slate-200 p-2.5 rounded-xl max-w-sm">
                                                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Gambar Lampiran (Bawah):</span>
                                                  <img src={q.questionImage} alt="question illustration" className="max-h-32 w-auto object-contain rounded" />
                                                </div>
                                              )}
                                            </div>

                                            {/* Option Choices with relative image positions */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                                              {["A", "B", "C", "D", "E"].map((opt) => {
                                                const isCorrect = q.correctOption === opt;
                                                const optText = q.options[opt as keyof typeof q.options];
                                                const optImg = q.optionImages ? q.optionImages[opt] : undefined;
                                                const optImgPos = q.optionImagePositions ? q.optionImagePositions[opt] : "below";

                                                return (
                                                  <div 
                                                    key={opt} 
                                                    className={`p-3 rounded-xl border text-[11px] flex flex-col gap-2 ${
                                                      isCorrect 
                                                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-xs" 
                                                        : "bg-white border-slate-200 text-slate-650"
                                                    }`}
                                                  >
                                                    <div className="flex items-center gap-1.5 border-b border-dashed border-slate-200 pb-1 w-full text-[10px]">
                                                      <span className={`w-4 h-4 rounded-full font-black flex items-center justify-center text-[9px] ${isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                                                        {opt}
                                                      </span>
                                                      <span className="font-semibold uppercase text-[9px] text-slate-400">PILIHAN {opt}</span>
                                                    </div>

                                                    {/* Option image ABOVE choice text */}
                                                    {optImg && optImgPos === "above" && (
                                                      <div className="bg-slate-50 p-1 rounded border border-slate-200 self-start">
                                                        <img src={optImg} alt={`Lampiran ${opt}`} className="max-h-20 w-auto rounded object-contain" />
                                                      </div>
                                                    )}

                                                    {optImg && optImgPos === "middle" ? (
                                                      <div className="space-y-1 w-full">
                                                        {(() => {
                                                          const [part1, part2] = splitTextAtMiddle(optText || "");
                                                          return (
                                                            <span className="leading-relaxed break-words block">
                                                              {part1 || ""}
                                                              <span className="bg-slate-50 p-1 rounded border border-slate-200 my-1 block self-start max-w-xs">
                                                                <img src={optImg} alt={`Lampiran ${opt}`} className="max-h-20 w-auto rounded object-contain" />
                                                              </span>
                                                              {part2 || ""}
                                                            </span>
                                                          );
                                                        })()}
                                                      </div>
                                                    ) : (
                                                      <span className="leading-relaxed break-words">{optText || <span className="italic text-slate-400">Kosong</span>}</span>
                                                    )}

                                                    {/* Option image BELOW choice text */}
                                                    {optImg && optImgPos !== "above" && optImgPos !== "middle" && (
                                                      <div className="bg-slate-50 p-1 rounded border border-slate-200 self-start">
                                                        <img src={optImg} alt={`Lampiran ${opt}`} className="max-h-20 w-auto rounded object-contain" />
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>

                                            <div className="bg-orange-50/50 border border-orange-200 p-2.5 rounded-xl text-[11px] text-slate-700 space-y-1">
                                              <p className="font-extrabold text-[#F58220] flex items-center gap-1.5 text-left text-[11.5px]">
                                                <i className="fa-solid fa-circle-check text-emerald-600"></i>
                                                <span>Kunci Jawaban Resmi: Pilihan {q.correctOption}</span>
                                              </p>
                                              <p className="border-t border-orange-100 pt-1.5 text-slate-650 text-left whitespace-pre-wrap leading-relaxed">
                                                <strong className="text-slate-800 text-[10.5px] block mb-0.5">Pembahasan & Analisis Soal:</strong>
                                                {q.explanation || "-"}
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NAVIGASI PENGATURAN & KUNCI NASIONAL */}
          {activeTab === "locks" && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-950 font-display">
                  Sumbu Parameter Pengaktifan & Penguncian Paket Ujian
                </h3>
                <p className="text-xs text-slate-400 mt-1">Semua aksi pemblokiran/toggle geser kanan kiri akan berlaku seketika pada portal siswa secara nasional.</p>
              </div>

              {/* Analisa Pembahasan Lock Setting */}
              <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-lg shrink-0">
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Kunci Menu Analisa & Pembahasan Siswa</h4>
                    <p className="text-[10px] text-slate-500 font-sans">Ketika diaktifkan, siswa tidak dapat melihat diagnosis SWOT, saran prediksi, atau pembahasan soal.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className={`text-[10px] font-bold ${locks["ANALISA_PEMBAHASAN"] ? "text-red-650" : "text-emerald-700"}`}>
                    {locks["ANALISA_PEMBAHASAN"] ? "TERKUNCI / SELESAI SAJA" : "SEDANG DIBUKA"}
                  </span>
                  <button
                    onClick={() => handleToggleLock("ANALISA_PEMBAHASAN")}
                    className={`w-12 h-6 rounded-full relative p-1 transition-all duration-300 cursor-pointer ${
                      locks["ANALISA_PEMBAHASAN"] ? "bg-red-500" : "bg-emerald-500"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md ${
                        locks["ANALISA_PEMBAHASAN"] ? "translate-x-0" : "translate-x-6"
                      }`}
                    ></div>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {packages.map((pkg, index) => {
                  const isPkgLocked = locks[pkg.id] === true;
                  return (
                    <div key={pkg.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                      
                      {/* Package parent locking bar */}
                      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#0F4C81] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">{pkg.category}</span>
                            <h4 className="text-xs font-black text-slate-800 leading-none">{pkg.name}</h4>
                          </div>
                        </div>

                        {/* Slide Toggle right/left style */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold ${isPkgLocked ? "text-red-650" : "text-emerald-700"}`}>
                            {isPkgLocked ? "TERKUNCI" : "SEDANG AKTIF"}
                          </span>
                          <button
                            onClick={() => handleToggleLock(pkg.id)}
                            className={`w-12 h-6 rounded-full relative p-1 transition-all duration-300 cursor-pointer ${
                              isPkgLocked ? "bg-red-500" : "bg-emerald-500"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md ${
                                isPkgLocked ? "translate-x-0" : "translate-x-6"
                              }`}
                            ></div>
                          </button>
                        </div>
                      </div>

                      {/* Sub-exam checklists */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block pl-1">Pemblokiran Sub-Ujian Terperinci</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {pkg.subExams.map((sub, sIdx) => {
                            const isSubLocked = locks[sub.name] === true;
                            return (
                              <div key={sIdx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs text-slate-650">
                                <span className={`font-semibold ${isSubLocked ? "text-slate-400 line-through" : "text-slate-700"}`}>
                                  {isSubLocked && <i className="fa-solid fa-lock text-red-500 text-[10px] mr-1"></i>}
                                  {sub.name}
                                </span>

                                <button
                                  onClick={() => handleToggleLock(sub.name)}
                                  className={`w-10 h-5 rounded-full relative p-0.5 transition-all duration-300 cursor-pointer ${
                                    isSubLocked ? "bg-red-400" : "bg-emerald-400"
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow ${
                                      isSubLocked ? "translate-x-0" : "translate-x-5"
                                    }`}
                                  ></div>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* ADMIN ACCOUNT SETTINGS SECTION */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 text-left">
                  <div className="border-b border-slate-200 pb-4">
                    <h4 className="text-sm font-extrabold text-slate-800 font-display flex items-center gap-2">
                      <i className="fa-solid fa-user-gear text-[#0F4C81]"></i>
                      <span>Pengaturan Profil & Kredensial Administrator</span>
                    </h4>
                    <p className="text-[11px] text-slate-550 mt-1">Ubah nama lengkap, password login administrator, dan unggah foto profil kustom Anda di sini.</p>
                  </div>

                  <form onSubmit={handleAdminProfileSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start font-sans">
                    {/* Admin Image Upload Preview column */}
                    <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl text-center space-y-3 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Foto Profil Administrator</span>
                      <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-[#0F4C81] flex items-center justify-center bg-slate-100">
                        {adminProfilePhoto ? (
                          <img 
                            src={adminProfilePhoto} 
                            alt="Admin Profile Preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <i className="fa-solid fa-user-tie text-3xl text-slate-400"></i>
                        )}
                      </div>
                      <div className="w-full">
                        <label className="block bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-[10px] py-1.5 px-3 rounded border border-slate-300 cursor-pointer transition-colors">
                          <i className="fa-solid fa-camera mr-1 text-[9px]"></i> Pilih Foto Baru
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAdminPhotoUpload} 
                            className="hidden" 
                          />
                        </label>
                        <span className="text-[9px] text-slate-400 block mt-1.5">Max 2MB format JPG/PNG/WEBP</span>
                      </div>
                    </div>

                    {/* Admin Profile Form fields column */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase tracking-wide">Nama Lengkap Administrator</label>
                        <input 
                          type="text"
                          required
                          value={adminProfileName}
                          onChange={(e) => setAdminProfileName(e.target.value)}
                          placeholder="Masukkan nama admin lengkap..."
                          className="w-full bg-white px-3.5 py-2.5 text-xs text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0F4C81]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase tracking-wide">Username Administrator</label>
                        <input 
                          type="text"
                          required
                          value={adminProfileUsername}
                          onChange={(e) => setAdminProfileUsername(e.target.value)}
                          placeholder="Masukkan username admin (bawaan: admin)..."
                          className="w-full bg-white px-3.5 py-2.5 text-xs text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0F4C81]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase tracking-wide">Password Baru Administrator</label>
                        <div className="relative">
                          <input 
                            type="password"
                            value={adminProfilePassword}
                            onChange={(e) => setAdminProfilePassword(e.target.value)}
                            placeholder="Ketik password baru untuk mengubahnya (bawaan: adminkatakita)..."
                            className="w-full bg-white px-3.5 py-2.5 text-xs text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0F4C81]"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1 font-sans">Kosongkan jika Anda tidak ingin mengubah password masuk admin.</span>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white font-extrabold text-xs py-2.5 px-6 rounded-lg shadow transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-user-check text-xs"></i>
                          <span>Simpan Profil & Password</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          )}
                    {/* TAB 6: RESULTS TABLE */}
          {activeTab === "results" && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 gap-4">
                <div className="text-left">
                  <h3 className="text-base font-extrabold text-slate-950 font-display">
                    Pusat Data Evaluasi & Registrasi Siswa
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Kelola data rekapitulasi nilai tryout sekaligus kredensial autentikasi seluruh siswa terdaftar.</p>
                </div>
                
                {/* Sub Tab Switcher Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start">
                  <button
                    type="button"
                    onClick={() => setResultsSubTab("attempts")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      resultsSubTab === "attempts" 
                        ? "bg-white text-[#0F4C81] shadow-xs" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <i className="fa-solid fa-graduation-cap mr-1"></i> Log Nilai Sesi Tryout ({attempts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultsSubTab("students")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      resultsSubTab === "students" 
                        ? "bg-white text-[#F58220] shadow-xs" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <i className="fa-solid fa-users mr-1"></i> Registrasi Akun Siswa ({registeredStudents.length})
                  </button>
                </div>
              </div>

              {resultsSubTab === "attempts" ? (() => {
                // Grouping attempts dynamically per student (email) and package (examId)
                const groupedAttemptsMap: {
                  [key: string]: {
                    id: string;
                    email: string;
                    fullname: string;
                    examId: string;
                    startTime: string;
                    tabSwitchViolations: number;
                    subExamAttempts: {
                      [subExamName: string]: {
                        correctCount: number;
                        totalCount: number;
                        finalScore: number;
                        attemptId: string;
                        startTime: string;
                      }
                    };
                    allAttempts: any[];
                  }
                } = {};

                attempts.forEach(att => {
                  const email = (att.email || "").toLowerCase().trim();
                  if (!email) return;
                  const fullname = att.fullname || "Siswa Terdaftar";
                  const examId = att.examId;
                  const subExamName = att.subExamName || "Sektor Umum";

                  const pkg = packages.find(p => p.id === examId);
                  let questionCount = 10;
                  if (pkg) {
                    const sub = pkg.subExams.find(s => s.name === subExamName);
                    if (sub) {
                      questionCount = sub.questionCount;
                    } else {
                      questionCount = pkg.totalQuestions || 10;
                    }
                  }

                  const key = `${email}_${examId}`;
                  if (!groupedAttemptsMap[key]) {
                    groupedAttemptsMap[key] = {
                      id: att.id,
                      email,
                      fullname,
                      examId,
                      startTime: att.startTime || new Date().toISOString(),
                      tabSwitchViolations: att.tabSwitchViolations || 0,
                      subExamAttempts: {},
                      allAttempts: [],
                    };
                  }

                  groupedAttemptsMap[key].allAttempts.push(att);

                  const existingSub = groupedAttemptsMap[key].subExamAttempts[subExamName];
                  if (!existingSub || new Date(att.startTime) > new Date(existingSub.startTime)) {
                    groupedAttemptsMap[key].subExamAttempts[subExamName] = {
                      correctCount: att.correctCount || 0,
                      totalCount: questionCount,
                      finalScore: att.finalScore || 0,
                      attemptId: att.id,
                      startTime: att.startTime || new Date().toISOString()
                    };
                  }

                  if (att.tabSwitchViolations && att.tabSwitchViolations > groupedAttemptsMap[key].tabSwitchViolations) {
                    groupedAttemptsMap[key].tabSwitchViolations = att.tabSwitchViolations;
                  }

                  if (att.startTime && new Date(att.startTime) > new Date(groupedAttemptsMap[key].startTime)) {
                    groupedAttemptsMap[key].startTime = att.startTime;
                  }
                });

                const rawGrouped = Object.values(groupedAttemptsMap);
                const filteredGrouped = rekapFilterPkgId === "ALL" 
                  ? rawGrouped 
                  : rawGrouped.filter(g => g.examId === rekapFilterPkgId);

                const activePkgForColumns = rekapFilterPkgId !== "ALL" 
                  ? packages.find(p => p.id === rekapFilterPkgId)
                  : null;

                return (
                  <div className="space-y-6">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">Sikap Integritas & Nilai Sesi Siswa</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tabel rekapitulasi nilai per sektor dengan visualisasi kolom bergaya Excel dan navigasi geser aktif.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Pilih Paket Ujian</span>
                          <select
                            value={rekapFilterPkgId}
                            onChange={(e) => setRekapFilterPkgId(e.target.value)}
                            className="bg-white px-3 py-1.5 text-xs rounded-xl border border-slate-250 font-extrabold text-slate-800 focus:outline-[#0F4C81] shadow-xs cursor-pointer min-w-[220px]"
                          >
                            <option value="ALL">🌟 Tampilkan Semua Paket (Ringkasan)</option>
                            {packages.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Navigasi Geser Kolom</span>
                          <div className="flex items-center gap-1 bg-white p-0.5 border border-slate-200 rounded-xl">
                            <button
                              type="button"
                              onClick={() => scrollTable("left")}
                              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Geser Kiri (Excel Mode)"
                            >
                              <i className="fa-solid fa-chevron-left text-[9px]"></i>
                              <span>Kiri</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => scrollTable("right")}
                              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Geser Kanan (Excel Mode)"
                            >
                              <span>Kanan</span>
                              <i className="fa-solid fa-chevron-right text-[9px]"></i>
                            </button>
                          </div>
                        </div>

                        {attempts.length > 0 && (
                          <div className="flex flex-col justify-end pt-4">
                            <button
                              onClick={() => setDeleteConfirmType("clear_all_attempts")}
                              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-650 text-rose-600 hover:text-white border border-rose-300 transition-all px-3 py-1.5 rounded-xl text-xs font-black shadow-sm cursor-pointer duration-150"
                              title="Kosongkan Semua Log Sesi"
                            >
                              <i className="fa-solid fa-trash-can text-xs"></i>
                              <span>Kosongkan Rekap</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {filteredGrouped.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-slate-200/60 text-slate-400 text-xs font-sans">
                        <i className="fa-solid fa-list-ol text-3xl text-slate-200 block mb-2"></i>
                        Belum ada siswa yang menyubmit respons atau memulai pengerjaan paket tryout yang dipilih saat ini.
                      </div>
                    ) : (
                      <div 
                        ref={tableContainerRef}
                        className="overflow-x-auto border border-slate-250 rounded-xl bg-white scroll-smooth"
                        style={{ maxWidth: "100%" }}
                      >
                        <table className="min-w-full divide-y divide-slate-250 text-xs text-left text-slate-700">
                          <thead className="bg-[#111827] text-white font-sans">
                            <tr>
                              <th className="px-4 py-3 text-left w-[120px] min-w-[120px]">Sesi / Tanggal</th>
                              <th className="px-4 py-3 text-left w-[200px] min-w-[200px]">Rincian Siswa</th>
                              <th className="px-4 py-3 text-left w-[180px] min-w-[180px]">Paket Tryout</th>
                              
                              {/* Headers of sub-exams if filtered by single Package */}
                              {activePkgForColumns ? (
                                activePkgForColumns.subExams.map((sub, idx) => (
                                  <th key={idx} className="px-4 py-3 text-center bg-indigo-950 text-indigo-100 border-x border-indigo-900 min-w-[150px] w-[150px]">
                                    <span className="block text-[9.5px] font-black uppercase tracking-wider truncate mb-0.5" title={sub.name}>
                                      {getShortSubExamName(sub.name)}
                                    </span>
                                    <span className="text-[8.5px] text-[#F58220] block font-mono">Max {sub.questionCount} Soal</span>
                                  </th>
                                ))
                              ) : (
                                <th className="px-4 py-3 text-left min-w-[280px]">Detail Nilai Sektor Kategori</th>
                              )}

                              <th className="px-4 py-3 text-center bg-slate-800 text-slate-100 border-x border-slate-700 min-w-[130px] w-[130px]">Total Benar Paket</th>
                              <th className="px-4 py-3 text-center min-w-[120px] w-[120px]">Integritas Monitor</th>
                              <th className="px-4 py-3 text-right bg-slate-850 min-w-[110px] w-[110px]">Nilai</th>
                              <th className="px-4 py-3 text-center min-w-[110px] w-[110px]">Kredensial Sesi</th>
                              <th className="px-4 py-3 text-center min-w-[120px] w-[120px]">Aksi</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-150 bg-white font-sans text-left">
                            {filteredGrouped.map((group) => {
                              const pkg = packages.find(p => p.id === group.examId);
                              const isEditing = editingGroupedKey === `${group.email}_${group.examId}`;
                              
                              // Calculate overall correct count & overall total questions for the Package
                              let totalQuestionsForPkg = 0;
                              let totalCorrectForPkg = 0;

                              if (pkg) {
                                totalQuestionsForPkg = pkg.subExams.reduce((sum, se) => sum + se.questionCount, 0);
                                pkg.subExams.forEach(se => {
                                  let finalCorrect = 0;
                                  if (isEditing) {
                                    finalCorrect = editGroupedScores[se.name] !== undefined ? editGroupedScores[se.name] : 0;
                                  } else {
                                    const subRecord = group.subExamAttempts[se.name];
                                    finalCorrect = subRecord ? subRecord.correctCount : 0;
                                  }
                                  totalCorrectForPkg += finalCorrect;
                                });
                              } else {
                                totalQuestionsForPkg = 10;
                                totalCorrectForPkg = group.allAttempts[0]?.correctCount || 0;
                              }

                              const currentViolations = isEditing ? editViolations : (group.tabSwitchViolations || 0);
                              const isBanned = currentViolations >= 3;
                              const currentScore = totalQuestionsForPkg > 0 
                                ? (totalCorrectForPkg / totalQuestionsForPkg) * 100 
                                : 0;

                              return (
                                <tr key={`${group.email}_${group.examId}`} className="hover:bg-slate-50 transition-all">
                                  {/* Sesi / Tanggal */}
                                  <td className="px-4 py-3 font-mono font-bold align-middle">
                                    <span className="text-[10px] text-slate-500 font-bold tracking-wider block bg-slate-100 px-1.5 py-0.5 rounded text-center">
                                      {group.id || "GRP-VAL"}
                                    </span>
                                    <span className="block text-[9px] text-slate-400 font-normal mt-1 text-center">
                                      {group.startTime ? new Date(group.startTime).toLocaleDateString("id-ID") : "-"}
                                    </span>
                                  </td>

                                  {/* Rincian Siswa */}
                                  <td className="px-4 py-3 align-middle text-left">
                                    {isEditing ? (
                                      <div className="space-y-1.5 min-w-[200px] text-left">
                                        <div>
                                          <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nama Lengkap</label>
                                          <input 
                                            type="text"
                                            value={editFullnameValue}
                                            onChange={(e) => setEditFullnameValue(e.target.value)}
                                            className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded font-bold text-slate-800 focus:outline-[#0F4C81]"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Siswa</label>
                                          <input 
                                            type="email"
                                            value={editEmailValue}
                                            onChange={(e) => setEditEmailValue(e.target.value)}
                                            className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded text-slate-650 focus:outline-[#0F4C81]"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-left">
                                        <span className="font-extrabold block text-slate-900 leading-tight truncate max-w-[190px]">{group.fullname}</span>
                                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium truncate max-w-[190px]">{group.email}</span>
                                      </div>
                                    )}
                                  </td>

                                  {/* Paket Tryout */}
                                  <td className="px-4 py-3 align-middle text-left">
                                    <span className="font-extrabold text-slate-800 leading-tight block text-[11px] truncate max-w-[170px]" title={pkg?.name}>
                                      {pkg?.name || "Paket Dihapus"}
                                    </span>
                                    <span className="block text-[9px] text-[#F58220] font-mono mt-0.5">
                                      {pkg?.category || "UMUM"}
                                    </span>
                                  </td>

                                  {/* Dynamic sub-exams grid columns */}
                                  {activePkgForColumns ? (
                                    activePkgForColumns.subExams.map((sub, idx) => {
                                      const subRecord = group.subExamAttempts[sub.name];
                                      
                                      return (
                                        <td key={idx} className="px-4 py-3 text-center align-middle border-x border-slate-100 bg-slate-50/15">
                                          {isEditing ? (
                                            <div className="flex flex-col items-center gap-1 min-w-[90px] mx-auto text-center">
                                              <div className="flex items-center gap-0.5 justify-center">
                                                <input 
                                                  type="number"
                                                  min={0}
                                                  max={sub.questionCount}
                                                  value={editGroupedScores[sub.name] !== undefined ? editGroupedScores[sub.name] : 0}
                                                  onChange={(e) => {
                                                    const val = Math.min(sub.questionCount, Math.max(0, parseInt(e.target.value) || 0));
                                                    setEditGroupedScores(prev => ({
                                                      ...prev,
                                                      [sub.name]: val
                                                    }));
                                                  }}
                                                  className="w-10 px-1 py-0.5 text-center bg-white border border-slate-300 rounded font-bold text-slate-800 text-[11px]"
                                                />
                                                <span className="text-[10px] text-slate-400 font-mono">/{sub.questionCount}</span>
                                              </div>
                                            </div>
                                          ) : subRecord ? (
                                            <div className="text-center font-sans">
                                              <span className="font-mono font-bold text-slate-800 text-[11px] block">
                                                {subRecord.correctCount} / {sub.questionCount}
                                              </span>
                                              <span className="text-[10px] text-indigo-600 font-black block mt-0.5 font-mono">
                                                {subRecord.finalScore.toFixed(0)}%
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="text-center">
                                              <span className="inline-block bg-slate-50 text-slate-350 border border-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-md">
                                                Belum Ujian
                                              </span>
                                            </div>
                                          )}
                                        </td>
                                      );
                                    })
                                  ) : (
                                    /* Dynamic unified summary cell in ALL view */
                                    <td className="px-4 py-3 align-middle text-left">
                                      <div className="space-y-1 max-w-[280px]">
                                        {pkg?.subExams.map((sub, idx) => {
                                          const subRecord = group.subExamAttempts[sub.name];
                                          return (
                                            <div key={idx} className="flex items-center justify-between text-[10px] bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                                              <span className="font-bold text-slate-600 truncate max-w-[140px]" title={sub.name}>
                                                {getShortSubExamName(sub.name)}
                                              </span>
                                              <span className={`font-mono font-black text-[9px] ${subRecord ? "text-indigo-600" : "text-slate-400"}`}>
                                                {subRecord ? `${subRecord.correctCount}/${sub.questionCount} (${subRecord.finalScore.toFixed(0)}%)` : "—"}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </td>
                                  )}

                                  {/* Total Benar Paket */}
                                  <td className="px-4 py-3 text-center align-middle bg-slate-50 border-x border-slate-200">
                                    <span className="font-mono font-black text-indigo-600 text-xs block">
                                      {totalCorrectForPkg} / {totalQuestionsForPkg}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Total Soal</span>
                                  </td>

                                  {/* Integritas Monitor */}
                                  <td className="px-4 py-3 text-center align-middle">
                                    {isEditing ? (
                                      <div className="flex items-center justify-center gap-1 text-[11px] min-w-[90px]">
                                        <span className="text-slate-400">Switch:</span>
                                        <input 
                                          type="number"
                                          min={0}
                                          value={editViolations}
                                          onChange={(e) => setEditViolations(Math.max(0, parseInt(e.target.value) || 0))}
                                          className="w-12 px-1 py-0.5 text-center bg-white border border-slate-300 rounded font-bold text-slate-800"
                                        />
                                      </div>
                                    ) : (
                                      <span className={`px-2.5 py-1 rounded text-[10px] font-black shadow-xs inline-block text-center ${
                                        isBanned 
                                          ? "bg-red-50 text-red-700 animate-pulse border border-red-200 font-extrabold" 
                                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                      }`}>
                                        {isBanned ? "🚫 BANNED" : ` Jujur (${group.tabSwitchViolations || 0})`}
                                      </span>
                                    )}
                                  </td>

                                  {/* Nilai Rata-rata */}
                                  <td className="px-4 py-3 text-right align-middle font-mono font-black text-sm text-[#0F4C81] bg-slate-50/40">
                                    {isBanned ? "0.0" : currentScore.toFixed(1)}%
                                  </td>

                                  {/* Password Sesi */}
                                  <td className="px-4 py-3 text-center align-middle font-mono">
                                    {isEditing ? (
                                      <div className="flex flex-col gap-0.5 min-w-[110px] text-left mx-auto">
                                        <label className="text-[8px] font-bold text-slate-400 uppercase">Sandi Masuk</label>
                                        <input 
                                          type="text"
                                          value={editPasswordValue}
                                          onChange={(e) => setEditPasswordValue(e.target.value)}
                                          className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded font-mono font-bold text-slate-700"
                                        />
                                      </div>
                                    ) : (
                                      <span className="font-mono bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-0.5 rounded font-black text-[10px]">
                                        {getStudentPassword(group.email)}
                                      </span>
                                    )}
                                  </td>

                                  {/* Aksi */}
                                  <td className="px-4 py-3 text-center align-middle">
                                    <div className="flex items-center justify-center gap-2">
                                      {isEditing ? (
                                        <>
                                          <button 
                                            onClick={() => handleSaveGroupedEdit(group)}
                                            title="Simpan Nilai & Sandi"
                                            className="w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                                          >
                                            <i className="fa-solid fa-floppy-disk text-xs text-white"></i>
                                          </button>
                                          <button 
                                            onClick={() => setEditingGroupedKey(null)}
                                            title="Batal"
                                            className="w-7 h-7 rounded-full bg-slate-400 hover:bg-slate-500 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                                          >
                                            <i className="fa-solid fa-xmark text-xs text-white"></i>
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button 
                                            onClick={() => handleStartGroupedEdit(group)}
                                            title="Edit Seluruh Rekap Sektor"
                                            className="w-8 h-8 rounded-full bg-sky-50 text-[#0F4C81] border border-sky-300 hover:bg-sky-200 hover:text-[#0F4C81] flex items-center justify-center transition-all shadow-sm cursor-pointer duration-150"
                                          >
                                            <i className="fa-solid fa-pencil text-xs text-[#0F4C81]"></i>
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteGroupedClick(group)}
                                            title="Hapus Seluruh Rekap Mandiri"
                                            className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-300 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-all shadow-sm cursor-pointer duration-150"
                                          >
                                            <i className="fa-solid fa-trash-can text-xs text-rose-600 font-bold"></i>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="space-y-6">
                  {/* Database Registrasi Akun Siswa View */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">Database & Kredensial Registrasi Akun Siswa</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Daftar kredensial login nama lengkap, email, dan kata sandi siswa terdaftar secara nasional di Bimbel Kata Kita.</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportUsersToSheets}
                        className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-300 transition-all px-3 py-2 rounded-xl text-xs font-black shadow-sm cursor-pointer duration-150 font-sans"
                        title="Ekspor Seluruh Database Akun Registrasi Siswa ke Google Sheet 'Daftar Siswa'"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                        <span>Ekspor ke Sheets</span>
                      </button>

                      <button
                        onClick={() => setIsAddingStudent(!isAddingStudent)}
                        className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-sm cursor-pointer duration-150 font-sans"
                      >
                        <i className={`fa-solid ${isAddingStudent ? "fa-xmark" : "fa-user-plus"}`}></i>
                        <span>{isAddingStudent ? "Tutup Form" : "Daftarkan Siswa Manual"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual Add Student Card Form */}
                  {isAddingStudent && (
                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-4 text-left animate-slide-in">
                      <h5 className="text-xs font-black text-[#0F4C81] uppercase tracking-wide flex items-center gap-1.5">
                        <i className="fa-solid fa-user-plus text-xs"></i>
                        <span>Pendaftaran Akun Siswa Baru Secara Manual</span>
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Lengkap Siswa</label>
                          <input
                            type="text"
                            placeholder="Contoh: Muhammad Al-Faruq"
                            value={newStudentFullname}
                            onChange={(e) => setNewStudentFullname(e.target.value)}
                            className="bg-white px-3 py-2 text-xs w-full text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Kredensial Siswa</label>
                          <input
                            type="email"
                            placeholder="Contoh: faruq@gmail.com"
                            value={newStudentEmail}
                            onChange={(e) => setNewStudentEmail(e.target.value)}
                            className="bg-white px-3 py-2 text-xs w-full text-slate-850 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password Sesi / Masuk</label>
                          <input
                            type="text"
                            placeholder="Contoh: siswa123"
                            value={newStudentPassword}
                            onChange={(e) => setNewStudentPassword(e.target.value)}
                            className="bg-white px-3 py-2 text-xs w-full text-slate-850 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setNewStudentFullname("");
                            setNewStudentEmail("");
                            setNewStudentPassword("");
                            setIsAddingStudent(false);
                          }}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-650 px-4 py-2 text-[11px] font-black rounded-lg transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleAddStudentManual}
                          className="bg-indigo-650 hover:bg-indigo-750 text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-[11px] font-black rounded-lg transition-colors cursor-pointer"
                        >
                          Simpan Registrasi Akun
                        </button>
                      </div>
                    </div>
                  )}

                  {registeredStudents.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-slate-200/60 text-slate-400 text-xs font-sans">
                      <i className="fa-solid fa-users text-3xl text-slate-250 block mb-2"></i>
                      Database lokal kosong. Tiada data registrasi akun siswa yang tersimpan sekarang.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-250 rounded-xl">
                      <table className="min-w-full divide-y divide-slate-250 text-xs text-left text-slate-700">
                        <thead className="bg-[#111827] text-white font-sans">
                          <tr>
                            <th className="px-4 py-3">ID Siswa</th>
                            <th className="px-4 py-3">Nama Lengkap Siswa</th>
                            <th className="px-4 py-3">Email Log-In</th>
                            <th className="px-4 py-3">Password Kredensial</th>
                            <th className="px-4 py-3">Role Sistem</th>
                            <th className="px-4 py-3 text-center">Aksi / Manajemen</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 bg-white font-sans">
                          {registeredStudents.map((student: any) => {
                            const isEditing = editingStudentId === student.id;
                            return (
                              <tr key={student.id || student.email} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-4 py-3 font-mono font-bold text-slate-500">
                                  {student.id || "USR-AUTO"}
                                </td>
                                <td className="px-4 py-3">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editStudentFullname}
                                      onChange={(e) => setEditStudentFullname(e.target.value)}
                                      className="px-2 py-1 bg-white border border-slate-300 rounded font-bold text-slate-800 w-full focus:outline-none focus:border-indigo-500"
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2.5">
                                      <img
                                        src={student.photoUrl || "https://img.icons8.com/color/150/student-male--v1.png"}
                                        alt="Profil Siswa"
                                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://img.icons8.com/color/150/student-male--v1.png";
                                        }}
                                        referrerPolicy="no-referrer"
                                      />
                                      <span className="font-extrabold text-slate-900">{student.fullname || "Siswa Anonim"}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {isEditing ? (
                                    <input
                                      type="email"
                                      value={editStudentEmail}
                                      onChange={(e) => setEditStudentEmail(e.target.value)}
                                      className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 w-full focus:outline-none focus:border-indigo-500"
                                    />
                                  ) : (
                                    <span className="text-slate-600 font-medium">{student.email}</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editStudentPassword}
                                      onChange={(e) => setEditStudentPassword(e.target.value)}
                                      className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-slate-750 w-full focus:outline-none focus:border-indigo-500"
                                    />
                                  ) : (
                                    <span className="font-mono bg-orange-50 border border-orange-100 text-orange-850 px-2.5 py-0.5 rounded font-bold text-[10px]">
                                      {student.password || "siswa123"}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="bg-slate-100 text-slate-750 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                                    {student.role || "student"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    {isEditing ? (
                                      <>
                                        <button
                                          onClick={handleSaveEditStudent}
                                          title="Simpan Akun"
                                          className="w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                                        >
                                          <i className="fa-solid fa-floppy-disk text-xs"></i>
                                        </button>
                                        <button
                                          onClick={() => setEditingStudentId(null)}
                                          title="Batal"
                                          className="w-7 h-7 rounded-full bg-slate-450 bg-slate-400 hover:bg-slate-500 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                                        >
                                          <i className="fa-solid fa-xmark text-xs"></i>
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => handleStartEditStudent(student)}
                                          title="Edit Profil & Sandi Siswa"
                                          className="w-7 h-7 rounded-full bg-sky-50 text-[#0F4C81] border border-sky-300 hover:bg-sky-200 active:bg-sky-300 flex items-center justify-center transition-all shadow-xs cursor-pointer duration-150"
                                        >
                                          <i className="fa-solid fa-user-pen text-[10px]"></i>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteStudent(student.id)}
                                          title="Hapus Akun Registrasi Siswa"
                                          className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 border border-rose-300 hover:bg-rose-100 hover:text-rose-600 active:bg-rose-200 flex items-center justify-center transition-all shadow-xs cursor-pointer duration-150"
                                        >
                                          <i className="fa-solid fa-user-slash text-[10px]"></i>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: GOOGLE SHEETS SYNC */}
          {activeTab === "sheets" && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 animate-fade-in">
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[10px] font-bold bg-[#10B981] text-white px-2.5 py-1 rounded">GOOGLE WORKSPACE INTEGRATION</span>
                <h3 className="text-xl font-extrabold text-slate-900 font-display mt-2 flex items-center gap-2">
                  <i className="fa-solid fa-file-excel text-emerald-500"></i>
                  <span>Sinkronisasi Google Sheets / Spreadsheet</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Ekspor data rekapitulasi nilai tryout siswa, registrasi akun siswa, dan database bank soal secara waktu-nyata ke Google Sheets.</p>
              </div>

              {/* Status Connection Feedback */}
              {sheetsFeedback && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-semibold ${
                  sheetsFeedback.type === "success" 
                    ? "bg-emerald-50 border-emerald-250 text-emerald-850" 
                    : "bg-rose-50 border-rose-250 text-rose-850"
                }`}>
                  <div className="mt-0.5">
                    {sheetsFeedback.type === "success" 
                      ? <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
                      : <i className="fa-solid fa-triangle-exclamation text-rose-600 text-sm"></i>
                    }
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <p className="whitespace-normal break-all">{sheetsFeedback.message}</p>
                    {sheetsFeedback.message.includes("https://") && (
                      <a 
                        href={sheetsFeedback.message.match(/https:\/\/\S+/)?.[0]?.replace(/[).,]+$/, "")} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold underline mt-1"
                      >
                        <span>Buka Lembar Google Sheets Anda →</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Google Sheets Sync Metadata Card */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-200 p-6 rounded-2xl space-y-4 shadow-sm font-sans">
                <div className="flex items-center gap-2.5 border-b border-emerald-250 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm shadow">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Sistem Sinkronisasi & Folder Terverifikasi</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Data tersambung aman ke cloud penyimpanan Google Drive nasional</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <span className="font-bold text-slate-400 w-28 text-[10px] uppercase tracking-wider">Email Verifikasi:</span>
                      <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold text-[11px]">alfaruq.digital.id@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <span className="font-bold text-slate-400 w-28 text-[10px] uppercase tracking-wider">Folder GD:</span>
                      <a 
                        href="https://drive.google.com/drive/u/0/folders/1JL8Isq6z2mpt_ylUtKYa-TvClFhytxZ9" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-emerald-700 hover:underline font-bold flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-0.5 rounded shadow-xs text-[11px]"
                      >
                        <i className="fa-brands fa-google-drive text-amber-500"></i> Tryout Online Kata Kita <i className="fa-solid fa-arrow-up-right-from-square text-[8px]"></i>
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <span className="font-bold text-slate-400 w-28 text-[10px] uppercase tracking-wider">File Spreadsheet:</span>
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800 font-black text-[11px]">Platform Tryout Online</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <span className="font-bold text-slate-400 w-28 text-[10px] uppercase tracking-wider">Tautan Cepat:</span>
                      <a 
                        href="https://docs.google.com/spreadsheets/d/15btbpTleamWiLaUVIErxbIZvkOHpL-o9LS-mzzjg8pc/edit?gid=0#gid=0" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-700 hover:underline font-bold flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-0.5 rounded shadow-xs text-[11px]"
                      >
                        <i className="fa-solid fa-table text-emerald-600"></i> Buka Google Sheets Terverifikasi <i className="fa-solid fa-arrow-up-right-from-square text-[8px]"></i>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] bg-emerald-600/10 text-emerald-850 p-2.5 rounded-lg flex items-center gap-2 border border-emerald-250/50">
                  <i className="fa-solid fa-shield-halved text-emerald-605 text-sm"></i>
                  <span><strong>Status Enkripsi Terproteksi:</strong> Seluruh amandemen nilai/kunci di portal admin akan secara otomatis menyelaraskan lembaran Google Spreadsheet ini secara real-time!</span>
                </div>
              </div>

              {/* Step 1: Authentication block */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800">Status Otorisasi Akun Google Workspace</h4>
                  <p className="text-xs text-slate-500">Otorisasi dibutuhkan agar platform dapat mengisi atau menguraikan data Google Sheets pribadi Anda.</p>
                </div>

                <div>
                  {googleUser ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-150 px-4 py-2 rounded-xl text-xs">
                        <img 
                          src={googleUser.photoURL || "https://img.icons8.com/color/48/google-logo.png"} 
                          alt="Google Avatar" 
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full border border-white shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-800 leading-none truncate">{googleUser.displayName || "Google User"}</p>
                          <span className="text-[10px] text-slate-400 block truncate mt-0.5">{googleUser.email}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleDisconnectSheets}
                        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-unlink text-[10px]"></i>
                        <span>Putuskan Akun</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnectSheets}
                      className="bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold text-xs py-3 px-6 rounded-xl border border-indigo-750 shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <img src="https://img.icons8.com/color/48/google-logo.png" className="w-5 h-5 shrink-0" alt="google" />
                      <span>Hubungkan Akun Google Sheets</span>
                    </button>
                  )
                }
                </div>
              </div>

              {/* Step 2: Available Sync Actions */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Aksi Ekspor Data Terpilih</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1: Attempts Export */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shadow-inner">
                        <i className="fa-solid fa-users"></i>
                      </div>
                      <h5 className="text-xs font-black text-slate-800 leading-tight">Rekap Evaluasi Hasil Ujian</h5>
                      <p className="text-[11px] text-slate-400">Ekspor rekapitulasi nilai tryout siswa, durasi pengerjaan, skor kelulusan, dan status pelanggaran tab-switch.</p>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-650 px-2.5 py-0.5 rounded inline-block">
                        Total {attempts.length} baris data
                      </span>
                    </div>

                    <button
                      disabled={!googleUser || isSyncingSheets}
                      onClick={handleExportAttemptsToSheets}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSyncingSheets ? (
                        <>
                          <i className="fa-solid fa-spinner animate-spin"></i>
                          <span>Mengekspor...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-file-export"></i>
                          <span>{googleUser ? "Ekspor Nilai" : "Hubungkan Google"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card 2: Questions Bank Export */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shadow-inner">
                        <i className="fa-solid fa-database"></i>
                      </div>
                      <h5 className="text-xs font-black text-slate-800 leading-tight">Database Bank Soal Tryout</h5>
                      <p className="text-[11px] text-slate-400">Ekspor seluruh butir soal simulasi dari paket yang Anda pilih lengkap dengan pilihan jawaban ganda, kunci, serta penjelasannya.</p>
                      
                      <div className="pt-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Pilih Paket Ujian:</label>
                        <select
                          id="export-q-pkg-selector"
                          className="w-full border border-slate-250 p-1.5 rounded text-[10px] bg-slate-50 font-sans focus:outline-none text-slate-700"
                        >
                          {packages.map(p => (
                            <option key={p.id} value={p.id}>{p.category} - {p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      disabled={!googleUser || isSyncingSheets || packages.length === 0}
                      onClick={() => {
                        const sel = document.getElementById("export-q-pkg-selector") as HTMLSelectElement;
                        if (sel) handleExportQuestionsToSheets(sel.value);
                      }}
                      className="w-full bg-[#0F4C81] hover:bg-[#0c3e6a] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSyncingSheets ? (
                        <>
                          <i className="fa-solid fa-spinner animate-spin"></i>
                          <span>Mengekspor...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-file-export"></i>
                          <span>{googleUser ? "Ekspor Bank Soal" : "Hubungkan Google"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card 3: User Accounts Export */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-inner">
                        <i className="fa-solid fa-user-friends"></i>
                      </div>
                      <h5 className="text-xs font-black text-slate-800 leading-tight">Database Registrasi Siswa</h5>
                      <p className="text-[11px] text-slate-400">Ekspor rekapitulasi data nama lengkap siswa, alamat email, serta kredensial enkripsi kata sandi yang terdaftar pada platform.</p>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-650 px-2.5 py-0.5 rounded inline-block">
                        Format Lembar Terlindung
                      </span>
                    </div>

                    <button
                      disabled={!googleUser || isSyncingSheets}
                      onClick={handleExportUsersToSheets}
                      className="w-full bg-[#F58220] hover:bg-[#e07116] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSyncingSheets ? (
                        <>
                          <i className="fa-solid fa-spinner animate-spin"></i>
                          <span>Mengekspor...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-file-export"></i>
                          <span>{googleUser ? "Ekspor Pendaftar" : "Hubungkan Google"}</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>

              {/* SECTION: CUSTOM PORTABLE FIREBASE CONFIG */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 font-sans text-left">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0F4C81] text-white flex items-center justify-center text-sm shadow">
                      <i className="fa-solid fa-gears"></i>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Kustomisasi Firebase API Credentials (Vercel / Netlify)</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Bawa Kredensial Firebase Mandiri Anda untuk Domain Custom Hosting Anda sendiri</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-sans font-extrabold">
                    {usingCustomFirebase ? (
                      <span className="bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></span>
                        <span>Mode: Firebase Kustom ({firebaseActiveProjectId})</span>
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 border border-emerald-250 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span>Mode: Firebase Sistem Bawaan</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    Saat Anda meng-host platform ini di domain sendiri (misalnya di **Vercel atau Netlify**), proses otorisasi Google Sheets bawaan sistem kami akan memicu error <code className="bg-rose-50 text-rose-600 font-bold px-1 py-0.5 rounded border border-rose-200">auth/unauthorized-domain</code>. Hal ini karena Anda tidak memiliki akses ke Firebase Console bawaan sistem kami untuk mengotorisasi domain custom Anda.
                  </p>
                  <p className="text-[#F58220] font-bold">
                    Solusi Sempurna: Salin dan tempel konfigurasi JSON dari Proyek Firebase Anda sendiri di bawah ini untuk menghubungkannya secara instan dan bebas amandemen domain!
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="custom-fb-json" className="block text-xs font-bold text-slate-700">Tempel JSON Firebase SDK Config Anda:</label>
                  <textarea
                    id="custom-fb-json"
                    rows={6}
                    placeholder={`{
  "apiKey": "AIzaSy...",
  "authDomain": "proyek-anda.firebaseapp.com",
  "projectId": "proyek-anda",
  "storageBucket": "proyek-anda.firebasestorage.app",
  "messagingSenderId": "...",
  "appId": "..."
}`}
                    value={customFirebaseJson}
                    onChange={(e) => setCustomFirebaseJson(e.target.value)}
                    className="w-full text-[11px] font-mono p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-750 focus:outline-none focus:ring-1 focus:ring-[#0F4C81] focus:border-[#0F4C81] placeholder-slate-550"
                  />
                  <p className="text-[10px] text-slate-400">Pastikan Anda telah mengaktifkan **Metode Masuk Google** (Google Sign-In) di tab **Build &gt; Authentication &gt; Sign-in method** di Firebase Console Anda sendiri.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveCustomFirebase}
                    className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white font-extrabold text-xs py-2.5 px-5 rounded-lg border-b-2 border-slate-900 transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Terapkan Firebase Kustom</span>
                  </button>
                  {usingCustomFirebase && (
                    <button
                      onClick={handleResetCustomFirebase}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs py-2.5 px-5 rounded-lg border border-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-clock-rotate-left"></i>
                      <span>Kembali ke Sistem Bawaan</span>
                    </button>
                  )}
                </div>
              </div>

              {/* TROUBLESHOOTING GUIDE FOR auth/unauthorized-domain */}
              <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-850 space-y-4 shadow-xl font-sans">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center text-sm">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#F58220]">Solusi Error: auth/unauthorized-domain (Vercel / Netlify Deploy)</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Langkah konvensional untuk mengotorisasi domain hosting Anda di Google Firebase</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Jika Anda menemui error <code className="bg-rose-950/80 text-rose-300 px-1.5 py-0.5 rounded font-mono text-[10px]">auth/unauthorized-domain</code> saat mencoba menghubungkan akun Google Sheets di domain hosting baru, hal itu disebabkan karena Firebase memblokir pop-up sign-in dari luar domain resmi terdaftar.
                  </p>
                  
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                    <p className="font-extrabold text-slate-200">Domain yang harus diotorisasi untuk URL saat ini:</p>
                    <div className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded font-mono text-[10px] text-orange-400">
                      <span>{window.location.hostname}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.hostname);
                          alert("Domain disalin ke clipboard!");
                        }}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white font-bold px-2.5 py-1 rounded border border-slate-700 cursor-pointer flex items-center gap-1 transition-all"
                      >
                        <i className="fa-solid fa-copy text-slate-300"></i> Salin Domain
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-200">Langkah Otorisasi Mudah:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                      <li>Buka <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-sky-400 font-bold hover:underline">Firebase Console <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i></a>, lalu pilih proyek Firebase Anda <span className="text-orange-400 font-mono font-bold">(soal-ujian-online)</span>.</li>
                      <li>Di menu navigasi kiri, pilih <strong>Build &gt; Authentication</strong>.</li>
                      <li>Klik tab <strong>Settings</strong> di bagian atas.</li>
                      <li>Pilih menu <strong>Authorized domains</strong> (Domain resmi yang diotorisasi) di daftar kiri.</li>
                      <li>Klik tombol <strong>Add domain</strong> (Tambahkan domain), masukkan nilai domain yang Anda salin di atas: <code className="text-orange-400 font-mono font-bold">{window.location.hostname}</code>, lalu klik <strong>Add</strong>.</li>
                      <li>Selesai! Muat ulang (refresh) halaman web Anda dan hubungkan kembali ke Google Sheets.</li>
                    </ol>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Sticky Touch Bottom Navigation Menu Bar on Mobile Screen Sizes */}
        <nav className="sticky bottom-0 left-0 right-0 z-40 bg-[#111827] border-t border-slate-800 shadow-[0_-4px_12px_rgba(0,0,0,0.3)] px-1 py-1.5 flex justify-around items-center lg:hidden shrink-0">
          <button
            onClick={() => { setActiveTab("questions"); loadDatabaseState(); }}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "questions" ? "text-sky-405 font-black scale-105" : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-plus text-sm"></i>
            <span className="text-[9px] font-bold tracking-tight">Manual</span>
          </button>

          <button
            onClick={() => { setActiveTab("packages"); loadDatabaseState(); }}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "packages" ? "text-sky-405 font-black scale-105" : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-box-archive text-sm"></i>
            <span className="text-[9px] font-bold tracking-tight">Paket</span>
          </button>

          <button
            onClick={() => { setActiveTab("locks"); loadDatabaseState(); }}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "locks" ? "text-rose-400 font-black scale-105" : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-lock text-sm"></i>
            <span className="text-[9px] font-bold tracking-tight">Kunci</span>
          </button>

          <button
            onClick={() => { setActiveTab("results"); loadDatabaseState(); }}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "results" ? "text-sky-405 font-black scale-105" : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-users text-sm"></i>
            <span className="text-[9px] font-bold tracking-tight">Hasil</span>
          </button>

          <button
            onClick={() => { setActiveTab("sheets"); loadDatabaseState(); }}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "sheets" ? "text-emerald-450 font-black scale-105" : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-file-excel text-sm"></i>
            <span className="text-[9px] font-bold tracking-tight">Sheets</span>
          </button>
        </nav>

      </div>

      {showRefreshToast && (
        <div className="fixed bottom-6 right-6 bg-[#111827] border border-slate-800 text-white py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in z-50 font-sans text-left">
          <div className="w-7 h-7 rounded-full bg-[#0F4C81] flex items-center justify-center shrink-0">
            <i className="fa-solid fa-check text-xs text-white"></i>
          </div>
          <div>
            <p className="text-xs font-black text-white">Database Sinkron Seketika!</p>
            <p className="text-[10px] text-slate-400">Seluruh data ujian, paket, kunci, & hasil evaluasi berhasil dimuat ulang.</p>
          </div>
        </div>
      )}

      {/* CUSTOM DELUXE CONFIRMATION MODAL WITH GLASS NEON STYLING */}
      {deleteConfirmType !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/60 animate-fade-in font-sans">
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs" onClick={() => { setDeleteConfirmType(null); setDeleteIdTarget(null); }} />
          
          <div className="relative bg-[#111827]/98 border border-slate-700/65 p-6 md:p-8 rounded-2xl max-w-sm w-full mx-auto space-y-6 shadow-[0_0_50px_rgba(15,76,129,0.25)] text-center text-white backdrop-blur-xl animate-scale-up">
            {/* Ambient neon radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#0F4C81]/15 blur-[60px] rounded-full pointer-events-none" />
            
            {/* Warning icon with custom color glow */}
            <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center text-xl shadow-lg border ${
              deleteConfirmType === "clear_all_attempts" || deleteConfirmType === "package"
                ? "bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
                : "bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-[0_0_15px_rgba(245,130,32,0.3)]"
            }`}>
              <i className={deleteConfirmType === "clear_all_attempts" || deleteConfirmType === "package" ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-trash-can"}></i>
            </div>
            
            <div className="space-y-2 text-center">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-100">
                {deleteConfirmType === "question" 
                  ? "Hapus Soal Permanen" 
                  : deleteConfirmType === "attempt" 
                  ? "Hapus Sesi Rekap" 
                  : deleteConfirmType === "package"
                  ? "Hapus Paket Ujian"
                  : "Kosongkan Semua Rekap"}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed text-center">
                {deleteConfirmType === "question" 
                  ? "Apakah Anda yakin ingin menghapus butir soal ini secara permanen dari database nasional? Tindakan ini tidak dapat dibatalkan." 
                  : deleteConfirmType === "attempt" 
                  ? "Apakah Anda yakin ingin menghapus catatan sesi hasil tryout siswa ini? Data juga akan disinkronkan langsung ke Google Sheets." 
                  : deleteConfirmType === "package"
                  ? `Apakah Anda yakin ingin menghapus paket "${packages.find(p => p.id === deleteIdTarget)?.name || 'ini'}" secara total beserta seluruh kategori, sub-ujian, dan butir soal terkait?`
                  : "Apakah Anda yakin ingin menghapus seluruh catatan nilai siswa dan mengosongkan tabel rekap? Tindakan ini akan mengosongkan spreadsheet."}
              </p>
            </div>
            
            <div className="flex gap-3 justify-center pt-1.5">
              <button
                type="button"
                onClick={() => { setDeleteConfirmType(null); setDeleteIdTarget(null); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (deleteConfirmType === "question") {
                    handleConfirmDeleteQuestion();
                  } else if (deleteConfirmType === "attempt") {
                    if (deleteGroupedKeyTarget) {
                      await handleConfirmDeleteGrouped();
                    } else {
                      await handleConfirmDeleteAttempt();
                    }
                  } else if (deleteConfirmType === "clear_all_attempts") {
                    await handleConfirmClearAllAttempts();
                  } else if (deleteConfirmType === "package") {
                    handleConfirmDeletePackage();
                  }
                }}
                className={`flex-1 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer ${
                  deleteConfirmType === "clear_all_attempts" || deleteConfirmType === "package"
                    ? "bg-rose-600 hover:bg-rose-700 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_25px_rgba(244,63,94,0.6)]"
                    : "bg-[#0F4C81] hover:bg-[#0c3e6a] border border-[#0F4C81]/40 shadow-[0_0_15px_rgba(15,76,129,0.4)] hover:shadow-[0_0_25px_rgba(15,76,129,0.6)]"
                }`}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
