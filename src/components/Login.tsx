/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User as UserType } from "../types";
import { setFirebaseUser } from "../lib/firebaseStore";

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
  onGoBack: () => void;
  userRegistry?: UserType[];
}

export default function Login({ onLoginSuccess, onGoBack, userRegistry }: LoginProps) {
  const [mode, setMode] = useState<"student" | "admin">("student");
  
  // Empty inputs by default as requested
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Student registration states
  const [fullname, setFullname] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string>("");

  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState<boolean>(false);

  // Handle Photo Upload converting to Base64
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Ukuran foto maksimal adalah 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.onerror = () => {
        setError("Gagal membaca berkas foto.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Trim checks
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError("Silakan isi username/email!");
      return;
    }
    if (!trimmedPassword) {
      setError("Silakan isi password!");
      return;
    }

    if (mode === "admin") {
      let activeAdminName = "Administrator Bimbel";
      let activeAdminUsername = "admin";
      let activeAdminEmail = "admin@bimbelkatakita.com";
      let activeAdminPass = "adminkatakita";
      let activeAdminPhoto = photoBase64 || "https://img.icons8.com/color/150/manager.png";

      try {
        const savedRaw = localStorage.getItem("KATA_KITA_ADMIN_PROFILE");
        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          if (parsed) {
            if (parsed.fullname) activeAdminName = parsed.fullname;
            if (parsed.username) activeAdminUsername = parsed.username;
            if (parsed.password) activeAdminPass = parsed.password;
            if (parsed.photoUrl) activeAdminPhoto = parsed.photoUrl;
          }
        }
      } catch (e) {
        console.error("Failed to load saved admin credentials:", e);
      }

      const isAdminEmail = 
        trimmedEmail.toLowerCase() === activeAdminUsername.toLowerCase() || 
        trimmedEmail.toLowerCase() === activeAdminEmail.toLowerCase() ||
        trimmedEmail.toLowerCase() === "admin";
      
      const isAdminPass = 
        trimmedPassword === activeAdminPass || 
        trimmedPassword === "admin123" || 
        trimmedPassword === "adminkatakita";

      if (isAdminEmail && isAdminPass) {
        onLoginSuccess({
          id: "USR-ADMIN",
          email: "admin@bimbelkatakita.com",
          fullname: activeAdminName,
          role: "admin",
          photoUrl: activeAdminPhoto
        });
      } else {
        setError(`Kredensial Admin tidak valid! Silakan cek kembali username/email dan password Admin.`);
      }
    } else {
      // Student login - Prioritize live userRegistry prop from Firestore
      let registry: UserType[] = [];
      if (userRegistry && userRegistry.length > 0) {
        registry = userRegistry;
      } else {
        const rawRegistry = localStorage.getItem("KATA_KITA_USER_REGISTRY");
        registry = rawRegistry ? JSON.parse(rawRegistry) : [];
      }

      if (isRegistering) {
        if (!fullname.trim()) {
          setError("Silakan lengkapi nama Anda!");
          return;
        }

        const existingUser = registry.find(u => u.email === trimmedEmail.toLowerCase());
        if (existingUser) {
          setError("Email ini sudah terdaftar! Silakan login langsung.");
          return;
        }

        const newUser: UserType = {
          id: `USR-${Math.floor(10000 + Math.random() * 90000)}`,
          email: trimmedEmail.toLowerCase(),
          fullname: fullname.trim(),
          role: "student",
          categoryInterest: "UTBK SNBT",
          password: trimmedPassword,
          photoUrl: photoBase64 || "https://img.icons8.com/color/150/student-male--v1.png"
        };

        registry.push(newUser);
        localStorage.setItem("KATA_KITA_USER_REGISTRY", JSON.stringify(registry));
        setFirebaseUser(newUser);
        
        // Show success modal, do not directly enter dashboard, let them login manually!
        setSuccessModal(true);
      } else {
        if (trimmedEmail.toLowerCase().includes("admin") && trimmedPassword !== "admin123" && trimmedPassword !== "adminkatakita") {
          setError("Akun admin terdeteksi. Gunakan portal masuk Admin di bagian bawah!");
          return;
        }

        // Check if user exists in registry
        const matchedUser = registry.find(
          u => u.email.toLowerCase() === trimmedEmail.toLowerCase() && u.password === trimmedPassword
        );

        if (matchedUser) {
          onLoginSuccess(matchedUser);
        } else {
          // If email exists but password doesn't match
          const emailExists = registry.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase());
          if (emailExists) {
            setError("Password yang Anda masukkan salah!");
            return;
          }

          setError("Akun Anda belum terdaftar! Silakan lakukan pendaftaran akun baru terlebih dahulu.");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md my-auto">
        <div className="flex justify-center mb-6">
          <button 
            type="button"
            onClick={onGoBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0F4C81] bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left"></i> Kembali ke Landing Page
          </button>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          <div className="text-center mb-8">
            <img
              src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png"
              alt="Bimbel Kata Kita Logo"
              className="mx-auto h-16 w-auto object-contain mb-3"
              referrerPolicy="no-referrer"
            />
            <h2 className="text-2xl font-bold font-display text-slate-800">
              {mode === "admin" ? "Sistem Masuk Admin" : "Sistem Masuk Siswa"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === "admin" 
                ? "Gunakan akun autentikasi admin resmi Bimbel Kata Kita" 
                : "Masuk untuk mengakses simulasi tryout berstandar nasional"}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg border border-red-200 flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-red-500 shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            {isRegistering && mode === "student" && (
              <>
                <div>
                  <label htmlFor="fullname" className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Lengkap Siswa
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-slate-400 text-xs">
                      <i className="fa-solid fa-user"></i>
                    </span>
                    <input
                      id="fullname"
                      type="text"
                      placeholder="Masukkan nama lengkap Anda"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0F4C81] focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Unggah Foto Profil Siswa
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      {photoBase64 ? (
                        <img src={photoBase64} alt="Preview Foto" className="w-full h-full object-cover" />
                      ) : (
                        <i className="fa-solid fa-camera text-slate-400 text-lg"></i>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block">
                        <span className="sr-only">Pilih Berkas</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#0F4C81] hover:file:bg-blue-100 cursor-pointer"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1">PNG, JPG atau GIF (Maks. 2MB)</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-600 mb-1">
                {mode === "admin" ? "Username atau Email Admin" : "Email Siswa"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400 text-xs">
                  <i className="fa-solid fa-envelope"></i>
                </span>
                <input
                  id="email"
                  type="text"
                  placeholder={mode === "admin" ? "Masukkan username atau email admin" : "Masukkan email siswa"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-800 focus:border-[#0F4C81] focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-600 mb-1">
                Password / Kata Sandi
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400 text-xs">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-800 focus:border-[#0F4C81] focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full flex justify-center items-center gap-2 bg-[#0F4C81] hover:bg-[#0c3e6a] text-white text-sm font-semibold py-3 px-4 rounded-lg border-b-2 border-b-stone-900 transition-all active:scale-[0.98] shadow-md cursor-pointer"
            >
              <span>
                {mode === "admin" 
                  ? "Autentikasi Dashboard Admin" 
                  : isRegistering 
                    ? "Daftar & Masuk" 
                    : "Masuk ke Dashboard"}
              </span>
              <i className="fa-solid fa-right-to-bracket text-xs"></i>
            </button>
          </form>

          {mode === "student" && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setIsRegistering(!isRegistering);
                }}
                className="text-xs text-[#F58220] hover:underline font-semibold cursor-pointer"
              >
                {isRegistering 
                  ? "Sudah punya akun? Masuk langsung di sini" 
                  : "Belum terdaftar? Daftar akun baru di sini gratis"}
              </button>
            </div>
          )}
          
          {/* Admin Toggle Area */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
            {mode === "student" ? (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("admin");
                  setIsRegistering(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#0F4C81] font-semibold transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-shield-halved text-orange-400"></i> Punya Hak Akses Admin? Klik di sini
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("student");
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#0F4C81] font-semibold transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-user text-blue-400"></i> Masuk sebagai Siswa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-400 mt-8">
        &copy; 2026 Bimbel Kata Kita - National Tryout Management System
      </div>

      {successModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-slate-100 shadow-2xl animate-scale-up">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-xs">
              <i className="fa-solid fa-circle-check text-3xl"></i>
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 font-display">Registrasi Sukses!</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
              Pendaftaran Anda berhasil terkirim! Silakan masuk kembali melalui halaman masuk dengan menggunakan email dan kata sandi Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSuccessModal(false);
                setIsRegistering(false);
                // Clear state inputs if we want
                setFullname("");
              }}
              className="mt-5 w-full bg-[#0F4C81] hover:bg-[#0c3e6a] text-white text-xs font-black py-2.5 px-4 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Lanjut ke Halaman Masuk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
