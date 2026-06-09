/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import StudentDashboard from "./components/StudentDashboard";
import ExamEngine from "./components/ExamEngine";
import { DEFAULT_PACKAGES, INITIAL_QUESTIONS } from "./data/initialData";
import { ExamPackage, Question, StudentAttempt, StudentAnswers, User, APP_THEMES, sortPackages } from "./types";
import { 
  subscribePackages, 
  subscribeQuestions, 
  subscribeAttempts, 
  subscribeUserRegistry, 
  subscribeLocks,
  batchSetFirebasePackages, 
  batchSetFirebaseQuestions, 
  batchSetFirebaseAttempts, 
  setFirebaseUser, 
  batchSetFirebaseUsers,
  setFirebaseLocks
} from "./lib/firebaseStore";

export default function App() {
  // Navigation states: 'landing' | 'login' | 'dashboard'
  const [view, setView] = useState<"landing" | "login" | "dashboard">("landing");
  
  // Authenticated user state loaded securely from persistent storage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("KATA_KITA_CURRENT_USER");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  // Dynamic theme customization state
  const [themeId, setThemeId] = useState(() => localStorage.getItem("KATA_KITA_THEME") || "ocean");

  // Database states with LocalStorage synchronization
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [locks, setLocks] = useState<{ [key: string]: boolean }>({});
  const [userRegistry, setUserRegistry] = useState<User[]>([]);

  // Active testing state
  const [activePkg, setActivePkg] = useState<ExamPackage | null>(null);
  const [activeSubExamName, setActiveSubExamName] = useState<string | null>(null);

  // Loading indicator for database initialization
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Synchronise currently logged-in user session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("KATA_KITA_CURRENT_USER", JSON.stringify(currentUser));
      setView("dashboard");
    } else {
      localStorage.removeItem("KATA_KITA_CURRENT_USER");
    }
  }, [currentUser]);

  // Security measures to prevent right click, view-source (ctrl+u), save page (ctrl+s), and inspect tools
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disabling Ctrl+S / Cmd+S (Save page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }

      // Disabling Ctrl+U / Cmd+Option+U (View Source)
      if (((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) || ((e.metaKey && e.altKey) && (e.key === 'u' || e.key === 'U'))) {
        e.preventDefault();
      }

      // Disabling F12, Ctrl+Shift+I / Cmd+Option+I (Inspect element)
      if (
        e.key === 'F12' || 
        ((e.ctrlKey && e.shiftKey) && (e.key === 'i' || e.key === 'I')) || 
        ((e.metaKey && e.altKey) && (e.key === 'i' || e.key === 'I')) ||
        ((e.ctrlKey && e.shiftKey) && (e.key === 'c' || e.key === 'C')) ||
        ((e.metaKey && e.altKey) && (e.key === 'c' || e.key === 'C')) ||
        ((e.ctrlKey && e.shiftKey) && (e.key === 'j' || e.key === 'J')) ||
        ((e.metaKey && e.altKey) && (e.key === 'j' || e.key === 'J'))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Inject color values dynamically into variables overlaying the exact primary (#0F4C81) and secondary (#F58220) classes
  useEffect(() => {
    const themeObj = APP_THEMES.find(t => t.id === themeId) || APP_THEMES[0];
    let styleEl = document.getElementById("dynamic-theme-style");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dynamic-theme-style";
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      :root {
        --color-primary: ${themeObj.primaryColor};
        --color-accent: ${themeObj.accentColor};
      }
      
      [class*="bg-[#0F4C81]"] { background-color: var(--color-primary) !important; }
      [class*="text-[#0F4C81]"] { color: var(--color-primary) !important; }
      [class*="border-[#0F4C81]"] { border-color: var(--color-primary) !important; }
      [class*="ring-[#0F4C81]"] { --tw-ring-color: var(--color-primary) !important; ring-color: var(--color-primary) !important; }
      [class*="hover:text-[#0F4C81]"]:hover { color: var(--color-primary) !important; }
      [class*="hover:bg-[#0F4C81]"]:hover { background-color: var(--color-primary) !important; }

      [class*="bg-[#F58220]"] { background-color: var(--color-accent) !important; }
      [class*="text-[#F58220]"] { color: var(--color-accent) !important; }
      [class*="border-[#F58220]"] { border-color: var(--color-accent) !important; }
      [class*="hover:text-[#F58220]"]:hover { color: var(--color-accent) !important; }
      
      [class*="hover:bg-[#0c3e6a]"]:hover { background-color: var(--color-primary) !important; opacity: 0.9; }
      [class*="hover:bg-[#09355b]"]:hover { background-color: var(--color-primary) !important; opacity: 0.85; }
      [class*="bg-blue-600"] { background-color: var(--color-primary) !important; }
      [class*="hover:bg-blue-700"]:hover { background-color: var(--color-primary) !important; opacity: 0.9; }
      
      [class*="from-[#0F4C81]"] { --tw-gradient-from: var(--color-primary) !important; --tw-gradient-stops: var(--color-primary), var(--tw-gradient-to, rgba(15, 76, 129, 0)) !important; }
    `;
    localStorage.setItem("KATA_KITA_THEME", themeId);
  }, [themeId]);

  // 1. Core Firestore Real-Time Database Subscription Effect
  useEffect(() => {
    // Auto-initialize the requested Firebase Config if not already configured in localStorage
    if (!localStorage.getItem("KATA_KITA_CUSTOM_FIREBASE_CONFIG")) {
      const defaultFirebaseSettings = {
        apiKey: "AIzaSyCflzDIBEgyypGrrb0yLXGMdzVDIK9Db3c",
        authDomain: "soal-ujian-online.firebaseapp.com",
        projectId: "soal-ujian-online",
        storageBucket: "soal-ujian-online.firebasestorage.app",
        messagingSenderId: "583250978894",
        appId: "1:583250978894:web:34c41246be8a954b14fb1f",
        measurementId: "G-V30CB7QRCX"
      };
      localStorage.setItem("KATA_KITA_CUSTOM_FIREBASE_CONFIG", JSON.stringify(defaultFirebaseSettings));
    }

    let loadedPkgs = false;
    let loadedQns = false;

    const checkReady = () => {
      if (loadedPkgs && loadedQns) {
        setIsDbLoaded(true);
      }
    };

    // Sub packages
    const unsubPkgs = subscribePackages((pkgs) => {
      if (pkgs.length === 0) {
        batchSetFirebasePackages(DEFAULT_PACKAGES);
      } else {
        const sorted = sortPackages(pkgs);
        setPackages(sorted);
        localStorage.setItem("KATA_KITA_PACKAGES", JSON.stringify(sorted));
      }
      loadedPkgs = true;
      checkReady();
    });

    // Sub questions
    const unsubQs = subscribeQuestions((qs) => {
      if (qs.length === 0) {
        batchSetFirebaseQuestions(INITIAL_QUESTIONS);
      } else {
        setQuestions(qs);
        localStorage.setItem("KATA_KITA_QUESTIONS", JSON.stringify(qs));
      }
      loadedQns = true;
      checkReady();
    });

    // Sub student attempts / results
    const unsubAtts = subscribeAttempts((atts) => {
      setAttempts(atts);
      localStorage.setItem("KATA_KITA_ATTEMPTS", JSON.stringify(atts));
    });

    // Sub user registration accounts registry
    const unsubUsers = subscribeUserRegistry((users) => {
      setUserRegistry(users);
      localStorage.setItem("KATA_KITA_USER_REGISTRY", JSON.stringify(users));
    });

    // Sub global access locks
    const unsubLocks = subscribeLocks((lkMap, customConfig) => {
      setLocks(lkMap || {});
      localStorage.setItem("KATA_KITA_LOCKS", JSON.stringify(lkMap));
      
      // Auto-synchronize custom Firebase configuration from default database
      if (customConfig) {
        const localRaw = localStorage.getItem("KATA_KITA_CUSTOM_FIREBASE_CONFIG");
        const localParsed = localRaw ? JSON.parse(localRaw) : null;
        
        // If local parsed matches but is missing, or is outdated, save and reload
        if (!localParsed || localParsed.apiKey !== customConfig.apiKey) {
          localStorage.setItem("KATA_KITA_CUSTOM_FIREBASE_CONFIG", JSON.stringify(customConfig));
          console.log("Database configuration changed on server. Synchronizing configurations...");
          // Reload the page to apply the fresh Firebase configuration
          setTimeout(() => {
            window.location.reload();
          }, 1100);
        }
      } else {
        // If there's no custom config on server, but we have a custom config locally (that doesn't match default), clear it!
        const localRaw = localStorage.getItem("KATA_KITA_CUSTOM_FIREBASE_CONFIG");
        if (localRaw) {
          try {
            const localParsed = JSON.parse(localRaw);
            if (localParsed && localParsed.projectId !== "soal-ujian-online") {
              localStorage.removeItem("KATA_KITA_CUSTOM_FIREBASE_CONFIG");
              console.log("Custom config was removed on default database. Clearing local custom config...");
              setTimeout(() => {
                window.location.reload();
              }, 1100);
            }
          } catch(e) {}
        }
      }
    });

    // Fallback timer to guarantee loading screen dismiss in slow connection
    const fallbackTimer = setTimeout(() => {
      setIsDbLoaded(true);
    }, 2800);

    return () => {
      unsubPkgs();
      unsubQs();
      unsubAtts();
      unsubUsers();
      unsubLocks();
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Sync state modifications directly to centralized Firestore and isomorphic LocalStorage
  const savePackagesToDb = (updated: ExamPackage[]) => {
    const sorted = sortPackages(updated);
    localStorage.setItem("KATA_KITA_PACKAGES", JSON.stringify(sorted));
    setPackages(sorted);
    batchSetFirebasePackages(sorted);
  };

  const saveQuestionsToDb = (updated: Question[]) => {
    localStorage.setItem("KATA_KITA_QUESTIONS", JSON.stringify(updated));
    setQuestions(updated);
    batchSetFirebaseQuestions(updated);
  };

  const saveAttemptsToDb = (updated: StudentAttempt[]) => {
    localStorage.setItem("KATA_KITA_ATTEMPTS", JSON.stringify(updated));
    setAttempts(updated);
    batchSetFirebaseAttempts(updated);
  };

  const saveUserRegistryToDb = (updated: User[]) => {
    localStorage.setItem("KATA_KITA_USER_REGISTRY", JSON.stringify(updated));
    batchSetFirebaseUsers(updated);
  };

  const saveLocksToDb = (updatedLocks: { [key: string]: boolean }) => {
    localStorage.setItem("KATA_KITA_LOCKS", JSON.stringify(updatedLocks));
    setLocks(updatedLocks);
    setFirebaseLocks(updatedLocks);
  };

  // Add individual custom question from Admin Manual Form
  const handleAddQuestion = (newQ: Question) => {
    const updated = [...questions, newQ];
    saveQuestionsToDb(updated);
  };

  // Add list of parsed bulk questions from Admin paste portal
  const handleAddBulkQuestions = (newQs: Question[]) => {
    const updated = [...questions, ...newQs];
    saveQuestionsToDb(updated);
  };

  // Handle active tryout submission
  const handleExamSubmit = (examAnswers: StudentAnswers, violations: number) => {
    if (!currentUser || !activePkg) return;

    // Filter questions belonging to this exam Package or specific Sub-Exam (only active/published ones)
    const pkgQs = activeSubExamName
      ? questions.filter(q => q.examId === activePkg.id && q.subExamName === activeSubExamName && q.isPublished !== false)
      : questions.filter(q => q.examId === activePkg.id && q.isPublished !== false);
      
    const totalQCount = pkgQs.length > 0 ? pkgQs.length : 1; // avoid divide by zero

    let correct = 0;
    let incorrect = 0;
    let empty = 0;

    if (violations < 3) {
      pkgQs.forEach(q => {
        const studentAns = examAnswers[q.id]?.answer;
        if (!studentAns) {
          empty++;
        } else if (studentAns === q.correctOption) {
          correct++;
        } else {
          incorrect++;
        }
      });
      
      // Fallback for demo questions in case database was cleared
      if (pkgQs.length === 0) {
        const singleAns = examAnswers["MOCK-Q-1"]?.answer;
        if (!singleAns) empty++;
        else if (singleAns === "A") correct++;
        else incorrect++;
      }
    } else {
      // Disqualified! Everything is empty/incorrect and score is forced to 0
      empty = totalQCount;
    }

    const finalPercentage = violations >= 3 ? 0.0 : ((correct / totalQCount) * 100);

    const newAttempt: StudentAttempt = {
      id: `ATT-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      examId: activePkg.id,
      subExamName: activeSubExamName || undefined,
      startTime: new Date().toISOString(), // Simulating timestamp
      endTime: new Date().toISOString(),
      status: "SUBMITTED",
      answers: examAnswers,
      tabSwitchViolations: violations,
      finalScore: finalPercentage,
      correctCount: correct,
      incorrectCount: incorrect,
      emptyCount: empty,
      // Pass along student credentials for easier Admin displays
      ...({ fullname: currentUser.fullname, email: currentUser.email } as any)
    };

    const updatedAttempts = [newAttempt, ...attempts];
    saveAttemptsToDb(updatedAttempts);
    
    // Clear active test state and return to student portal
    setActivePkg(null);
    setActiveSubExamName(null);
    setView("dashboard");
    
    // Alert the user on final score
    if (violations >= 3) {
      alert("Simulasi Tryout Selesai! Hasil Anda didiskualifikasi (nilai 0) karena terdeteksi keluar dari layar ujian sebanyak 3 kali atau lebih.");
    } else {
      alert(`Simulasi Tryout Berhasil Dikirim!\nSkor Anda: ${finalPercentage.toFixed(1)}%\nBenar: ${correct} | Salah: ${incorrect} | Kosong: ${empty}`);
    }
  };

  const handleStartExam = (examId: string, subExamName?: string) => {
    const pkg = packages.find(p => p.id === examId);
    if (pkg) {
      setActivePkg(pkg);
      setActiveSubExamName(subExamName || null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("KATA_KITA_CURRENT_USER");
    setView("landing");
  };

  const handleLoginSuccess = (userObj: User) => {
    setCurrentUser(userObj);
    localStorage.setItem("KATA_KITA_CURRENT_USER", JSON.stringify(userObj));
    setView("dashboard");
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("KATA_KITA_CURRENT_USER", JSON.stringify(updatedUser));
    
    // Propagate profile photo / names back to the secure local users database
    try {
      const rawRegistry = localStorage.getItem("KATA_KITA_USER_REGISTRY") || "[]";
      const registry: User[] = JSON.parse(rawRegistry);
      
      // Match by unique ID first to prevent duplication when email updates
      const existsById = updatedUser.id ? registry.some(u => u.id === updatedUser.id) : false;
      let updatedRegistry: User[];
      
      if (existsById) {
        updatedRegistry = registry.map(u => 
          u.id === updatedUser.id ? { ...u, ...updatedUser } : u
        );
      } else {
        // Fallback to matching by email if ID is not available, then update or append
        const existsByEmail = registry.some(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
        if (existsByEmail) {
          updatedRegistry = registry.map(u => 
            u.email.toLowerCase() === updatedUser.email.toLowerCase() ? { ...u, ...updatedUser } : u
          );
        } else {
          updatedRegistry = [...registry, updatedUser];
        }
      }

      // Proactively clean up any duplicate student profiles by matching unique ID or stable email
      const cleanedRegistry: User[] = [];
      const seenIds = new Set<string>();
      const seenEmails = new Set<string>();
      
      for (const u of updatedRegistry) {
        const idKey = u.id?.trim();
        const emailKey = u.email?.toLowerCase().trim();
        
        let isDuplicate = false;
        if (idKey && seenIds.has(idKey)) {
          isDuplicate = true;
        }
        if (emailKey && seenEmails.has(emailKey)) {
          isDuplicate = true;
        }
        
        if (!isDuplicate) {
          if (idKey) seenIds.add(idKey);
          if (emailKey) seenEmails.add(emailKey);
          cleanedRegistry.push(u);
        }
      }

      localStorage.setItem("KATA_KITA_USER_REGISTRY", JSON.stringify(cleanedRegistry));
    } catch (e) {
      console.error("Failed to sync user updates to registry:", e);
    }
  };

  // Safe checks for rendering
  if (!isDbLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <img
          src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png"
          alt="Bimbel Kata Kita Logo"
          className="h-20 w-auto animate-pulse mb-4"
          referrerPolicy="no-referrer"
        />
        <h2 className="text-lg font-bold text-slate-800">Menghubungkan Database Bimbel Kata Kita...</h2>
        <p className="text-xs text-slate-400 mt-1">Harap tunggu, mendaftarkan relasi basis data standar nasional tryout.</p>
      </div>
    );
  }

  const renderAppContent = () => {
    // Active examination overrides any dashboard tabs to prevent navigation cheats
    if (activePkg && currentUser?.role === "student") {
      return (
        <ExamEngine
          pkg={activePkg}
          subExamName={activeSubExamName}
          questions={questions}
          onCancel={() => {
            setActivePkg(null);
            setActiveSubExamName(null);
          }}
          onSubmit={handleExamSubmit}
        />
      );
    }

    switch (view) {
      case "landing":
        return <LandingPage onStart={() => setView("login")} />;
        
      case "login":
        return <Login onLoginSuccess={handleLoginSuccess} onGoBack={() => setView("landing")} userRegistry={userRegistry} />;
        
      case "dashboard":
        if (!currentUser) return <Login onLoginSuccess={handleLoginSuccess} onGoBack={() => setView("landing")} userRegistry={userRegistry} />;
        
        if (currentUser.role === "admin") {
          return (
            <AdminDashboard
              user={currentUser}
              packages={packages}
              questions={questions}
              onAddQuestion={handleAddQuestion}
              onAddBulkQuestions={handleAddBulkQuestions}
              onLogout={handleLogout}
              attempts={attempts}
              onUpdatePackages={savePackagesToDb}
              onUpdateAttempts={saveAttemptsToDb}
              onUpdateQuestions={saveQuestionsToDb}
              onUpdateUser={handleUpdateUser}
              onUpdateUserRegistry={saveUserRegistryToDb}
              themeId={themeId}
              onThemeChange={setThemeId}
            />
          );
        } else {
          // Filter attempts belonging exclusively to current logged in student
          const studentAttempts = attempts.filter(att => att.userId === currentUser.id);
          
          return (
            <StudentDashboard
              user={currentUser}
              packages={packages}
              questions={questions}
              attempts={studentAttempts}
              onStartExam={handleStartExam}
              onLogout={handleLogout}
              onSetViewAttemptReview={() => {}} // Controlled internally within student dashboard modal
              onUpdateUser={handleUpdateUser}
              themeId={themeId}
              onThemeChange={setThemeId}
            />
          );
        }
        
      default:
        return <LandingPage onStart={() => setView("login")} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {renderAppContent()}
    </div>
  );
}
