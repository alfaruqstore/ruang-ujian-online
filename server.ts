/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit expanded for handling text processing
  app.use(express.json({ limit: "10mb" }));

  // Initialize server-side Gemini safely using modern SDK
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // API endpoint for AI-powered tryout question generation
  app.post("/api/generate-questions", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured on the server. Please add your key in Settings > Secrets.",
        });
      }

      const { prompt, category, subExam, count = 5 } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Permintaan 'prompt' tidak boleh kosong!" });
      }

      const systemInstruction = `Anda adalah pakar pembuat soal ujian nasional Indonesia untuk kategori ${category || "Umum"} sub-ujian ${subExam || "Umum"}.
Buatlah ${count} soal pilihan ganda berkualitas tinggi dengan tingkat kesulitan sedang-tinggi (HOTS).
Setiap soal wajib dilengkapi dengan 5 pilihan jawaban (A, B, C, D, E), kunci jawaban yang benar, dan pembahasan/penjelasan lengkap dalam bahasa Indonesia yang formal, taktis, dan mudah dipahami.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Daftar pertanyaan ujian pilihan ganda",
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: {
                  type: Type.STRING,
                  description: "Teks pertanyaan ujian lengkap. Tulislah soal dengan bahasa Indonesia yang baku.",
                },
                options: {
                  type: Type.OBJECT,
                  description: "Pilihan jawaban ganda wajib diisi A sampai E.",
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                    D: { type: Type.STRING },
                    E: { type: Type.STRING },
                  },
                  required: ["A", "B", "C", "D", "E"],
                },
                correctOption: {
                  type: Type.STRING,
                  description: "Kunci jawaban yang benar, bernilai salah satu dari karakter huruf kapital: 'A', 'B', 'C', 'D', 'E'",
                },
                explanation: {
                  type: Type.STRING,
                  description: "Pembahasan rinci cara memecahkan soal serta alasan mengapa opsi tersebut benar.",
                },
              },
              required: ["questionText", "options", "correctOption", "explanation"],
            },
          },
        },
      });

      const text = response.text || "[]";
      let parsedQuestions = [];
      try {
        parsedQuestions = JSON.parse(text);
      } catch (parseErr) {
        console.error("Gagal melakukan parse response JSON dari Gemini:", text);
        return res.status(502).json({ error: "Format keluaran AI tidak valid.", raw: text });
      }

      return res.json({ success: true, questions: parsedQuestions });
    } catch (err: any) {
      console.error("Error generating question from Gemini:", err);
      return res.status(500).json({ error: err.message || "Gagal membangkitkan soal melalui AI." });
    }
  });

  // Serve static assets in production, or mount Vite dev middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA routing fallback: send index.html for undefined assets
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bimbel Kata Kita Server running on http://localhost:${PORT}`);
  });
}

startServer();
