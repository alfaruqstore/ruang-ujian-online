import { ExamPackage, Question } from "../types";

export const DEFAULT_PACKAGES: ExamPackage[] = [
  {
    id: "EXM-UTBK",
    name: "Tryout Nasional UTBK SNBT - Sektor TPS & Literasi",
    category: "UTBK SNBT",
    description: "Evaluasi kesiapan UTBK SNBT dengan materi Penalaran Umum, Kuantitatif, Bacaan Menulis, dan Literasi Bahasa Indonesia/Inggris.",
    totalDurationMinutes: 195,
    totalQuestions: 160,
    isPremium: false,
    subExams: [
      { name: "TPS - Penalaran Umum", durationMinutes: 30, questionCount: 30 },
      { name: "TPS - Pengetahuan & Pemahaman Umum", durationMinutes: 25, questionCount: 20 },
      { name: "TPS - Memahami Bacaan & Menulis", durationMinutes: 25, questionCount: 20 },
      { name: "TPS - Pengetahuan Kuantitatif", durationMinutes: 20, questionCount: 20 },
      { name: "Literasi - Bahasa Indonesia", durationMinutes: 45, questionCount: 30 },
      { name: "Literasi - Bahasa Inggris", durationMinutes: 30, questionCount: 20 },
      { name: "Penalaran Matematika", durationMinutes: 20, questionCount: 20 }
    ]
  },
  {
    id: "EXM-KEDINASAN",
    name: "Tryout Akbar Seleksi Sekolah Kedinasan (STAN, STIS, IPDN)",
    category: "KEDINASAN",
    description: "Persiapan lengkap tes sekolah kedinasan yang meliputi TWK, TIU, TKP, serta Matematika/Bahasa Inggris spesifik.",
    totalDurationMinutes: 100,
    totalQuestions: 110,
    isPremium: true,
    subExams: [
      { name: "Seleksi Kompetensi Dasar - TWK", durationMinutes: 30, questionCount: 30 },
      { name: "Seleksi Kompetensi Dasar - TIU", durationMinutes: 30, questionCount: 35 },
      { name: "Seleksi Kompetensi Dasar - TKP", durationMinutes: 40, questionCount: 45 }
    ]
  },
  {
    id: "EXM-CPNS",
    name: "Tes Seleksi Kompetensi Dasar (SKD) Calon Pegawai Negeri Sipil",
    category: "CPNS",
    description: "Kurikulum SKD Nasional terdaftar resmi untuk materi Tes Wawasan Kebangsaan, Tes Inteligensia Umum, dan Tes Karakteristik Pribadi.",
    totalDurationMinutes: 100,
    totalQuestions: 110,
    isPremium: false,
    subExams: [
      { name: "Wawasan Kebangsaan (TWK)", durationMinutes: 30, questionCount: 30 },
      { name: "Inteligensia Umum (TIU)", durationMinutes: 30, questionCount: 35 },
      { name: "Karakteristik Pribadi (TKP)", durationMinutes: 40, questionCount: 45 }
    ]
  },
  {
    id: "EXM-TNIPOLRI",
    name: "Tryout Kompetensi Akademik & Psikotes TNI-POLRI",
    category: "TNI-POLRI",
    description: "Evaluasi akademik penerimaan Taruna/Siswa Bintara/Tamtama untuk menyongsong karir di institusi TNI & POLRI.",
    totalDurationMinutes: 90,
    totalQuestions: 100,
    isPremium: true,
    subExams: [
      { name: "Pengetahuan Umum & Undang-Undang", durationMinutes: 30, questionCount: 30 },
      { name: "Tes Kecermatan & Angka Hilang", durationMinutes: 30, questionCount: 40 },
      { name: "Kemampuan Akademik Dasar", durationMinutes: 30, questionCount: 30 }
    ]
  },
  {
    id: "EXM-BUMN",
    name: "Tryout Tes Kemampuan Dasar (TKD) & AKHLAK Core BUMN",
    category: "BUMN",
    description: "Ujian rekrutmen berskala nasional untuk BUMN dengan penilaian core values AKHLAK serta verbal-numerik.",
    totalDurationMinutes: 90,
    totalQuestions: 100,
    isPremium: true,
    subExams: [
      { name: "Verbal & Numerik Reasoning", durationMinutes: 40, questionCount: 50 },
      { name: "Core Values AKHLAK", durationMinutes: 30, questionCount: 30 },
      { name: "English Proficiency test", durationMinutes: 20, questionCount: 20 }
    ]
  },
  {
    id: "EXM-PPPK",
    name: "Tryout ASN Pegawai Pemerintah dengan Perjanjian Kerja",
    category: "PPPK",
    description: "Evaluasi seleksi PPPK untuk Guru maupun Non-Guru dengan tes manajerial, sosiokultural, wawancara, dan kompetensi teknis.",
    totalDurationMinutes: 130,
    totalQuestions: 145,
    isPremium: false,
    subExams: [
      { name: "Kompetensi Manajerial", durationMinutes: 40, questionCount: 25 },
      { name: "Kompetensi Sosiokultural", durationMinutes: 40, questionCount: 20 },
      { name: "Wawancara Terstruktur (Integritas)", durationMinutes: 10, questionCount: 10 },
      { name: "Kompetensi Teknis Spesialis", durationMinutes: 40, questionCount: 90 }
    ]
  },
  {
    id: "EXM-PSIKOTES",
    name: "Tryout Psikotes & Potensi Akademik HRD Seleksi Kerja",
    category: "PSIKOTES",
    description: "Latihan tes psikologis, spasial, kepribadian, pencocokan gambar, deret angka, dan penalaran logika untuk lamaran kerja.",
    totalDurationMinutes: 75,
    totalQuestions: 90,
    isPremium: false,
    subExams: [
      { name: "Spasial & Kemampuan Deret Angka", durationMinutes: 35, questionCount: 45 },
      { name: "Tes Penalaran Logis & Verbal", durationMinutes: 40, questionCount: 45 }
    ]
  },
  {
    id: "EXM-TKA",
    name: "Tes Kemampuan Akademik (TKA) Soshum / Saintek",
    category: "TKA",
    description: "Materi spesifik rumpun sains-teknologi (Fisika, Kimia, Biologi) atau sosial-humaniora (Sejarah, Geografi, Sosiologi, Ekonomi).",
    totalDurationMinutes: 120,
    totalQuestions: 80,
    isPremium: true,
    subExams: [
      { name: "Kemampuan Soshum Terpadu", durationMinutes: 60, questionCount: 40 },
      { name: "Kemampuan Saintek Terpadu", durationMinutes: 60, questionCount: 40 }
    ]
  },
  {
    id: "EXM-BING",
    name: "Asesmen Kompetensi TOEFL / IELTS / English Proficiency",
    category: "BAHASA INGGRIS",
    description: "Pemeriksaan tingkat kefasihan bahasa Inggris melalui struktur Grammar, Listening Comprehension, dan Reading Analysis.",
    totalDurationMinutes: 110,
    totalQuestions: 120,
    isPremium: false,
    subExams: [
      { name: "Structure & Written Expression", durationMinutes: 40, questionCount: 40 },
      { name: "Reading Comprehension Analysis", durationMinutes: 70, questionCount: 80 }
    ]
  },
  {
    id: "EXM-MAT",
    name: "Evaluasi Penguasaan Matematika Dasar & Logika Kuantitatif",
    category: "MATEMATIKA",
    description: "Pondasi pokok penalaran kuantitatif, kalkulus dasar, aljabar, statistik dasar, geometri, dan logika deduktif.",
    totalDurationMinutes: 90,
    totalQuestions: 50,
    isPremium: false,
    subExams: [
      { name: "Matematika Dasar & Aljabar", durationMinutes: 45, questionCount: 25 },
      { name: "Analisis Data & Probabilitas", durationMinutes: 45, questionCount: 25 }
    ]
  },
  {
    id: "EXM-AN",
    name: "Tryout Test Asesmen Nasional (AN) Lengkap",
    category: "TEST ASESMEN NASIONAL (AN)",
    description: "Evaluasi sistemik mutu sekolah melalui Asesmen Kompetensi Minimum (AKM) Literasi, Numerasi, dan Survei Karakter.",
    totalDurationMinutes: 120,
    totalQuestions: 72,
    isPremium: false,
    subExams: [
      { name: "Asesmen Kompetensi Literasi", durationMinutes: 60, questionCount: 36 },
      { name: "Asesmen Kompetensi Numerasi", durationMinutes: 60, questionCount: 36 }
    ]
  },
  {
    id: "EXM-LAINNYA",
    name: "Tryout Ujian Saringan Masuk Lainnya",
    category: "TEST/UJIAN LAINNYA",
    description: "Latihan tryout untuk berbagai jenis tes eksternal, ujian penyesuaian ijazah, sertifikasi, kompetensi umum, atau tes mandiri lainnya.",
    totalDurationMinutes: 90,
    totalQuestions: 50,
    isPremium: true,
    subExams: [
      { name: "Tes Kompetensi dan Skolastik Umum", durationMinutes: 45, questionCount: 25 },
      { name: "Tes Kemampuan Akademik Khusus", durationMinutes: 45, questionCount: 25 }
    ]
  }
];

export const INITIAL_QUESTIONS: Question[] = [];
