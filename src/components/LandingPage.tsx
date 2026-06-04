/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const packagesList = [
    { num: "01", name: "UTBK SNBT", label: "7 Sub-Tes, 195 Menit, 160 Soal", gradient: "from-blue-600 via-indigo-700 to-violet-800", textColor: "text-white" },
    { num: "02", name: "Kedinasan", label: "SKD Terpadu: TWK-TIU-TKP", gradient: "from-red-600 via-rose-600 to-orange-600", textColor: "text-white" },
    { num: "03", name: "CPNS", label: "SKD Terpadu: TWK-TIU-TKP", gradient: "from-amber-500 via-orange-500 to-yellow-600", textColor: "text-white" },
    { num: "04", name: "TNI / Polri", label: "Akademik & Kebangsaan", gradient: "from-emerald-600 via-teal-700 to-cyan-800", textColor: "text-white" },
    { num: "05", name: "BUMN", label: "TKD & Core Values AKHLAK", gradient: "from-purple-600 via-violet-700 to-indigo-800", textColor: "text-white" },
    { num: "06", name: "PPPK", label: "Asesmen Kompetensi Teknis", gradient: "from-pink-600 via-rose-500 to-red-700", textColor: "text-white" },
    { num: "07", name: "Psikotes", label: "Kognitif & Kepribadian", gradient: "from-cyan-600 via-sky-600 to-blue-700", textColor: "text-white" },
    { num: "08", name: "TKA Umum", label: "SD, SMP, SMA Semua Mapel", gradient: "from-teal-500 via-emerald-600 to-green-700", textColor: "text-white" },
    { num: "09", name: "Bahasa Inggris (SD, SMP, SMA)", label: "Grammar, Reading, Structure", gradient: "from-fuchsia-600 via-purple-700 to-pink-800", textColor: "text-white" },
    { num: "10", name: "Matematika (SD, SMP, SMA)", label: "Aljabar, Logika & Analitis", gradient: "from-violet-600 via-indigo-700 to-purple-800", textColor: "text-white" },
    { num: "11", name: "Test Asesmen Nasional (AN)", label: "AKM, Survei Karakter & Lingkungan", gradient: "from-slate-700 via-slate-800 to-slate-900", textColor: "text-white" },
    { num: "12", name: "Test/Ujian Lainnya", label: "Tryout Ujian Saringan Masuk Lainnya", gradient: "from-indigo-900 via-violet-800 to-purple-900", textColor: "text-white" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png"
              alt="Bimbel Kata Kita Logo"
              className="h-14 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-800 leading-tight flex items-center gap-2">
                <i className="fa-solid fa-graduation-cap text-[#0F4C81]"></i> BIMBEL KATA KITA
              </h1>
              <span className="text-xs font-semibold tracking-wider text-[#F58220]">TRYOUT ONLINE NASIONAL</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#hero" className="text-slate-600 hover:text-[#0F4C81] font-medium transition-colors flex items-center gap-1.5"><i className="fa-solid fa-house text-xs"></i> Beranda</a>
            <a href="#profile" className="text-slate-600 hover:text-[#0F4C81] font-medium transition-colors flex items-center gap-1.5"><i className="fa-solid fa-circle-info text-xs"></i> Profil</a>
            <a href="#visi-misi" className="text-slate-600 hover:text-[#0F4C81] font-medium transition-colors flex items-center gap-1.5"><i className="fa-solid fa-bullseye text-xs"></i> Visi & Misi</a>
            <a href="#paket" className="text-slate-600 hover:text-[#0F4C81] font-medium transition-colors flex items-center gap-1.5"><i className="fa-solid fa-cubes text-xs"></i> Kategori Tryout</a>
          </nav>

          <div>
            <button
              onClick={onStart}
              className="bg-[#0F4C81] hover:bg-[#0c3e6a] text-white font-medium px-6 py-2.5 rounded-lg border-b-2 border-b-blue-900 transition-all active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
            >
              Masuk Dashboard <i className="fa-solid fa-arrow-right-to-bracket text-sm"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative bg-gradient-to-br from-slate-900 via-[#0F4C81] to-slate-800 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 flex flex-col items-start gap-6">
            <div 
              style={{ color: '#ffffff', backgroundColor: '#090d16', borderColor: '#334155' }}
              className="inline-flex items-center gap-2 transition-colors px-4 py-2 rounded-full border text-xs sm:text-sm font-black shadow-xl"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#F58220] animate-pulse"></span>
              Sistem Tryout Berstandar Nasional Terbaru - CBT Modern
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Raih Impian Akademik & Karir Anda Bersama <span className="text-[#F58220]">Bimbel Kata Kita</span>
            </h2>
            <p className="text-lg text-slate-200 font-sans leading-relaxed">
              Mempersiapkan diri menghadapi UTBK-SNBT, CPNS, Kedinasan, hingga TNI/Polri kini lebih realistis, terukur, dan presisi. Dilengkapi dengan simulasi waktu riil, pendeteksi keluar layar untuk integritas tinggi, dan pembahasan terlengkap.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <button
                onClick={onStart}
                className="bg-[#F58220] hover:bg-[#e07116] text-white font-bold px-8 py-3.5 rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all duration-200 active:translate-y-0.5 cursor-pointer"
              >
                Mulai Ujian Sekarang
              </button>
              <a
                href="#profile"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-lg border border-white/20 transition-all flex items-center gap-2"
              >
                Pelajari Selengkapnya
              </a>
            </div>
          </div>
          <div className="md:col-span-5 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl relative w-full max-w-sm">
              <div className="absolute -top-4 -right-4 bg-[#F58220] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Akreditasi Nasional
              </div>
              <h3 className="text-xl font-bold text-white mb-4"><i className="fa-solid fa-chart-simple text-[#F58220] mr-2"></i> Keunggulan Sistem</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
                    <i className="fa-solid fa-award text-lg"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-300">Tingkat Kelulusan</p>
                    <p className="text-sm font-bold">92.4% Siswa Lolos UTBK/CPNS</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg text-orange-300">
                    <i className="fa-solid fa-circle-check text-lg"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-300">Kesesuaian Kisi-kisi</p>
                    <p className="text-sm font-bold">100% Mengikuti Standar Baku</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-[#2ECC71]">
                    <i className="fa-solid fa-shield-halved text-lg"></i>
                  </div>
                  <div>
                    <p className="text-xs text-slate-300">Integritas Tinggi</p>
                    <p className="text-sm font-bold">Sistem Deteksi Tab-Switch Pintar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profil Section */}
      <section id="profile" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0F4C81]">Profil Bimbel Kata Kita</span>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">Mengapa Memilih Bimbel Kami?</h3>
          <p className="text-slate-600 mt-4 leading-relaxed font-sans">
            BIMBEL KATA KITA adalah lembaga bimbingan belajar profesional terkemuka yang berfokus pada pendampingan calon pelamar kerja aparatur negara, taruna kedinasan, taruna militer/kepolisian, serta para pejuang UTBK perguruan tinggi negeri. Kami mengintegrasikan metode pembelajaran yang praktis dengan platform digital tercanggih.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-[#F58220] mb-6">
              <i className="fa-solid fa-book-open text-xl"></i>
            </div>
            <h4 className="text-lg font-bold text-slate-800">Paket Ujian Komprehensif</h4>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Tersedia 11 kategori paket ujian standar tertinggi untuk memastikan penguasaan komprehensif pada setiap sub-tes secara berkala.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-[#0F4C81] mb-6">
              <i className="fa-solid fa-laptop-code text-xl"></i>
            </div>
            <h4 className="text-lg font-bold text-slate-800">Simulasi Kondisi Riil (CBT)</h4>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Dilengkapi pembagian waktu sub-ujian dan sistem pengawasan ketat seperti pendeteksi keluar-tab yang melatih kesiapan mental serta fokus peserta.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-[#2ECC71] mb-6">
              <i className="fa-solid fa-chart-line text-xl"></i>
            </div>
            <h4 className="text-lg font-bold text-slate-800">Analisis Kinerja Detil</h4>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Mendapatkan pembahasan mendetil, saran kelemahan dan kekuatan, serta ranking pengerjaan langsung setelah menaruh jawaban untuk dipelajari kembali.
            </p>
          </div>
        </div>
      </section>

      {/* Visi & Misi Section */}
      <section id="visi-misi" className="bg-[#0F4C81] text-white py-20 px-4 sm:px-6 lg:px-8 scroll-mt-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F58220]">Visi & Misi Kami</span>
            <h3 className="text-3xl font-bold text-white mt-1">Komitmen Mendidik Bangsa</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-stretch">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[#F58220] font-bold text-lg inline-block mb-3"><i className="fa-solid fa-eye mr-2"></i> VISI</span>
                <p className="text-slate-100 text-base leading-relaxed font-sans">
                  Menjadi lembaga bimbingan belajar berbasis inovasi digital yang terpercaya untuk melahirkan sumber daya manusia unggul yang cakap lolos saringan tes standar nasional, berdaya saing global, dan berkarakter akhlak mulia.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[#F58220] font-bold text-lg inline-block mb-3"><i className="fa-solid fa-bullseye mr-2"></i> MISI</span>
                <ul className="space-y-4 text-slate-100 text-sm font-sans list-disc pl-4">
                  <li>Menyelenggarakan simulasi uji coba berbasis website yang andal dan selaras dengan regulasi pemerintah.</li>
                  <li>Menyediakan bank soal yang progresif dengan relevansi kisi-kisi terakurat.</li>
                  <li>Melatih kemandirian dan kesiapan mental belajar siswa melalui sistem kontrol ujian berintegritas tinggi.</li>
                  <li>Mendedikasikan pelayanan bimbingan bermutu optimal dengan harga yang inklusif untuk seluruh wilayah Nusantara.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tryout Categories Section */}
      <section id="paket" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F58220]">Kategori Layanan</span>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">Lebih dari 10 Pilihan Paket Ujian Premium</h3>
          <p className="text-slate-600 mt-4 leading-relaxed font-sans">
            Seluruh kategori di bawah dirancang secara detail dengan visualisasi dinamis. Warna degradasi mencolok yang bervariasi membantu Anda menavigasi fokus ke setiap sektor akademis secara optimal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {packagesList.map((item) => (
            <div
              key={item.num}
              className={`p-6 rounded-2xl bg-gradient-to-br ${item.gradient} ${item.textColor} shadow-lg border border-white/10 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-md">
                    PAKET {item.num}
                  </span>
                  <span className="text-white/80">
                    <i className="fa-solid fa-star-of-life animate-spin text-xs" style={{ animationDuration: '6s' }}></i>
                  </span>
                </div>
                <h4 className="text-lg font-bold tracking-tight mb-2">
                  {item.name}
                </h4>
              </div>
              <p className="text-xs text-white/90 mt-4 bg-black/10 p-2.5 rounded-lg border border-white/5 font-sans">
                <i className="fa-solid fa-list-check mr-1 text-white/80"></i> {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-slate-100/50 p-8 rounded-2xl border border-slate-200/55 max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-left">
            <h4 className="text-lg font-bold text-slate-800">Siap untuk menguji kesiapan Anda?</h4>
            <p className="text-slate-600 text-sm mt-1">Gunakan akun simulasi siswa dan rasakan sistem ujian berintegritas tinggi Bimbel Kata Kita.</p>
          </div>
          <button
            onClick={onStart}
            className="whitespace-nowrap bg-[#F58220] hover:bg-[#e07116] text-white font-bold px-8 py-3.5 rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            Mulai Sekarang <i className="fa-solid fa-circle-play text-sm"></i>
          </button>
        </div>
      </section>

      {/* Professional Corporate Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png"
                alt="Bimbel Kata Kita Logo"
                className="h-14 w-auto object-contain brightness-95 bg-white/5 p-1 rounded-lg"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-white font-extrabold text-lg tracking-wider">BIMBEL KATA KITA</h4>
                <p className="text-xs text-[#F58220] font-semibold tracking-widest uppercase">Tryout Online Nasional</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Lembaga bimbingan belajar profesional pionir platform simulasi computer-assisted test (CBT) berintegritas tinggi dengan bank soal ujian terpadu terlengkap dan tervalidasi nasional.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Mitra Utama Sukses Akademis & Karir Abdi Negara</span>
            </div>
          </div>

          {/* Contact Details Column */}
          <div className="md:col-span-4 space-y-4">
            <h5 className="text-white font-bold text-sm tracking-widest uppercase border-b border-slate-800 pb-2">Kontak Resmi</h5>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-map-marker-alt text-[#F58220] mt-1"></i>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Alamat Kantor</span>
                  <span className="text-xs text-slate-300 leading-relaxed">
                    Belakang Waleu Kaos Lampung, Jl. Wolter Monginsidi Gg.H. Musa, Kelurahan Pengajaran, Kec. Tlk. Betung Utara, Kota Bandar Lampung, Lampung 35215
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-phone text-[#F58220] mt-1"></i>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Hubungi atau WhatsApp</span>
                  <a href="https://wa.me/6285179973232" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-slate-300 font-medium font-mono">0851-7997-3232</a>
                  <a href="https://wa.me/6283151572671" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-slate-300 font-medium font-mono">0831-5157-2671</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-envelope text-[#F58220] mt-1"></i>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Surel Resmi</span>
                  <a href="mailto:belajar.katakita@gmail.com" className="hover:text-white transition-colors font-mono">belajar.katakita@gmail.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-globe text-[#F58220] mt-1"></i>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Portal Website Resmi</span>
                  <a href="https://katakita-group.biz.id/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-blue-400 font-medium">https://katakita-group.biz.id/</a>
                  <span className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-wider">Website Pengembang</span>
                  <a href="https://bagus-supriyadi.biz.id/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-blue-400 font-medium font-mono">website : https://bagus-supriyadi.biz.id/</a>
                </div>
              </div>
            </div>
          </div>

          {/* Maps and Social Media Column */}
          <div className="md:col-span-4 space-y-6">
            <div>
              <h5 className="text-white font-bold text-sm tracking-widest uppercase border-b border-slate-800 pb-2 mb-3">Kantor Cabang (Google Maps)</h5>
              <div className="space-y-2.5 text-xs">
                <a
                  href="https://maps.app.goo.gl/gMpfgbr6fH3FKw8T7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <i className="fa-solid fa-map-location-dot text-rose-500 text-sm"></i>
                  <div>
                    <p className="font-bold text-slate-200">Kantor Cabang Utama 1</p>
                    <p className="text-slate-400 text-[10px]">Klik untuk rute petunjuk peta</p>
                  </div>
                </a>
                <a
                  href="https://maps.app.goo.gl/f1R4T6d7qLZ2VPxi6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <i className="fa-solid fa-map-location-dot text-rose-500 text-sm"></i>
                  <div>
                    <p className="font-bold text-slate-200">Kantor Cabang Utama 2</p>
                    <p className="text-slate-400 text-[10px]">Klik untuk rute petunjuk peta</p>
                  </div>
                </a>
              </div>
            </div>

            <div>
              <h5 className="text-white font-bold text-sm tracking-widest uppercase border-b border-slate-800 pb-2 mb-3">Media Sosial Resmi</h5>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://www.instagram.com/belajarkatakita/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-gradient-to-tr hover:from-yellow-600 hover:via-pink-600 hover:to-indigo-600 flex items-center justify-center text-slate-300 hover:text-white transition-all transform hover:scale-110 border border-slate-800 shadow-sm"
                  title="Instagram Belajar KataKita"
                >
                  <i className="fa-brands fa-instagram text-lg"></i>
                </a>
                <a
                  href="https://www.instagram.com/healthcarekatakita/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-gradient-to-tr hover:from-yellow-600 hover:via-pink-600 hover:to-indigo-600 flex items-center justify-center text-slate-300 hover:text-white transition-all transform hover:scale-110 border border-slate-800 shadow-sm"
                  title="Instagram Healthcare KataKita"
                >
                  <i className="fa-brands fa-instagram text-lg"></i>
                </a>
                <a
                  href="https://www.instagram.com/smabintangplus_bdl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-gradient-to-tr hover:from-yellow-600 hover:via-pink-600 hover:to-indigo-600 flex items-center justify-center text-slate-300 hover:text-white transition-all transform hover:scale-110 border border-slate-800 shadow-sm"
                  title="Instagram SMA Bintang Plus BDL"
                >
                  <i className="fa-brands fa-instagram text-lg"></i>
                </a>
                <a
                  href="https://www.facebook.com/belajarkatakita/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-[#1877F2] flex items-center justify-center text-slate-300 hover:text-white transition-all transform hover:scale-110 border border-slate-800 shadow-sm"
                  title="Facebook Belajar KataKita"
                >
                  <i className="fa-brands fa-facebook-f text-lg"></i>
                </a>
                <a
                  href="https://www.facebook.com/healthcarekatakita/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-[#1877F2] flex items-center justify-center text-slate-300 hover:text-white transition-all transform hover:scale-110 border border-slate-800 shadow-sm"
                  title="Facebook Healthcare KataKita"
                >
                  <i className="fa-brands fa-facebook-f text-lg"></i>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61586034206310"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-[#1877F2] flex items-center justify-center text-slate-300 hover:text-white transition-all transform hover:scale-110 border border-slate-800 shadow-sm"
                  title="Facebook KataKita Group"
                >
                  <i className="fa-brands fa-facebook-f text-lg"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer and Copyright boundary */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col items-center justify-center text-center gap-4 text-xs text-slate-400 font-sans">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 flex-wrap">
            <span className="font-semibold text-slate-200">@2026 BIMBEL KATA KITA GROUP. Hak Cipta Dilindungi Undang-Undang</span>
            <span className="text-[#F58220] font-black tracking-wide">design by. Bagus_Supriyadi</span>
            <div className="flex items-center gap-4">
              <span className="hover:text-white transition-colors cursor-help">Syarat Ketentuan Layanan</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <span className="hover:text-white transition-colors cursor-help">Kebijakan Privasi CBT</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
