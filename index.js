const express = require("express");
const axios = require("axios");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk parse JSON request body
app.use(cors());
app.use(express.json());

// Endpoint untuk menerima soal dan mengirim ke Gemini AI
app.post("/ask", async (req, res) => {
  const { question } = req.body;
// console.log(question);
  if (!question) {
    return res.status(400).send({ error: "Soal tidak ditemukan!" });
  }

  try {
    // Kirim request ke Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Berikan jawaban yang singkat, jelas, dan konsisten, langsung mengarah ke inti persoalan. Pastikan jawaban didasarkan pada prinsip logis yang kuat, bukti relevan, serta teori atau konsep ilmiah yang telah teruji dan dapat dipertanggungjawabkan. Jelaskan secara ringkas mengapa jawaban tersebut benar, serta langkah-langkah penting yang diperlukan untuk mencapai kesimpulan tersebut, jika relevan. Setelah memberikan jawaban, lakukan evaluasi kritis terhadap soal untuk memastikan pemahaman yang tepat, termasuk kemungkinan alternatif jawaban dan asumsi yang mendasari. Sertakan persentase keyakinan Anda terhadap kebenaran jawaban ini, berdasarkan tingkat kepastian logis, bukti ilmiah, serta evaluasi terhadap kompleksitas atau ketidakpastian soal. Jelaskan mengapa Anda memilih tingkat keyakinan tersebut. Berikut soal yang dimaksud: ${question}.`
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Log response candidates untuk debugging
    // console.log(
    //   "Response dari Gemini:",
    // );

    const data = JSON.stringify(
      response.data.candidates[0].content.parts[0].text,
      null,
      2
    );

    // Periksa jika ada candidates dan content yang valid
    if (data) {
      // Log detail kandidat yang diterima
      console.log("requested");

      // Periksa apakah content ada dalam kandidat
      if (data) {
        const answer = data || "Jawaban tidak ditemukan.";
        res.json({ answer });
      } else {
        res
          .status(500)
          .json({ error: "Content tidak ditemukan dalam candidate." });
      }
    } else {
      res.status(500).json({ error: "Data candidates tidak ditemukan." });
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat memproses permintaan" });
  }
});

// Jalankan server Express
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
