/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ExamPackage, Question, StudentAttempt, User, APP_THEMES } from "../types";
import { 
  initSheetsAuth, 
  signInWithGoogleSheets, 
  logoutGoogleSheets, 
  exportToGoogleSheets 
} from "../lib/googleSheets";

interface StudentDashboardProps {
  user: User;
  packages: ExamPackage[];
  questions: Question[];
  attempts: StudentAttempt[];
  onStartExam: (examId: string, subExamName?: string) => void;
  onLogout: () => void;
  onSetViewAttemptReview: (attempt: StudentAttempt | null) => void;
  onUpdateUser?: (updated: User) => void;
  themeId?: string;
  onThemeChange?: (themeId: string) => void;
}

const MOTIVATIONAL_QUOTES = [
  { text: "Ing ngarsa sung tulada, ing madya mangun karsa, tut wuri handayani.", author: "Ki Hajar Dewantara" },
  { text: "Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan, Anda dapat mengubah dunia.", author: "Nelson Mandela" },
  { text: "Belajar tanpa berpikir itu tidak berguna, berpikir tanpa belajar itu sangat berbahaya.", author: "Socrates" },
  { text: "Agama tanpa ilmu itu buta, ilmu tanpa agama itu lumpuh.", author: "Albert Einstein" },
  { text: "Tiada barang yang lebih berharga daripada ilmu. Tiada pahlawan yang lebih mulia daripada guru.", author: "R.A. Kartini" },
  { text: "Tujuan pendidikan itu untuk mempertajam kecerdasan, memperkukuh kemauan, serta memperhalus perasaan.", author: "Tan Malaka" },
  { text: "Hanya pendidikan yang bisa menyelamatkan masa depan. Tanpa pendidikan, Indonesia tidak mungkin bertahan.", author: "Najwa Shihab" }
];

