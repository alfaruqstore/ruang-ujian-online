/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ExamCategory = string;

export interface SubExamConfig {
  name: string;
  durationMinutes: number;
  questionCount: number;
}

export interface ExamPackage {
  id: string; // EXM-XXXX
  name: string; // e.g. "Tryout Akbar UTBK SNBT Paket A"
  category: ExamCategory;
  description: string;
  totalDurationMinutes: number;
  totalQuestions: number;
  subExams: SubExamConfig[];
  isPremium?: boolean;
}

export interface Question {
  id: string; // QST-XXXX
  examId: string;
  subExamName: string; // To which subtopic / sub-exam it belongs
  questionText: string;
  questionImage?: string; // Optional image URL or base64
  questionImagePosition?: "above" | "below"; // Position of question image
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  optionImages?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
    E?: string;
  };
  optionImagePositions?: {
    A?: "above" | "below";
    B?: "above" | "below";
    C?: "above" | "below";
    D?: "above" | "below";
    E?: "above" | "below";
  };
  correctOption: "A" | "B" | "C" | "D" | "E";
  explanation?: string;
  isPublished?: boolean; // True/False status for publisher
}

export interface StudentAnswers {
  [questionId: string]: {
    answer: "A" | "B" | "C" | "D" | "E" | "";
    isFlagged: boolean; // Ragu-ragu indicator
  };
}

export interface StudentAttempt {
  id: string; // ATT-XXXX
  userId: string;
  examId: string;
  subExamName?: string; // Optional: specific sub-exam if taken individually
  startTime: string; // ISO
  endTime?: string; // ISO
  status: "ON_PROGRESS" | "SUBMITTED";
  answers: StudentAnswers;
  tabSwitchViolations: number;
  finalScore?: number; // Total correct count or custom percentage
  correctCount?: number;
  incorrectCount?: number;
  emptyCount?: number;
}

export interface User {
  id: string;
  email: string;
  fullname: string;
  role: "admin" | "student";
  categoryInterest?: ExamCategory;
  password?: string;
  photoUrl?: string; // base64 string or custom link
}

export interface AppTheme {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
}

export const APP_THEMES: AppTheme[] = [
  {
    id: "ocean",
    name: "Classic Blue-Orange",
    primaryColor: "#0F4C81",
    accentColor: "#F58220",
    bgGradient: "from-[#0F4C81] to-slate-800"
  },
  {
    id: "violet",
    name: "Royal Violet-Magenta",
    primaryColor: "#5B21B6",
    accentColor: "#EC4899",
    bgGradient: "from-[#5B21B6] to-pink-900"
  },
  {
    id: "emerald",
    name: "Emerald Forest-Amber",
    primaryColor: "#0F766E",
    accentColor: "#D97706",
    bgGradient: "from-[#0F766E] to-[#115E59]"
  },
  {
    id: "midnight",
    name: "Midnight Slate-Rose",
    primaryColor: "#1E293B",
    accentColor: "#E11D48",
    bgGradient: "from-[#1E293B] to-[#0F172A]"
  },
  {
    id: "crimson",
    name: "Crimson Sun-Gold",
    primaryColor: "#991B1B",
    accentColor: "#F59E0B",
    bgGradient: "from-[#991B1B] to-[#7F1D1D]"
  }
];
