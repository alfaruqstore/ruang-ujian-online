/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Clock, ShieldAlert, AlertTriangle, ArrowLeft, ArrowRight, HelpCircle, CheckSquare, Save 
} from "lucide-react";
import { ExamPackage, Question, StudentAnswers } from "../types";

interface ExamEngineProps {
  pkg: ExamPackage;
  subExamName?: string | null;
  questions: Question[];
  onCancel: () => void;
  onSubmit: (answers: StudentAnswers, tabSwitchViolations: number) => void;
}

export default function ExamEngine({ pkg, subExamName, questions, onCancel, onSubmit }: ExamEngineProps) {
  // Select only active/published questions belonging to this package and/or sub-exam
  const examQuestions = subExamName
    ? questions.filter(q => q.examId === pkg.id && q.subExamName === subExamName && q.isPublished !== false)
    : questions.filter(q => q.examId === pkg.id && q.isPublished !== false);

  const totalQuestionsList = examQuestions.length > 0 ? examQuestions : [
    {
      id: "MOCK-Q-1",
      examId: pkg.id,
      subExamName: subExamName || pkg.subExams[0]?.name || "Umum",
      questionText: `Ini adalah soal simulasi default untuk paket: ${pkg.name}.\nTuliskan jawaban penyesuaian Anda pada bank soal Admin.`,
      options: {
        A: "Pilihan Jawaban A",
        B: "Pilihan Jawaban B",
        C: "Pilihan Jawaban C",
        D: "Pilihan Jawaban D",
        E: "Pilihan Jawaban E"
      },
      correctOption: "A" as const,
      explanation: "Pembahasan simulasi."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQ = totalQuestionsList[currentIndex];

  // Initialize empty answers state
  const [answers, setAnswers] = useState<StudentAnswers>(() => {
    const init: StudentAnswers = {};
    totalQuestionsList.forEach(q => {
      init[q.id] = { answer: "", isFlagged: false };
    });
    return init;
  });

  // Calculate duration correctly based on active sub-test
  const subConfig = subExamName ? pkg.subExams.find(s => s.name === subExamName) : null;
  const durationMinutes = subConfig ? subConfig.durationMinutes : pkg.totalDurationMinutes;

  // Countdown timer: minutes to seconds
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Anti-cheat tab switcher state
  const [tabSwitchViolations, setTabSwitchViolations] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [wasDisqualified, setWasDisqualified] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [showMobileMatrix, setShowMobileMatrix] = useState(false);

  // Time formatting helper
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 1. Timer reduction countdown effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      handleForceSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 2. Anti-cheat visibility listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !wasDisqualified) {
        setTabSwitchViolations((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            setWasDisqualified(true);
            setShowWarningModal(false);
            // Submit immediately with disqualification!
            alert("SISTEM INTEGRITAS: Anda didiskualifikasi karena keluar tab sebanyak 3 kali!");
            onSubmit(answers, next);
          } else {
            setShowWarningModal(true);
          }
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [answers, wasDisqualified]);

  // Answer handler
  const selectOption = (option: "A" | "B" | "C" | "D" | "E") => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        answer: option
      }
    }));
  };

  // Toggle Ragu-Ragu flag
  const toggleFlag = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        isFlagged: !prev[currentQ.id]?.isFlagged
      }
    }));
  };

  // Standard submit button trigger
  const handleManualSubmitTransition = () => {
    setShowSubmitConfirmModal(true);
  };

  // Forced submission (Timeout or disqualification)
  const handleForceSubmit = () => {
    onSubmit(answers, tabSwitchViolations);
  };

  // CSS classes for question numbers mapping
  const getGridButtonBg = (qId: string, idx: number) => {
    const ans = answers[qId];
    const isCurrent = idx === currentIndex;
    
    let base = "border border-slate-250 font-bold transition-all text-sm h-10 w-10 sm:h-11 sm:w-11 rounded-lg flex items-center justify-center cursor-pointer ";
    
    if (isCurrent) {
      base += "ring-4 ring-[#0F4C81] scale-105 shadow-md ";
    }

    if (ans?.isFlagged) {
      return base + "bg-[#F58220] hover:bg-[#e07116] text-white";
    } else if (ans?.answer) {
      return base + "bg-[#2ECC71] hover:bg-emerald-600 text-white";
    } else {
      return base + "bg-white hover:bg-slate-50 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      
      {/* EXAM PORTAL TOP NAVIGATION HEADERBAR */}
      <header className="bg-[#0F4C81] text-white shadow-md border-b-2 border-b-[#F58220] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono uppercase tracking-wider hidden sm:block">
              {subExamName ? "SUB-UJIAN STANDAR" : "STANDAR NASIONAL"}
            </span>
            <span className="font-bold text-xs sm:text-sm truncate max-w-[180px] sm:max-w-md font-display">
              {pkg.name} {subExamName ? `— ${subExamName}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm("Batalkan ujian? Jawaban Anda saat ini tidak akan terekam ke dalam database rekapitulasi!")) {
                  onCancel();
                }
              }}
              className="bg-red-800 hover:bg-red-950 text-white font-bold text-[10px] sm:text-xs px-2.5 py-1.5 rounded transition-all cursor-pointer"
            >
              Batalkan
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE STICKY TRACKER AND QUICK SWAP (Only visible on screens < lg) */}
      <div className="lg:hidden sticky top-16 z-30 bg-slate-800 text-white shadow-md border-b border-slate-700 px-4 py-2.5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <Clock className={`w-4 h-4 shrink-0 ${timeLeft < 300 ? "text-rose-400 animate-pulse" : "text-[#F58220]"}`} />
          <span className="text-xs sm:text-sm font-extrabold font-mono tracking-tight text-white">
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="text-center font-extrabold text-[10px] sm:text-xs font-sans truncate px-1 max-w-[120px] sm:max-w-xs text-slate-300">
          SOAL {currentIndex + 1} / {totalQuestionsList.length}
        </div>

        <button
          type="button"
          onClick={() => setShowMobileMatrix(!showMobileMatrix)}
          className="bg-[#F58220] hover:bg-[#e07116] active:bg-orange-700 text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-xs cursor-pointer select-none shrink-0"
        >
          <i className="fa-solid fa-list-ol text-[10px]"></i>
          <span>{showMobileMatrix ? "Tutup Peta" : "Pilih Nomor"}</span>
          <i className={`fa-solid ${showMobileMatrix ? "fa-chevron-up" : "fa-chevron-down"} text-[9px] ml-0.5`}></i>
        </button>
      </div>

      {showMobileMatrix && (
        <div className="lg:hidden sticky top-[108px] z-30 bg-white border-b border-slate-200 shadow-lg p-4 animate-scale-up max-h-[50vh] overflow-y-auto">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">Pilih Nomor Soal</span>
              <span className="text-[10px] text-slate-405">Total {totalQuestionsList.length} Soal</span>
            </div>
            
            <div className="grid grid-cols-5 gap-2 pt-1">
              {totalQuestionsList.map((q, idx) => (
                <button
                  type="button"
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowMobileMatrix(false);
                  }}
                  className={getGridButtonBg(q.id, idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Colors legend */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-[10px] font-bold text-slate-500">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 font-sans">
                  <div className="h-3 w-3 bg-[#2ECC71] rounded border"></div>
                  <span>Sudah Diisi</span>
                </div>
                <div className="flex items-center gap-1.5 font-sans">
                  <div className="h-3 w-3 bg-[#F58220] rounded border"></div>
                  <span>Ragu-Ragu</span>
                </div>
                <div className="flex items-center gap-1.5 font-sans col-span-2">
                  <div className="h-3 w-3 bg-white rounded border border-slate-350"></div>
                  <span>Belum Dijawab (Slate)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORE SPLIT-SCREEN EXAM ENGINE */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* LEFT COMPONENT (70% WIDTH): QUESTION DISPLAY PANELS */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Header identifying the Sub-Test Sektor */}
          <div className="bg-slate-800 text-white text-[10px] sm:text-xs px-4 py-3 rounded-xl border border-slate-700 flex justify-between items-center shadow-inner font-mono">
            <span>SEKTOR UJIAN AKTIF: <strong className="text-[#F58220] uppercase font-bold">{currentQ.subExamName}</strong></span>
            <span>Butir Soal Ke: <strong className="text-white text-sm">{currentIndex + 1}</strong> dari {totalQuestionsList.length}</span>
          </div>

          {/* Core content paper Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-8 min-h-[300px] sm:min-h-[400px] flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Question Text paragraph */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-inner">
                <p className="text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                  {currentQ.questionText}
                </p>
              </div>

              {/* Attached local/remote images (if any) */}
              {currentQ.questionImage && (
                <div className="bg-slate-50 border border-slate-250 p-3 rounded-xl max-w-lg shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Gbr Lampiran Pertanyaan:</span>
                  <img 
                    src={currentQ.questionImage} 
                    alt="Lampiran Soal" 
                    className="max-h-64 w-auto object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Pilihan Ganda (Choice Panels) A to E */}
              <div className="space-y-3 pt-2">
                {(Object.keys(currentQ.options) as Array<"A" | "B" | "C" | "D" | "E">).map((option) => {
                  const isChecked = answers[currentQ.id]?.answer === option;
                  const optImg = currentQ.optionImages ? currentQ.optionImages[option] : undefined;

                  return (
                    <button
                      key={option}
                      onClick={() => selectOption(option)}
                      className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none ${
                        isChecked 
                          ? "bg-[#0F4C81]/10 border-[#0F4C81] shadow-sm text-slate-900 animate-none" 
                          : "bg-white border-slate-250 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold font-mono text-xs ${
                          isChecked ? "bg-[#0F4C81] text-white" : "bg-slate-100 text-slate-700"
                        }`}>
                          {option}
                        </span>
                        <span className="text-xs font-semibold leading-relaxed pt-0.5 sm:pt-0">{currentQ.options[option]}</span>
                      </div>

                      {/* Display attachment on the specific options A-E */}
                      {optImg && (
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-200 mt-2 md:mt-0 max-w-[120px] shrink-0 self-center">
                          <img src={optImg} alt={`Lampiran ${option}`} className="max-h-12 w-auto object-contain rounded" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Bottom control parameters bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-100">
              
              {/* Back Button */}
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:pointer-events-none px-4 py-3 sm:py-2.5 rounded-lg border border-slate-350 text-xs font-bold font-mono cursor-pointer select-none"
              >
                <ArrowLeft className="w-4 h-4" /> SOAL SEBELUMNYA
              </button>

              {/* Ragu-ragu Checkbox flag toggle (Middle button) */}
              <button
                type="button"
                onClick={toggleFlag}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-lg text-xs font-bold cursor-pointer select-none border-b-2 ${
                  answers[currentQ.id]?.isFlagged
                    ? "bg-[#F58220] hover:bg-[#e07116] text-white border-b-amber-900 shadow-md"
                    : "bg-amber-100 hover:bg-amber-200 text-[#F58220] border-b-amber-300"
                }`}
              >
                <CheckSquare className="w-4 h-4" /> RAGU-RAGU (KUNING)
              </button>

              {/* Next or Finish button */}
              {currentIndex < totalQuestionsList.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="w-full sm:w-auto bg-[#0F4C81] hover:bg-[#0c3e6a] text-white px-5 py-3 sm:py-2.5 rounded-lg border-b-2 border-b-blue-900 text-xs font-bold font-mono cursor-pointer select-none inline-flex items-center justify-center gap-1"
                >
                  SOAL SELANJUTNYA <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleManualSubmitTransition}
                  className="w-full sm:w-auto bg-[#2ECC71] hover:bg-emerald-600 text-white px-6 py-3 sm:py-2.5 rounded-lg border-b-2 border-b-emerald-800 text-xs font-bold cursor-pointer select-none inline-flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> SELESAI & SUBMIT
                </button>
              )}

            </div>
          </div>
        </section>


        {/* RIGHT COMPONENT (30% WIDTH): SECTORS, COUNTDOWN TIMER & QUESTION MATRIX PANEL (Hidden on Mobile) */}
        <section className="hidden lg:block lg:col-span-4 space-y-6 lg:sticky lg:top-22">
          
          {/* Countdown timer ticker card */}
          <div className={`p-4 rounded-xl border shadow-sm text-center ${
            timeLeft < 300 
              ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse" 
              : "bg-white border-slate-200 text-slate-800"
          }`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Countdown Sisa Waktu</span>
            <div className="flex justify-center items-center gap-2 mt-1">
              <Clock className={`w-5 h-5 ${timeLeft < 300 ? "text-rose-600" : "text-[#0F4C81]"}`} />
              <span className="text-2xl font-black font-mono tracking-tight">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Matrix of grid question numbers */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide font-display block">Navigasi Nomor Soal</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Warna melambangkan status pengisian jawaban tryout.</p>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 pt-2">
              {totalQuestionsList.map((q, idx) => (
                <button
                  type="button"
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={getGridButtonBg(q.id, idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Colors legend */}
            <div className="border-t border-slate-100 pt-3.5 space-y-2 text-[10px] font-bold text-slate-500">
              <span className="uppercase text-[9px] text-slate-400 block tracking-widest">Keterangan Status</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 font-sans">
                  <div className="h-3 w-3 bg-[#2ECC71] rounded border"></div>
                  <span>Sudah Diisi</span>
                </div>
                <div className="flex items-center gap-1.5 font-sans">
                  <div className="h-3 w-3 bg-[#F58220] rounded border"></div>
                  <span>Ragu-Ragu</span>
                </div>
                <div className="flex items-center gap-1.5 font-sans col-span-2">
                  <div className="h-3 w-3 bg-white rounded border border-slate-350"></div>
                  <span>Belum Dijawab (Slate)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live system monitoring card */}
          <div className="bg-slate-900 text-white p-4 rounded-xl text-[10px] space-y-2">
            <div className="flex items-center gap-1 bg-[#F58220]/20 text-[#fca34d] px-2 py-1 rounded w-fit border border-[#F58220]/30 font-bold">
              <ShieldAlert className="w-3.5 h-3.5" /> PENGAWASAN AKTIF (AI ANTI-CHEAT)
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">
              Lembar ujian Anda dipantau oleh pengawas otomatis Bimbel Kata Kita. Anda tidak diizinkan berganti tab browser atau me-minimize jendela.
            </p>
            <div className="flex justify-between border-t border-slate-800 pt-2 font-mono text-slate-400">
              <span>Kejadian keluar tab:</span>
              <span className={`font-bold ${tabSwitchViolations > 0 ? "text-red-400" : "text-green-400"}`}>{tabSwitchViolations} / 3 Pelanggaran</span>
            </div>
          </div>

        </section>

      </main>

      {/* WARNING POPUP MODAL (ANTI-TAB SWITCHING INTERRUPT DETECTOR COREGUARD) */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-sm w-full border border-red-200 text-center space-y-4">
            <div className="w-14 h-14 bg-red-150 animate-bounce flex items-center justify-center text-red-650 rounded-full mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 font-display">
              DETEKSI TINDAKAN KECURANGAN!
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed leading-relaxed font-sans">
              Sistem mendeteksi Anda baru saja meninggalkan tab pengerjaan ujian. 
            </p>

            <div className="bg-red-50 text-red-800 border border-red-200 text-xs font-bold py-2 px-3 rounded-xl max-w-xs mx-auto">
              Pelanggaran Anda: {tabSwitchViolations} dari 3
            </div>

            <p className="text-[10px] text-slate-400 font-sans leading-relaxed leading-relaxed">
              Jika melanggar <strong className="text-slate-800">3 kali</strong>, sistem secara paksa akan mendiskualifikasi nilai tryout Anda secara otomatis dan segera keluar dari portal. Harap fokus pada layar ujian Anda!
            </p>

            <button
              onClick={() => setShowWarningModal(false)}
              className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white font-bold text-xs py-2.5 px-6 rounded-lg transition-all cursor-pointer"
            >
              Saya Mengerti & Lanjutkan Ujian
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION SUBMIT DIALOG MODAL (OK vs NO) */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fade-in text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-200">
              <i className="fa-solid fa-circle-question text-2xl"></i>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-display">
                Konfirmasi Akhiri Sub-Ujian
              </h3>
              <p className="text-[11.5px] text-slate-500 leading-relaxed font-sans mt-1">
                Apakah Anda yakin menyelesaikan sub menu ujian ini? Setelah disubmit, respons lembar jawaban Anda akan langsung tersimpan dan terkunci secara otomatis.
              </p>
            </div>

            {/* Live Stats Table */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 grid grid-cols-3 divide-x divide-slate-200 font-sans">
              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase">Terjawab</span>
                <span className="text-sm font-black text-slate-800">
                  {Object.values(answers).filter((a: any) => a.answer !== "").length} / {totalQuestionsList.length}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase">Belum Diisi</span>
                <span className={`text-sm font-black ${
                  (totalQuestionsList.length - Object.values(answers).filter((a: any) => a.answer !== "").length) > 0 
                    ? "text-rose-600 font-extrabold" 
                    : "text-slate-800"
                }`}>
                  {totalQuestionsList.length - Object.values(answers).filter((a: any) => a.answer !== "").length}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase">Ragu-Ragu</span>
                <span className={`text-sm font-black ${
                  Object.values(answers).filter((a: any) => a.isFlagged).length > 0 
                    ? "text-amber-500 font-extrabold" 
                    : "text-slate-800"
                }`}>
                  {Object.values(answers).filter((a: any) => a.isFlagged).length}
                </span>
              </div>
            </div>

            {/* Confirm buttons: OK & NO as requested */}
            <div className="flex justify-center items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                NO (Kembali Ke Soal)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitConfirmModal(false);
                  onSubmit(answers, tabSwitchViolations);
                }}
                className="px-6 py-2.5 bg-[#0F4C81] hover:bg-[#0c3e6a] text-white text-xs font-black rounded-lg shadow-md transition-colors cursor-pointer"
              >
                OK (Ya, Selesaikan)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