export default function StudentDashboard({
  user,
  packages: initialPackages,
  questions: initialQuestions,
  attempts: initialAttempts,
  onStartExam,
  onLogout,
  onSetViewAttemptReview,
  onUpdateUser,
  themeId = "ocean",
  onThemeChange
}: StudentDashboardProps) {
  // Navigation active tab: 'beranda' | 'paket' | 'analisa' | 'profil' loaded and saved to localStorage
  const [activeTab, setActiveTabState] = useState<"beranda" | "paket" | "analisa" | "profil">(() => {
    return (localStorage.getItem("KATA_KITA_ACTIVE_TAB") as any) || "beranda";
  });

  const setActiveTab = (tab: "beranda" | "paket" | "analisa" | "profil") => {
    setActiveTabState(tab);
    localStorage.setItem("KATA_KITA_ACTIVE_TAB", tab);
  };

  const [showThemePopover, setShowThemePopover] = useState(false);

  // Local synced datase states to support instantaneous refresh
  const [packages, setPackages] = useState<ExamPackage[]>(initialPackages);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [attempts, setAttempts] = useState<StudentAttempt[]>(initialAttempts);
  
  // Package and sub-exam lock mapping loaded from LocalStorage
  const [locks, setLocks] = useState<{ [key: string]: boolean }>({});

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("SEMUA");
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [refreshNotification, setRefreshNotification] = useState(false);
  const [reviewingAttempt, setReviewingAttempt] = useState<StudentAttempt | null>(null);

  // Profile Form States
  const [editName, setEditName] = useState(user.fullname);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPassword, setEditPassword] = useState(user.password || "siswa123");
  const [editPhoto, setEditPhoto] = useState(user.photoUrl || "");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Detailed view state for subtests inside a package
  const [selectedPkgForSubExams, setSelectedPkgForSubExams] = useState<ExamPackage | null>(null);
  
  // Mobile responsive view controllers
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync profile form states when user changes
  useEffect(() => {
    setEditName(user.fullname);
    setEditEmail(user.email);
    setEditPassword(user.password || "siswa123");
    setEditPhoto(user.photoUrl || "");
  }, [user]);

  // CSS mappings for curriculum filter buttons to look highly professional
  const getFilterButtonClass = (cat: string, isActive: boolean) => {
    const isUtbk = cat === "UTBK SNBT";
    const isKedinasan = cat === "Kedinasan";
    const isCpns = cat === "CPNS";
    const isTni = cat === "TNI / Polri";
    const isBumn = cat === "BUMN";
    const isPppk = cat === "PPPK";
    const isPsikotes = cat === "Psikotes";
    const isTka = cat.includes("TKA");
    const isBing = cat.includes("Bahasa Inggris");
    const isMat = cat.includes("Matematika");
    const isMandiri = cat.includes("Mandiri");

    if (isActive) {
      if (isUtbk) return "bg-gradient-to-r from-blue-600 to-indigo-800 text-white shadow-md border-b-2 border-indigo-900 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isKedinasan) return "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md border-b-2 border-rose-950 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isCpns) return "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md border-b-2 border-orange-800 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isTni) return "bg-gradient-to-r from-emerald-600 to-cyan-800 text-white shadow-md border-b-2 border-cyan-950 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isBumn) return "bg-gradient-to-r from-purple-600 to-indigo-850 text-white shadow-md border-b-2 border-indigo-950 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isPppk) return "bg-gradient-to-r from-pink-600 to-red-700 text-white shadow-md border-b-2 border-red-955 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isPsikotes) return "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-md border-b-2 border-blue-950 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isTka) return "bg-gradient-to-r from-teal-500 to-emerald-700 text-white shadow-md border-b-2 border-emerald-950 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isBing) return "bg-gradient-to-r from-fuchsia-600 to-pink-700 text-white shadow-md border-b-2 border-pink-950 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isMat) return "bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md border-b-2 border-purple-950 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isMandiri) return "bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md border-b-2 border-slate-950 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      return "bg-[#0F4C81] text-white shadow-md border-b-2 border-blue-900 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
    } else {
      if (isUtbk) return "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/50 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isKedinasan) return "bg-red-50 hover:bg-red-100 text-red-650 border border-red-200/50 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isCpns) return "bg-amber-50 hover:bg-amber-100 text-amber-850 border border-amber-200/50 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isTni) return "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/50 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isBumn) return "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/50 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isPppk) return "bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200/50 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isPsikotes) return "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200/50 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isTka) return "bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/50 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isBing) return "bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-750 border border-fuchsia-200/50 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isMat) return "bg-violet-50 hover:bg-violet-100 text-violet-750 border border-violet-200/50 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      if (isMandiri) return "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250/50 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
      return "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/50 text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer";
    }
  };

  // Google Sheets student states
  const [studentGUser, setStudentGUser] = useState<any>(null);
  const [studentIsSyncingSheets, setStudentIsSyncingSheets] = useState(false);
  const [studentSheetsFeedback, setStudentSheetsFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Initial Sync and Random Quote selection
  useEffect(() => {
    loadDatabaseState();
    rotateQuote();
    initSheetsAuth(
      (user, token) => {
        setStudentGUser(user);
      },
      () => {
        setStudentGUser(null);
      }
    );
  }, []);

  const handleStudentConnectSheets = async () => {
    setStudentSheetsFeedback(null);
    try {
      const result = await signInWithGoogleSheets();
      if (result) {
        setStudentGUser(result.user);
      }
    } catch (err: any) {
      const errMsg = err.message || "";
      const isDomainError = errMsg.includes("unauthorized-domain") || errMsg.includes("auth/unauthorized-domain") || err.code === "auth/unauthorized-domain";

      setStudentSheetsFeedback({
        type: "error",
        message: isDomainError
          ? `Gagal Login: Domain "${window.location.hostname}" belum diotorisasi di Firebase. Silakan hubungi Administrator untuk menambahkan domain ini di Authorized Domains Firebase Console.`
          : (err.message || "Gagal otorisasi Google Sheets.")
      });
    }
  };

  const handleStudentDisconnectSheets = async () => {
    setStudentSheetsFeedback(null);
    try {
      await logoutGoogleSheets();
      setStudentGUser(null);
    } catch (err: any) {
      setStudentSheetsFeedback({
        type: "error",
        message: err.message || "Gagal disconnect Google."
      });
    }
  };

  const handleStudentExportToSheets = async () => {
    setStudentSheetsFeedback(null);
    setStudentIsSyncingSheets(true);
    try {
      const headers = [
        "Sesi ID",
        "Nama Paket Tryout",
        "Sub-Ujian Target",
        "Skor Kelulusan (%)",
        "Jawaban Benar",
        "Jawaban Salah",
        "Jawaban Kosong",
        "Riwayat Pelanggaran Tab-Switch",
        "Waktu Selesai Pengerjaan"
      ];
      const rows = attempts.map(att => {
        const pkg = packages.find(p => p.id === att.examId);
        const isBanned = att.tabSwitchViolations >= 3;
        return [
          att.id,
          pkg?.name || "Sesi Dihapus",
          att.subExamName || "Semua Sektor",
          isBanned ? 0 : (att.finalScore != null ? att.finalScore.toFixed(1) : "0.0"),
          att.correctCount || 0,
          att.incorrectCount || 0,
          att.emptyCount || 0,
          att.tabSwitchViolations || 0,
          att.startTime ? new Date(att.startTime).toLocaleString("id-ID") : "-"
        ];
      });

      const result = await exportToGoogleSheets(
        `Transkrip Nilai Tryout - ${user.fullname} [${new Date().toLocaleDateString("id-ID")}]`,
        headers,
        rows
      );

      setStudentSheetsFeedback({
        type: "success",
        message: `Transkrip berhasil dicadangkan ke Google Sheets! Silakan buka: ` + result.spreadsheetUrl
      });
    } catch (err: any) {
      console.error(err);
      setStudentSheetsFeedback({
        type: "error",
        message: err.message || "Gagal mencadangkan transkrip."
      });
    } finally {
      setStudentIsSyncingSheets(false);
    }
  };

  const loadDatabaseState = () => {
    // Sync packages, questions, attempts, and locks
    const stPkg = localStorage.getItem("KATA_KITA_PACKAGES");
    let currentPkgs = initialPackages;
    if (stPkg) {
      currentPkgs = JSON.parse(stPkg);
      setPackages(currentPkgs);
    } else {
      setPackages(initialPackages);
    }

    const stQst = localStorage.getItem("KATA_KITA_QUESTIONS");
    if (stQst) setQuestions(JSON.parse(stQst));
    else setQuestions(initialQuestions);

    const stAtt = localStorage.getItem("KATA_KITA_ATTEMPTS");
    if (stAtt) {
      const allAtts: StudentAttempt[] = JSON.parse(stAtt);
      setAttempts(allAtts.filter(a => a.userId === user.id));
    } else {
      setAttempts(initialAttempts.filter(a => a.userId === user.id));
    }

    // Load Locks
    const savedLocks = localStorage.getItem("KATA_KITA_LOCKS");
    if (savedLocks) {
      setLocks(JSON.parse(savedLocks));
    } else {
      // Default initial locks
      const defaultLocks: { [key: string]: boolean } = {
        "EXM-MAT": true,
        "EXM-AN": true,
        "EXM-LAINNYA": true,
        "Aljabar & Teori Bilangan": true,
        "Listening Comprehension (Simul.)": true
      };
      localStorage.setItem("KATA_KITA_LOCKS", JSON.stringify(defaultLocks));
      setLocks(defaultLocks);
    }

    // Sync sub-exam selected packet view state
    const savedSubPkgId = localStorage.getItem("KATA_KITA_VIEW_SUB_PKG");
    if (savedSubPkgId) {
      const found = currentPkgs.find(p => p.id === savedSubPkgId);
      if (found) setSelectedPkgForSubExams(found);
    }
  };

  // Keep selected package saved so session returns smoothly to active sub-tests view on submission
  useEffect(() => {
    if (selectedPkgForSubExams) {
      localStorage.setItem("KATA_KITA_VIEW_SUB_PKG", selectedPkgForSubExams.id);
    } else {
      localStorage.removeItem("KATA_KITA_VIEW_SUB_PKG");
    }
  }, [selectedPkgForSubExams]);

  const rotateQuote = () => {
    const rIdx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setQuote(MOTIVATIONAL_QUOTES[rIdx]);
  };

  // Dedicated manual refresh operation in dashboard
  const handleManualRefresh = () => {
    loadDatabaseState();
    rotateQuote();
    setRefreshNotification(true);
    setTimeout(() => {
      setRefreshNotification(false);
    }, 2500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProfileError("Maksimal ukuran foto adalah 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result as string);
        setProfileError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError("");

    if (!editName.trim() || !editEmail.trim()) {
      setProfileError("Nama Lengkap dan Email tidak boleh dikosongkan.");
      return;
    }

    const updatedUser: User = {
      ...user,
      fullname: editName.trim(),
      email: editEmail.trim(),
      password: editPassword,
      photoUrl: editPhoto
    };

    // Save updated session globally
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    // Update in LocalStorage users database if active
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  // Open and close details
  const handleOpenReview = (att: StudentAttempt) => {
    setReviewingAttempt(att);
    onSetViewAttemptReview(att);
  };

  const handleCloseReview = () => {
    setReviewingAttempt(null);
    onSetViewAttemptReview(null);
  };

  // Extraction calculations for Analisa & Pembahasan tab
  const getOverviewData = () => {
    const totalAttempted = attempts.length;
    if (totalAttempted === 0) {
      return {
        averageScore: 0,
        weakestCategory: "Belum Ada",
        strongestCategory: "Belum Ada",
        totalViolations: 0,
        prediction: "🚀 AYO KEPRAKKAN SAYAPMU! Layar simulasi menunggumu untuk memulai jejak kesuksesan pertama Anda hari ini. Mulai 1 Paket Ujian sekarang untuk menghitung instan rujukan target universitas impian Anda!"
      };
    }

    let sumScores = 0;
    let totalViolations = 0;
    attempts.forEach(a => {
      sumScores += a.finalScore || 0;
      totalViolations += a.tabSwitchViolations || 0;
    });

    const averageScore = sumScores / totalAttempted;

    // Strength and target prediction formulas designed with high-impact "hooks" and emotional appeal
    let prediction = `🎯 JANGAN PERNAH MENYERAH, PERJALANAN AGUNG ANDA BARU SAJA DIMULAI! Skor rata-rata Anda saat ini (${averageScore.toFixed(1)}%) adalah pijakan awal yang sangat berharga. Ingatlah, sejarah mencatat bahwa siswa-siswa hebat Bimbel Kata Kita yang kini sukses memakai seragam kebesaran IPDN, STAN, Akpol, serta almamater Universitas Favorit di Indonesia, juga memulai langkah pertamanya dari titik perjuangan ini! Pelajari pembahasan resmi secara mendalam, kuasai trik eliminasi taktis, dan hancurkan rekor pribadi Anda di simulasi tryout berikutnya. Masa depan menunggumu bertarung!`;
    
    if (averageScore >= 80) {
      prediction = `🔥 LUAR BIASA! PRESTASI TINGKAT ELITE! Dengan skor rata-rata emas ${averageScore.toFixed(1)}%, Anda diproyeksikan berada di garda terdepan untuk lolos ke Universitas Indonesia (UI), Universitas Gadjah Mada (UGM), Universitas Airlangga (UNAIR), STAN, atau Sekolah Kedinasan Utama pilihan pertama Anda! Kursi kehormatan di gerbang impian Anda sudah berjarak sejengkal saja. Tetap jaga fokus baja Anda, jangan beri celah sedikit pun untuk kelengahan! Tetaplah berlatih!`;
    } else if (averageScore >= 65) {
      prediction = `✨ PELUANG EMAS TERBUKA LEBAR! Kompetensi Anda saat ini menyentuh skor rata-rata ${averageScore.toFixed(1)}%. Anda masuk radar kuat kelulusan di kampus papan atas seperti Universitas Padjadjaran (UNPAD), Universitas Diponegoro (UNDIP), Universitas Brawijaya (UB) pilihan kedua, atau Akademi TNI/POLRI! Satu langkah cermat lagi dalam menaklukkan sub-tes terlemah Anda akan melesatkan probabilitas kelulusan Anda menjadi mutlak 100%. Teruslah mengasah kemampuan, kejayaan ada di depanku!`;
    } else if (averageScore >= 50) {
      prediction = `💪 SEDIKIT SENGATAN LAGI UNTUK MENEMBUS PUNCAK! Dengan raihan rata-rata skor saat ini ${averageScore.toFixed(1)}%, Anda memiliki peluang besar mengamankan posisi penting di Politeknik Negeri Se-Indonesia dan Rekayasa Formasi Kementerian untuk Jabatan Idaman. Hilangkan lelahmu, bakar kembali semangatmu! Kuasai celah soal di rekap pembahasan, dan mari buktikan bahwa Anda ditakdirkan untuk jauh lebih hebat di ujian berikutnya!`;
    }

    return {
      averageScore,
      weakestCategory: averageScore < 70 ? "Penalaran Kuantitatif & Matematika" : "Literasi Bahasa Inggris",
      strongestCategory: averageScore >= 70 ? "Pengetahuan Umum & Pemahaman Bacaan" : "Tes Karakteristik Pribadi (TKP)",
      totalViolations,
      prediction
    };
  };

  const categories = ["SEMUA", ...Array.from(new Set(packages.map(p => p.category as string)))] as string[];
  const filteredPackages = selectedCategoryFilter === "SEMUA" 
    ? packages 
    : packages.filter(p => p.category === selectedCategoryFilter);

  const analytics = getOverviewData();

  // Package Card Color Gradients for colorful unique background styles
  const packageColorMap: { [key: string]: string } = {
    "EXM-UTBK": "from-blue-500 via-indigo-600 to-indigo-700",
    "EXM-KEDINASAN": "from-red-500 via-rose-600 to-orange-600",
    "EXM-CPNS": "from-amber-400 via-orange-500 to-yellow-600",
    "EXM-TNIPOLRI": "from-teal-500 via-emerald-600 to-cyan-700",
    "EXM-BUMN": "from-purple-500 via-violet-600 to-indigo-700",
    "EXM-PPPK": "from-pink-500 via-rose-600 to-red-600",
    "EXM-PSIKOTES": "from-cyan-500 via-sky-600 to-blue-600",
    "EXM-TKA": "from-emerald-400 via-green-600 to-teal-700",
    "EXM-BING": "from-fuchsia-500 via-purple-600 to-indigo-700",
    "EXM-MAT": "from-indigo-500 via-violet-600 to-purple-700",
    "EXM-AN": "from-slate-600 via-slate-700 to-slate-800",
    "EXM-LAINNYA": "from-indigo-900 via-violet-800 to-purple-900"
  };

  const packageGradients = [
    "from-blue-600 via-indigo-600 to-indigo-750",
    "from-emerald-600 via-teal-600 to-cyan-700",
    "from-orange-500 via-amber-600 to-yellow-600",
    "from-purple-600 via-violet-600 to-indigo-750",
    "from-rose-500 via-pink-600 to-red-600",
    "from-teal-550 via-emerald-600 to-green-600",
    "from-cyan-550 via-sky-600 to-blue-650",
    "from-fuchsia-550 via-purple-600 to-pink-650",
    "from-amber-500 via-orange-550 to-yellow-550",
    "from-slate-600 via-slate-700 to-slate-800"
  ];

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
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0F4C81] to-[#0a3255] text-white flex flex-col justify-between shrink-0 shadow-2xl border-r border-slate-900/10 lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div>
          {/* Logo Brand Brand block */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <img
              src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png"
              alt="Bimbel Kata Kita Logo"
              className="h-10 w-auto bg-white/10 p-1 rounded-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-xs font-bold font-mono tracking-wider text-orange-400">CBT PORTAL</h2>
              <h1 className="text-sm font-extrabold tracking-tight">KATA KITA GROUP</h1>
            </div>
          </div>

          {/* Student mini-profile overview */}
          <div className="p-5 border-b border-white/10 bg-black/10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full border-2 border-orange-400 overflow-hidden mb-3 bg-white/20">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="fa-solid fa-user-graduate text-3xl text-orange-200"></i>
                </div>
              )}
            </div>
            <h3 className="text-sm font-bold truncate max-w-[200px]">{user.fullname}</h3>
            <p className="text-[10px] text-slate-300 font-mono mt-0.5 truncate max-w-[200px]">{user.email}</p>
            <span className="text-[9px] font-bold bg-[#F58220] text-white px-2 py-0.5 rounded-full mt-2.5">
              SISWA PREP NASIONAL
            </span>
          </div>

          {/* Sidebar Menu items */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => { setActiveTab("beranda"); loadDatabaseState(); setSelectedPkgForSubExams(null); setIsMobileSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "beranda" ? "bg-[#F58220] text-white shadow-md" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <i className="fa-solid fa-house-laptop text-sm"></i>
              <span>Beranda</span>
            </button>

            <button
              onClick={() => { setActiveTab("paket"); loadDatabaseState(); setSelectedPkgForSubExams(null); setIsMobileSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "paket" ? "bg-[#F58220] text-white shadow-md" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <i className="fa-solid fa-graduation-cap text-sm"></i>
              <span>List Paket Ujian</span>
            </button>

            <button
              onClick={() => { setActiveTab("analisa"); loadDatabaseState(); setSelectedPkgForSubExams(null); setIsMobileSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "analisa" ? "bg-[#F58220] text-white shadow-md" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <i className="fa-solid fa-chart-line text-sm"></i>
              <span>Analisa & Pembahasan</span>
            </button>

            <button
              onClick={() => { setActiveTab("profil"); loadDatabaseState(); setSelectedPkgForSubExams(null); setIsMobileSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "profil" ? "bg-[#F58220] text-white shadow-md" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <i className="fa-solid fa-id-card text-sm"></i>
              <span>Edit Profil</span>
            </button>
          </nav>
        </div>

        {/* Footer Area with Dynamic Refresh and Log out */}
        <div className="p-4 border-t border-white/10 bg-black/15">
          <button
            onClick={() => { handleManualRefresh(); setIsMobileSidebarOpen(false); }}
            className="w-full mb-2 bg-blue-600/30 hover:bg-blue-600/50 text-sky-200 border border-blue-500/30 text-xs py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-arrows-rotate"></i>
            <span>Refresh Data</span>
          </button>
          <button
            onClick={() => { onLogout(); setIsMobileSidebarOpen(false); }}
            className="w-full bg-red-600/30 hover:bg-red-600/60 text-red-200 border border-red-500/30 text-xs py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-power-off text-xs"></i>
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main Dynamic Workspace Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Dynamic header navbar inside workspace */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile Hamburger menu trigger icon */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-[#0F4C81] hover:bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer transition-all"
              title="Buka Menu Navigasi"
            >
              <i className="fa-solid fa-bars text-base"></i>
            </button>
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-wide truncate max-w-[200px] sm:max-w-none">
              Dashboard / {activeTab === "beranda" ? "Overview Beranda" : activeTab === "paket" ? "List Paket Tryout" : activeTab === "analisa" ? "Dashboard Analisa Nilai" : "Pengaturan Parameter Profil"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-mono hidden md:inline-block">
              INTEGRITAS CBT: <span className="font-extrabold text-emerald-600">MENYALA</span>
            </span>

            {/* Paint brush theme selector popover */}
            <div className="relative">
              <button
                onClick={() => setShowThemePopover(!showThemePopover)}
                className="p-2 text-slate-500 hover:text-orange-500 transition-colors rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                title="Pilih Kombinasi Warna Tema Platform"
              >
                <i className="fa-solid fa-paintbrush text-sm"></i>
              </button>

              {showThemePopover && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowThemePopover(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50 animate-fade-in text-left">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-2.5 border-b border-slate-100 pb-1.5 flex items-center gap-1">
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
                            className={`w-full flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all text-xs border ${
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

            <button
              onClick={handleManualRefresh}
              className="p-2 text-slate-500 hover:text-[#0F4C81] transition-colors rounded-lg bg-slate-100 hover:bg-slate-200"
              title="Refresh Halaman Tanpa Keluar"
            >
              <i className="fa-solid fa-rotate text-sm"></i>
            </button>
          </div>
        </header>

        {/* Outer scrolling container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          
          {/* Refresh visual Toast Notification banner */}
          {refreshNotification && (
            <div className="absolute top-4 right-8 bg-slate-900 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 z-50 border border-orange-400/40 animate-bounce">
              <i className="fa-solid fa-circle-check text-emerald-400"></i>
              <span>Data & quotes berhasil diperbarui tanpa reload!</span>
            </div>
          )}

          {/* RENDERING SWITCH BOARD BY CURRENT TAB ACTIVE */}
          {activeTab === "beranda" && (
            <div className="space-y-8 animate-fade-in">
              {/* Profile Jumbotron banner */}
              <div className="bg-gradient-to-r from-[#0F4C81] to-slate-800 text-white p-5 sm:p-8 rounded-2xl border-l-4 border-l-[#F58220] shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent"></div>
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-slate-100">Portal Siswa Terpadu</span>
                  <h2 className="text-2xl sm:text-3xl font-black mt-2">
                    Selamat Datang Kembali, <span className="text-[#F58220] font-sans">{user.fullname}</span>!
                  </h2>
                  <p className="text-xs text-slate-200 mt-2 font-sans leading-relaxed max-w-3xl">
                    Sistem evaluasi tryout nasional Bimbel Kata Kita menyajikan parameter ujian riil terakurat. Gunakan portal pengerjaan ujian secara bertahap dan tinjau performatika akademik Anda di sub-menu analisa.
                  </p>
                </div>
              </div>

              {/* Stat Boxes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-[#0F4C81] flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Peserta Nasional</span>
                    <span className="text-xl font-bold font-mono text-slate-800">
                      {(() => {
                        try {
                          const registry = JSON.parse(localStorage.getItem("KATA_KITA_USER_REGISTRY") || "[]");
                          const studentCount = registry.filter((u: any) => u.role === "student" || !u.role).length;
                          return studentCount.toLocaleString("id-ID");
                        } catch (e) {
                          return "0";
                        }
                      })()} Siswa
                    </span>
                    <p className="text-[9px] text-slate-400 mt-0.5">Terdaftar aktif berjuang bersama</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-spinner animate-spin"></i>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Sedang Mengerjakan CBT</span>
                    <span className="text-xl font-bold font-mono text-slate-800">
                      {(() => {
                        try {
                          const rawAttempts = JSON.parse(localStorage.getItem("KATA_KITA_ATTEMPTS") || "[]");
                          return rawAttempts.filter((att: any) => att.status === "ON_PROGRESS").length;
                        } catch (e) {
                          return "0";
                        }
                      })()} Siswa Aktif
                    </span>
                    <p className="text-[9px] text-[#F58220] font-semibold mt-0.5">Melakukan tryout waktu riil</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Ujian Diselesaikan</span>
                    <span className="text-xl font-bold font-mono text-slate-800">
                      {(() => {
                        try {
                          const rawAttempts = JSON.parse(localStorage.getItem("KATA_KITA_ATTEMPTS") || "[]");
                          return rawAttempts.filter((att: any) => att.status === "SUBMITTED").length;
                        } catch (e) {
                          return "0";
                        }
                      })()} Sesi
                    </span>
                    <p className="text-[9px] text-slate-400 mt-0.5">Siswa berhasil submit skor</p>
                  </div>
                </div>
              </div>

              {/* Split Content: Rules (Left) and Motivational Quote (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Rules & Warnings */}
                <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 font-display border-b border-slate-100 pb-2.5 flex items-center gap-2">
                    <i className="fa-solid fa-circle-info text-[#F58220]"></i> Aturan & Instruksi Utama Pengerjaan Ujian
                  </h3>
                  <div className="space-y-3 text-xs text-slate-650 leading-relaxed font-sans">
                    <div className="flex gap-2 items-start bg-amber-50 p-3 rounded-lg border border-amber-200/55">
                      <i className="fa-solid fa-triangle-exclamation text-amber-600 mt-0.5 text-sm"></i>
                      <p className="text-amber-800 font-medium">
                        Fitur Anti-Curang: Ujian dipantau oleh server. Keluar layar browser (tab-switch) lebih dari 3 kali akan membatalkan hasil pengerjaan (Diskontinu / Diskualifikasi otomatis).
                      </p>
                    </div>
                    <ul className="space-y-2 list-none pl-1">
                      <li className="flex items-center gap-2">
                        <i className="fa-solid fa-check text-emerald-500"></i>
                        <span>Pastikan koneksi internet stabil sebelum mulai menekan tombol pengerjaan.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="fa-solid fa-check text-emerald-500"></i>
                        <span>Gunakan pembagian alokasi waktu tiap-tiap sub-tes secara efisien.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="fa-solid fa-check text-emerald-500"></i>
                        <span>Jika ragu-ragu menentukan jawaban, tandai tombol indikator ragu kuning.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Motivational Quote Figure Box */}
                <div className="lg:col-span-5 bg-[#0F4C81] text-white p-6 rounded-xl border-l-4 border-l-[#F58220] shadow-md flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-1 right-2 opacity-5 text-8xl shrink-0 font-serif">“</div>
                  <div className="relative z-10">
                    <span className="text-[9px] font-bold text-orange-400 uppercase font-mono tracking-widest block mb-2.5">MOTIVASI PENDIDIKAN</span>
                    <p className="text-xs italic font-semibold leading-relaxed text-slate-100">
                      "{quote.text}"
                    </p>
                  </div>
                  <div className="text-right mt-6 border-t border-white/10 pt-2 relative z-10">
                    <p className="text-xs font-bold text-orange-400">— {quote.author}</p>
                    <p className="text-[10px] text-slate-300 font-mono">Tokoh / Pejuang Pendidikan</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "paket" && (
            <div className="space-y-6">
              {!selectedPkgForSubExams ? (
                <>
                  {/* Filter Area */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-3 shrink-0">Filter Sektor:</span>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={getFilterButtonClass(cat, selectedCategoryFilter === cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Colorful unique grid items */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
                        <i className="fa-solid fa-list-check text-[#F58220]"></i> Peta Kurikulum & Sesi Paket Ujian Nasional
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium">Klik per paket untuk langsung memasuki simulasi CBT</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredPackages.map((pkg, idx) => {
                        const isAllSubExamsCompleted = pkg.subExams.every(
                          sub => attempts.some(att => att.examId === pkg.id && att.subExamName === sub.name && att.status === "SUBMITTED")
                        );
                        const isPkgLocked = locks[pkg.id] === true || isAllSubExamsCompleted;
                        // Determine custom background gradient from color map or index rotation
                        const bgGrad = packageColorMap[pkg.id] || packageGradients[idx % packageGradients.length];
                        
                        return (
                          <div
                            key={pkg.id}
                            className={`rounded-2xl shadow-md border border-white/15 overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                              isPkgLocked ? "grayscale border-slate-300 bg-slate-100 text-slate-500 shadow-none hover:translate-y-0" : "bg-gradient-to-br " + bgGrad + " text-white hover:-translate-y-1 hover:shadow-xl"
                            }`}
                          >
                            <div className="p-6 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${
                                  isPkgLocked ? "bg-slate-300 text-slate-600" : "bg-white/20 text-white"
                                }`}>
                                  {pkg.category}
                                </span>
                                {isAllSubExamsCompleted ? (
                                  <span className="text-xs text-emerald-850 font-bold bg-emerald-100/90 px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                                    <i className="fa-solid fa-circle-check text-[10px]"></i> LENGKAP & DIKUNCI
                                  </span>
                                ) : isPkgLocked && (
                                  <span className="text-xs text-red-650 font-bold bg-red-100/80 px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                                    <i className="fa-solid fa-lock text-[10px]"></i> TERKUNCI ADMIN
                                  </span>
                                )}
                              </div>

                              <h4 className="text-base font-bold tracking-tight">{pkg.name}</h4>
                              <p className={`text-xs leading-relaxed ${isPkgLocked ? "text-slate-400" : "text-white/85"}`}>
                                {pkg.description}
                              </p>

                              {/* Sub-exam parameters & nested lock mechanism check */}
                              <div className="pt-3 border-t border-white/10 space-y-1.5">
                                <p className="text-[10px] font-bold opacity-75">STRUKTUR SUB-UJIAN:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {pkg.subExams.map((sub, sIdx) => {
                                    const isSubCompleted = attempts.some(
                                      att => att.examId === pkg.id && att.subExamName === sub.name && att.status === "SUBMITTED"
                                    );
                                    const isSubLocked = locks[sub.name] === true || isSubCompleted;
                                    return (
                                      <span
                                        key={sIdx}
                                        className={`text-[9px] px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${
                                          isSubCompleted
                                            ? "bg-emerald-200/90 text-emerald-800 border border-emerald-300/40"
                                            : isSubLocked 
                                              ? "bg-red-200/90 text-red-700 line-through decoration-red-700 decoration-1"
                                              : isPkgLocked 
                                                ? "bg-slate-200 text-slate-500"
                                                : "bg-white/15 text-white/90 border border-white/10"
                                        }`}
                                      >
                                        {isSubCompleted ? (
                                          <i className="fa-solid fa-check text-[8px]"></i>
                                        ) : isSubLocked ? (
                                          <i className="fa-solid fa-lock text-[8px]"></i>
                                        ) : null}
                                        {sub.name} ({sub.durationMinutes}m)
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Card bottom bar */}
                            <div className="p-4 bg-black/15 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                              <div className="flex items-center gap-3">
                                <span>{pkg.totalDurationMinutes} Mnt</span>
                                <span>&bull;</span>
                                <span>{pkg.totalQuestions} Soal</span>
                              </div>

                              {isPkgLocked && !isAllSubExamsCompleted ? (
                                <button
                                  disabled
                                  className="bg-slate-300 text-slate-500 font-bold text-xs py-1.5 px-4 rounded-lg cursor-not-allowed flex items-center gap-1 select-none"
                                >
                                  <i className="fa-solid fa-lock text-[10px]"></i> Non-aktif
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedPkgForSubExams(pkg);
                                  }}
                                  className="bg-[#F58220] hover:bg-[#e07116] text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm border-b-2 border-b-amber-800 transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1"
                                >
                                  <span>Buka Rincian Paket</span>
                                  <i className="fa-solid fa-arrow-right text-[10px] ml-0.5"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  {/* Header card with back button */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <button
                      onClick={() => {
                        const isAllCompleted = selectedPkgForSubExams.subExams.every(
                          sub => attempts.some(att => att.examId === selectedPkgForSubExams.id && att.subExamName === sub.name && att.status === "SUBMITTED")
                        );
                        if (isAllCompleted) {
                          const updatedLocks = { ...locks, [selectedPkgForSubExams.id]: true };
                          localStorage.setItem("KATA_KITA_LOCKS", JSON.stringify(updatedLocks));
                          setLocks(updatedLocks);
                        }
                        setSelectedPkgForSubExams(null);
                      }}
                      className="inline-flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 hover:text-[#0F4C81] transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-arrow-left"></i> Kembali ke Daftar Paket Tryout
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase py-1 px-2.5 rounded-md bg-orange-100 text-[#F58220] tracking-wider">
                          {selectedPkgForSubExams.category}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedPkgForSubExams.name}</h3>
                        <p className="text-xs text-slate-500 font-sans mt-1 leading-relaxed max-w-4xl">
                          {selectedPkgForSubExams.description}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-center px-2">
                          <span className="text-[9px] text-slate-400 block font-bold">TOTAL SUB-UJIAN</span>
                          <span className="text-sm font-black text-slate-800 font-mono">{selectedPkgForSubExams.subExams.length} Sektor</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="text-center px-2">
                          <span className="text-[9px] text-slate-400 block font-bold">DURASI AKBAR</span>
                          <span className="text-sm font-black text-slate-800 font-mono">{selectedPkgForSubExams.totalDurationMinutes} Menit</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Encouraging completion banner if all sub-exams are done */}
                  {selectedPkgForSubExams.subExams.every(
                    sub => attempts.some(att => att.examId === selectedPkgForSubExams.id && att.subExamName === sub.name && att.status === "SUBMITTED")
                  ) && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl text-xs flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 shrink-0">
                        <i className="fa-solid fa-trophy text-base"></i>
                      </div>
                      <div>
                        <p className="font-extrabold text-sm">Selamat! Paket Ujian Ini Telah Selesai</p>
                        <p className="text-slate-650 font-sans mt-0.5 leading-relaxed">
                          Anda telah menyelesaikan seluruh sub-ujian dalam paket ini secara komprehensif. Hasil pengerjaan Anda telah terekam sepenuhnya.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sub-exam detailed table/list */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                        <i className="fa-solid fa-layer-group text-[#0F4C81] mr-1.5"></i> RINCIAN SUB-UJIAN AKTIF
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">Bisa dikerjakan secara bebas/acak selama belum dikunci</span>
                    </div>

                    <div className="divide-y divide-slate-100 font-sans">
                      {selectedPkgForSubExams.subExams.map((sub, sIdx) => {
                        const isSubCompleted = attempts.some(
                          att => att.examId === selectedPkgForSubExams.id && att.subExamName === sub.name && att.status === "SUBMITTED"
                        );
                        const isSubLockedInDb = locks[sub.name] === true || locks[selectedPkgForSubExams.id] === true;

                        // Calculate number of questions for this sub-exam (only published ones)
                        const subQs = questions.filter(
                          q => q.examId === selectedPkgForSubExams.id && q.subExamName === sub.name && q.isPublished !== false
                        );
                        const realQCount = subQs.length > 0 ? subQs.length : sub.questionCount;

                        return (
                          <div key={sIdx} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/85 transition-colors">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-50 text-[#0F4C81] text-xs font-bold font-mono flex items-center justify-center shrink-0">
                                  {sIdx + 1}
                                </span>
                                <span className="font-bold text-sm text-slate-800">{sub.name}</span>
                              </div>
                              <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pl-8">
                                <span className="flex items-center gap-1">
                                  <i className="fa-regular fa-clock text-slate-400"></i> {sub.durationMinutes} Menit
                                </span>
                                <span>&bull;</span>
                                <span className="flex items-center gap-1">
                                  <i className="fa-regular fa-file-lines text-slate-400"></i> {realQCount} Butir Soal
                                </span>
                              </div>
                            </div>

                            <div className="pl-8 sm:pl-0 shrink-0 self-stretch sm:self-center flex items-center justify-end">
                              {isSubCompleted ? (
                                <div className="flex items-center gap-2">
                                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-250 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1">
                                    <i className="fa-solid fa-circle-check text-emerald-600"></i> SELESAI
                                  </span>
                                  {/* Allow viewing attempt review */}
                                  {attempts.filter(att => att.examId === selectedPkgForSubExams.id && att.subExamName === sub.name)[0] && (
                                    <button
                                      onClick={() => handleOpenReview(attempts.filter(att => att.examId === selectedPkgForSubExams.id && att.subExamName === sub.name)[0])}
                                      className="text-[10px] bg-slate-100 font-bold hover:bg-slate-200 text-slate-705 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                                    >
                                      Pembahasan <i className="fa-solid fa-angles-right text-[8px] ml-0.5"></i>
                                    </button>
                                  )}
                                </div>
                              ) : isSubLockedInDb ? (
                                <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 select-none">
                                  <i className="fa-solid fa-lock text-[9px]"></i> KUNCI ADMIN
                                </span>
                              ) : (
                                <button
                                  onClick={() => onStartExam(selectedPkgForSubExams.id, sub.name)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-2 rounded-lg shadow-sm border-b-2 border-b-blue-900 transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  Mulai Sub-Ujian <i className="fa-solid fa-play text-[9px] animate-pulse"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "analisa" && (
            <div className="space-y-8">
              {locks["ANALISA_PEMBAHASAN"] === true ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-5 animate-fade-in my-6">
                  <div className="w-16 h-16 rounded-full bg-red-50 text-red-650 flex items-center justify-center text-3xl mx-auto border border-red-100 shadow-inner">
                    <i className="fa-solid fa-user-lock"></i>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-slate-900">Analisa & Pembahasan Terkunci</h3>
                    <p className="text-xs text-slate-500 font-sans leading-relaxed">
                      Penguji atau Administrator Bimbel Kata Kita telah menonaktifkan sementara fitur peninjauan nilai & kunci jawaban di portal ujian Anda.
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/60 text-left text-[11px] leading-relaxed text-amber-900 font-sans">
                    <p className="font-semibold flex items-center gap-1.5 text-xs text-amber-800 mb-1">
                      <i className="fa-solid fa-triangle-exclamation"></i> Kenapa Fitur Ini Dikunci?
                    </p>
                    Biasanya fitur peninjauan dikunci selama sesi evaluasi utama nasional sedang berjalan atau direkap oleh penguji demi menjaga kerahasiaan jawaban cermat. Hubungi admin penguji untuk membuka kunci.
                  </div>
                  <button
                    onClick={() => setActiveTab("beranda")}
                    className="bg-[#0F4C81] hover:bg-[#09355b] text-white text-xs font-bold py-2.5 px-6 rounded-lg shadow border-b-2 border-b-blue-900 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    Kembali Ke Beranda
                  </button>
                </div>
              ) : (
                <>
                  {/* Statistical review cards */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-display border-b border-slate-100 pb-3 flex items-center gap-2">
                      <i className="fa-solid fa-chart-pie text-blue-600"></i> Diagnosis & Saran Kesiapan Akademik Anda
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Skor Rata-Rata Anda</span>
                        <p className="text-2xl font-black text-[#0F4C81] mt-1 font-mono">
                          {analytics.averageScore.toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Sektor Terkuat</span>
                        <p className="text-xs font-extrabold text-emerald-600 mt-2">
                          {analytics.strongestCategory}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Saran Area Kelemahan</span>
                        <p className="text-xs font-extrabold text-red-650 mt-2">
                          {analytics.weakestCategory}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total Sesi Tryout</span>
                        <p className="text-2xl font-black text-slate-800 mt-1 font-mono">
                          {attempts.length} Kali
                        </p>
                      </div>
                    </div>

                    {/* Target college prediction block */}
                    <div className="p-4 bg-blue-50 border border-blue-200/60 rounded-xl text-xs space-y-1">
                      <p className="font-extrabold text-[#0F4C81] flex items-center gap-1.5">
                        <i className="fa-solid fa-bullseye text-[#F58220]"></i> PREDIKSI MASUK & TARGET KELULUSAN KATA KITA:
                      </p>
                      <p className="text-slate-700 leading-relaxed font-sans">{analytics.prediction}</p>
                    </div>
                  </div>

                  {/* SWOT Matrix Analysis */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-display border-b border-slate-100 pb-2.5 flex items-center gap-2">
                      <i className="fa-solid fa-shapes text-[#F58220]"></i> Matriks SWOT Karakter Akademik Siswa
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      {/* S - STRENGTH */}
                      <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #115e59 100%)', borderColor: '#10b981' }} className="p-6 border-2 rounded-xl space-y-2.5 shadow-lg">
                        <span style={{ color: '#34d399' }} className="font-extrabold flex items-center gap-2 uppercase tracking-wider text-xs border-b border-emerald-400/20 pb-1.5">
                          <i className="fa-solid fa-gem text-emerald-300 text-sm"></i> S - STRENGTH (KEKUATAN UTAMA)
                        </span>
                        <p style={{ color: '#ffffff' }} className="leading-relaxed font-sans text-[11px] font-bold">
                          Fokus cerdas Anda luar biasa menonjol di area <strong style={{ color: '#a7f3d0' }} className="underline underline-offset-2">{analytics.strongestCategory}</strong>. Anda sanggup memecahkan pola penalaran rumit dengan kecermatan tinggi dan memiliki ketahanan integritas layar tryout yang sangat bersih ({analytics.totalViolations} pelanggaran terdeteksi).
                        </p>
                      </div>

                      {/* W - WEAKNESS */}
                      <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #881337 100%)', borderColor: '#f43f5e' }} className="p-6 border-2 rounded-xl space-y-2.5 shadow-lg">
                        <span style={{ color: '#fda4af' }} className="font-extrabold flex items-center gap-2 uppercase tracking-wider text-xs border-b border-rose-450/20 pb-1.5">
                          <i className="fa-solid fa-circle-down text-rose-300 text-sm"></i> W - WEAKNESS (KELEMAHAN AKADEMIS)
                        </span>
                        <p style={{ color: '#ffffff' }} className="leading-relaxed font-sans text-[11px] font-bold">
                          Sumbatan skor potensial terdeteksi pada area <strong style={{ color: '#fecdd3' }} className="underline underline-offset-2">{analytics.weakestCategory}</strong>. Hal ini umumnya dipicu oleh kebiasaan mengalokasikan durasi waktu yang tidak seimbang atau terburu-buru ketika dipaparkan pada wacana teks yang panjang.
                        </p>
                      </div>

                      {/* O - OPPORTUNITY */}
                      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)', borderColor: '#38bdf8' }} className="p-6 border-2 rounded-xl space-y-2.5 shadow-lg">
                        <span style={{ color: '#7dd3fc' }} className="font-extrabold flex items-center gap-2 uppercase tracking-wider text-xs border-b border-cyan-400/20 pb-1.5">
                          <i className="fa-solid fa-circle-right text-cyan-300 text-sm"></i> O - OPPORTUNITY (PELUANG SUKSES)
                        </span>
                        <p style={{ color: '#ffffff' }} className="leading-relaxed font-sans text-[11px] font-bold">
                          Seluruh sub-ujian kini memiliki rincian materi di tab 'Daftar Paket'. Mengulang simulasi terfokus ini secara terpisah diproyeksikan mampu mendongkrak skor rata-rata nasional Anda minimal sebesar <strong style={{ color: '#e0f2fe' }}>15% lebih tinggi</strong> pada evaluasi CBT berikutnya!
                        </p>
                      </div>

                      {/* T - THREAT */}
                      <div style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #78350f 100%)', borderColor: '#f97316' }} className="p-6 border-2 rounded-xl space-y-2.5 shadow-lg">
                        <span style={{ color: '#fdba74' }} className="font-extrabold flex items-center gap-2 uppercase tracking-wider text-xs border-b border-[#F58220]/20 pb-1.5">
                          <i className="fa-solid fa-triangle-exclamation text-amber-300 text-sm"></i> T - THREAT (ANCAMAN DISKUALIFIKASI)
                        </span>
                        <p style={{ color: '#ffffff' }} className="leading-relaxed font-sans text-[11px] font-bold">
                          Sistem pemberlakuan anti-curang sangat ketat (<strong style={{ color: '#ffedd5' }}>banned otomatis nilai 0% setelah 3 kali terdeteksi keluar tab ujian</strong>). Pastikan koneksi stabil dan matikan semua notifikasi browser agar fokus Anda tidak terpotong secara tidak sengaja!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ranking Leaderboard and Past Sessions splitting */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Riwayat attempts review */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-extrabold text-slate-800 font-display border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                        <i className="fa-solid fa-clock-rotate-left text-orange-500"></i> Riwayat Ujian / Tes Nasional Anda ({attempts.length})
                      </h3>

                      {attempts.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-xs font-sans">
                          <i className="fa-solid fa-list-ol text-3xl text-slate-300 block mb-2"></i>
                          Belum ada sesi ujian yang disubmit siswa. Silakan klik tab 'List Paket Ujian' untuk memulai tryout pertama.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {attempts.map(att => {
                            const pkg = packages.find(p => p.id === att.examId);
                            const isDisc = att.tabSwitchViolations >= 3;
                            return (
                              <div key={att.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">{att.id}</span>
                                  <span className="text-xs font-extrabold text-slate-800">
                                    {pkg?.name} {att.subExamName ? `(${att.subExamName})` : ""}
                                  </span>
                                  <p className="text-[10px] text-slate-400 mt-1">
                                    Selesai: {new Date(att.startTime).toLocaleString("id-ID")}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="text-right">
                                    <span className={`text-base font-black font-mono block ${isDisc ? "text-red-650" : "text-emerald-700"}`}>
                                      {isDisc ? "0.0" : (att.finalScore != null ? att.finalScore.toFixed(1) : "0.0")}%
                                    </span>
                                    <span className="text-[9px] text-slate-400 mt-0.5 block">
                                      {isDisc ? "Banned Curang" : `Benar ${att.correctCount || 0} Soal`}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => handleOpenReview(att)}
                                    className="bg-[#0F4C81] hover:bg-[#09355b] text-white text-[10px] font-bold py-2 px-3 rounded-lg border-b border-b-blue-900 shadow cursor-pointer transition-all active:scale-95"
                                  >
                                    Tinjau
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {attempts.length > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl space-y-3 font-sans">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 leading-none">
                                <i className="fa-solid fa-file-excel text-emerald-600"></i>
                                <span>Cadangkan Transkrip Nilai Anda</span>
                              </h4>
                              <p className="text-[10px] text-slate-500 mt-1">Simpan riwayat evaluasi & sertifikat Swot Anda ke dokumen Google Sheets pribadi.</p>
                            </div>

                            {studentGUser ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-white border border-emerald-150 px-2 py-0.5 rounded-full">
                                  {studentGUser.email}
                                </span>
                                <button
                                  type="button"
                                  onClick={handleStudentDisconnectSheets}
                                  className="text-[9px] text-slate-400 hover:text-red-500 underline font-bold cursor-pointer"
                                >
                                  Disconnect
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleStudentConnectSheets}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                              >
                                <img src="https://img.icons8.com/color/48/google-logo.png" className="w-3.5 h-3.5 shrink-0" alt="google" />
                                <span>Hubungkan Sheets</span>
                              </button>
                            )}
                          </div>

                          {studentGUser && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={studentIsSyncingSheets}
                                onClick={handleStudentExportToSheets}
                                className="bg-[#0F4C81] hover:bg-[#09355b] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-[10px] py-1.5 px-4 rounded-lg font-extrabold shadow transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                {studentIsSyncingSheets ? (
                                  <>
                                    <i className="fa-solid fa-spinner animate-spin"></i>
                                    <span>Mencadangkan...</span>
                                  </>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-cloud-arrow-up"></i>
                                    <span>Ekspor transkrip ke Google Sheets Sekarang</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {studentSheetsFeedback && (
                            <div className={`p-2.5 rounded-lg border text-[10px] flex items-center gap-1.5 ${
                              studentSheetsFeedback.type === "success" 
                                ? "bg-white border-emerald-300 text-emerald-800" 
                                : "bg-red-50 border-red-200 text-red-800"
                            }`}>
                              <i className={`fa-solid ${studentSheetsFeedback.type === "success" ? "fa-circle-check text-emerald-600" : "fa-circle-exclamation text-red-650"}`}></i>
                              <span className="flex-1 shrink-0 truncate">
                                {studentSheetsFeedback.message}
                              </span>
                              {studentSheetsFeedback.message.includes("https://") && (
                                <a 
                                  href={studentSheetsFeedback.message.match(/https:\/\/\S+/)?.[0]?.replace(/[).,]+$/, "")} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-blue-650 font-bold underline shrink-0 ml-1 font-sans"
                                >
                                  Buka Dokumen
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Top 3 National Challenger Leaderboard */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-extrabold text-slate-800 font-display border-b border-slate-100 pb-2.5 flex items-center gap-2">
                        <i className="fa-solid fa-trophy text-yellow-500"></i> Top 3 Rangking Nasional Bimbel
                      </h3>

                      <div className="space-y-3">
                        {(() => {
                          try {
                            const rawAllAttempts = JSON.parse(localStorage.getItem("KATA_KITA_ATTEMPTS") || "[]");
                            const rawUsers = JSON.parse(localStorage.getItem("KATA_KITA_USER_REGISTRY") || "[]");
                            
                            const studentBestScores: { [email: string]: { fullname: string, score: number, photo: string, sector: string } } = {};

                            rawAllAttempts.forEach((att: any) => {
                              // Only rank submitted trials
                              if (att.status !== "SUBMITTED") return;

                              const userObj = rawUsers.find((u: any) => u.email === att.userEmail);
                              const name = userObj ? userObj.fullname : (att.userEmail || "Siswa Nasional");
                              const photo = userObj && userObj.photoUrl ? userObj.photoUrl : "https://img.icons8.com/color/150/student-male--v1.png";
                              
                              let sector = "Evaluasi Sektor";
                              if (att.examId) {
                                const matchedPkg = packages.find(p => p.id === att.examId);
                                if (matchedPkg) sector = `${matchedPkg.category} Sektor`;
                              }
                              const valScore = att.finalScore || 0;
                              
                              if (att.userEmail) {
                                const prev = studentBestScores[att.userEmail];
                                if (!prev || valScore > prev.score) {
                                  studentBestScores[att.userEmail] = {
                                    fullname: name,
                                    score: valScore,
                                    photo: photo,
                                    sector: sector
                                  };
                                }
                              }
                            });

                            const items = Object.values(studentBestScores).sort((a, b) => b.score - a.score).slice(0, 3);
                            
                            if (items.length === 0) {
                              return (
                                <div className="text-center py-8 text-slate-400 text-xs font-sans">
                                  <i className="fa-solid fa-ranking-star text-3xl text-slate-200 block mb-2"></i>
                                  <span>Belum ada ranking nasional diraih saat ini. Jadilah yang pertama melaksanakan ujian dan rebut peringkat teratas!</span>
                                </div>
                              );
                            }

                            return items.map((itm, rIdx) => {
                              const rankColors = [
                                "from-yellow-50 to-amber-50 border-yellow-250",
                                "from-slate-50 to-gray-50 border-slate-200",
                                "from-orange-50 to-amber-100/40 border-amber-200/50"
                              ];
                              const numBadgeColors = [
                                "bg-yellow-400",
                                "bg-slate-400",
                                "bg-amber-600"
                              ];

                              const styleBg = rankColors[rIdx] || "bg-white border-slate-200";
                              const badgeBg = numBadgeColors[rIdx] || "bg-blue-600";

                              return (
                                <div key={rIdx} className={`flex items-center justify-between p-3 rounded-xl border ${styleBg}`}>
                                  <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm ${badgeBg}`}>
                                      {rIdx + 1}
                                    </span>
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-slate-200 shrink-0">
                                      <img src={itm.photo} alt={itm.fullname} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-800">{itm.fullname}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">{itm.sector}</p>
                                    </div>
                                  </div>
                                  <span className="text-xs font-black text-slate-800 font-mono">{itm.score.toFixed(1)}%</span>
                                </div>
                              );
                            });
                          } catch (e) {
                            return null;
                          }
                        })()}
                      </div>
                      <p className="text-[10px] text-center text-slate-400 mt-2">Daftar peringkat diperbarui secara nasional tiap akhir pekan.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "profil" && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-md space-y-6">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest font-display border-b border-slate-100 pb-3.5 flex items-center gap-2">
                <i className="fa-solid fa-user-pen text-[#0F4C81]"></i> Informasi Profil & Akun Siswa Mandiri
              </h3>

              {profileSuccess && (
                <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3.5 rounded-lg border border-emerald-250 flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-emerald-600"></i>
                  <span>Profil dan preferensi akun Anda berhasil diperbarui di server Bimbel Kata Kita!</span>
                </div>
              )}

              {profileError && (
                <div className="bg-red-50 text-red-700 text-xs font-bold p-3.5 rounded-lg border border-red-250 flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation text-red-550"></i>
                  <span>{profileError}</span>
                </div>
              )}

              <form className="space-y-5 text-slate-700 font-sans" onSubmit={handleUpdateProfileSubmit}>
                
                {/* Photo profile upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Foto Avatar Siswa
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-orange-400 flex items-center justify-center shrink-0">
                      {editPhoto ? (
                        <img src={editPhoto} alt="Review Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <i className="fa-solid fa-user-graduate text-3xl text-slate-400"></i>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 mt-1.5">Mendukung format PNG atau JPG, file di bawah 2MB.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-1.5">Nama Lengkap Siswa</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 text-xs"><i className="fa-solid fa-user"></i></span>
                    <input
                      type="text"
                      className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-1.5">Alamat Email Aktivitas</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 text-xs"><i className="fa-solid fa-envelope"></i></span>
                    <input
                      type="email"
                      className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-850 focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-1.5">Password / Kata Sandi Baru</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 text-xs"><i className="fa-solid fa-key"></i></span>
                    <input
                      type="password"
                      className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white font-bold text-xs py-3 px-8 rounded-lg border-b-2 border-b-slate-900 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-cloud-arrow-up text-xs"></i>
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Sticky Touch Bottom Navigation Menu Bar on Mobile Screen Sizes */}
        <nav className="sticky bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] px-2 py-1.5 flex justify-around items-center lg:hidden shrink-0">
          <button
            onClick={() => { setActiveTab("beranda"); loadDatabaseState(); setSelectedPkgForSubExams(null); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-full transition-all cursor-pointer ${
              activeTab === "beranda" ? "text-[#F58220] font-black" : "text-slate-400 hover:text-slate-650"
            }`}
          >
            <i className="fa-solid fa-house-laptop text-base"></i>
            <span className="text-[9px] font-bold tracking-tight">Beranda</span>
          </button>

          <button
            onClick={() => { setActiveTab("paket"); loadDatabaseState(); setSelectedPkgForSubExams(null); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-full transition-all cursor-pointer ${
              activeTab === "paket" ? "text-[#F58220] font-black" : "text-slate-400 hover:text-slate-650"
            }`}
          >
            <i className="fa-solid fa-graduation-cap text-base"></i>
            <span className="text-[9px] font-bold tracking-tight">Paket</span>
          </button>

          <button
            onClick={() => { setActiveTab("analisa"); loadDatabaseState(); setSelectedPkgForSubExams(null); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-full transition-all cursor-pointer ${
              activeTab === "analisa" ? "text-[#F58220] font-black" : "text-slate-400 hover:text-slate-650"
            }`}
          >
            <i className="fa-solid fa-chart-line text-base"></i>
            <span className="text-[9px] font-bold tracking-tight">Analisa</span>
          </button>

          <button
            onClick={() => { setActiveTab("profil"); loadDatabaseState(); setSelectedPkgForSubExams(null); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-full transition-all cursor-pointer ${
              activeTab === "profil" ? "text-[#F58220] font-black" : "text-slate-400 hover:text-slate-650"
            }`}
          >
            <i className="fa-solid fa-id-card text-base"></i>
            <span className="text-[9px] font-bold tracking-tight">Profil</span>
          </button>
        </nav>

      </div>

      {/* Riku Past Attempt detailed review display modal block */}
      {reviewingAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
            
            <div className="bg-[#0F4C81] text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[9px] font-bold bg-[#F58220] px-2.5 py-1 rounded-full uppercase tracking-wider">Review Hasil Tryout</span>
                <h3 className="text-base font-bold font-display mt-2">
                  {packages.find(p => p.id === reviewingAttempt.examId)?.name}
                </h3>
              </div>
              <button 
                onClick={handleCloseReview}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold cursor-pointer transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="bg-slate-100 p-4 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center shrink-0">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Skor Akhir</p>
                <p className="text-lg font-black text-[#0F4C81] font-mono mt-0.5">
                  {reviewingAttempt.finalScore != null ? reviewingAttempt.finalScore.toFixed(1) : "0.0"}%
                </p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Benar</p>
                <p className="text-lg font-black text-emerald-600 font-mono mt-0.5">
                  {reviewingAttempt.correctCount || 0} Soal
                </p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Salah / Kosong</p>
                <p className="text-lg font-black text-red-500 font-mono mt-0.5">
                  {((reviewingAttempt.incorrectCount || 0) + (reviewingAttempt.emptyCount || 0))} Soal
                </p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Integritas CBT</p>
                <p className="text-xs font-bold text-slate-800 mt-2">
                  {reviewingAttempt.tabSwitchViolations >= 3 ? "Keluar Terdeteksi 3+ (Banned)" : "Sikap Jujur Lolos"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Rincian Pembahasan Terpadu Tiap Soal</h4>
              
              {questions.filter(q => {
                const belongsToPkg = q.examId === reviewingAttempt.examId;
                const matchesSubExam = !reviewingAttempt.subExamName || q.subExamName === reviewingAttempt.subExamName;
                return belongsToPkg && matchesSubExam && q.isPublished !== false;
              }).map((q, qidx) => {
                const ansObj = reviewingAttempt.answers[q.id];
                const studentAns = ansObj ? ansObj.answer : "";
                const isCorrect = studentAns === q.correctOption;

                return (
                  <div key={q.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    
                    <div className="flex justify-between items-center bg-slate-100/50 p-2.5 rounded text-xs border border-slate-200">
                      <span className="font-extrabold text-slate-750">SOAL BUTIR NO. {qidx + 1}</span>
                      <span className="text-[10px] font-mono text-slate-450 uppercase font-bold tracking-wide">Sub-Ujian: {q.subExamName}</span>
                    </div>

                    {/* Question text */}
                    <p className="text-xs text-slate-800 font-semibold whitespace-pre-wrap leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* Question image */}
                    {q.questionImage && (
                      <div className="max-w-md bg-slate-100 p-2 rounded border border-slate-200">
                        <img 
                          src={q.questionImage} 
                          alt="Soal Lampiran" 
                          className="max-h-56 w-auto object-contain rounded"
                        />
                      </div>
                    )}

                    {/* Option outcomes */}
                    <div className="grid grid-cols-1 gap-2 mt-3">
                      {(Object.keys(q.options) as Array<"A" | "B" | "C" | "D" | "E">).map((opt) => {
                        const isStudentTarget = studentAns === opt;
                        const isCorrectTarget = q.correctOption === opt;
                        
                        let cardBg = "bg-white border-slate-200 text-slate-700";
                        if (isCorrectTarget) {
                          cardBg = "bg-emerald-50 border-emerald-400 text-emerald-850 font-bold";
                        } else if (isStudentTarget && !isCorrect) {
                          cardBg = "bg-red-50 border-red-300 text-red-850 font-semibold";
                        }

                        return (
                          <div key={opt} className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${cardBg}`}>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-xs">{opt}.</span>
                              <span>{q.options[opt]}</span>
                            </div>

                            <div className="shrink-0 flex items-center gap-1.5 font-bold text-[9px] uppercase">
                              {isCorrectTarget && <span className="text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded shadow-sm">Kunci Benar</span>}
                              {isStudentTarget && <span className="text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded shadow-sm">Pilihan Anda</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div style={{ backgroundColor: '#0f172a', color: '#ffffff', borderLeftColor: 'var(--color-accent, #F58220)' }} className="p-5 rounded-xl text-xs space-y-1.5 border-l-4 shadow-md">
                      <p style={{ color: 'var(--color-accent, #F58220)' }} className="font-black tracking-widest uppercase text-[10px]">PEMBAHASAN RESMI KATA KITA:</p>
                      <p style={{ color: '#f8fafc' }} className="leading-relaxed whitespace-pre-wrap font-semibold text-xs">{q.explanation || "Pembahasan standard nasional."}</p>
                    </div>

                  </div>
                );
              })}
            </div>

            <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={handleCloseReview}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-lg border-b-2 border-b-black transition-all cursor-pointer"
              >
                Selesai Belajar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
