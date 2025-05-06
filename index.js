const express = require("express");
const axios = require("axios");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).send({ error: "Soal tidak ditemukan!" });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Berikan jawaban yang singkat, jelas, dan konsisten, langsung mengarah ke inti persoalan. Pastikan jawaban didasarkan pada prinsip logis yang kuat, bukti relevan, serta teori atau konsep ilmiah yang telah teruji dan dapat dipertanggungjawabkan. Jelaskan secara ringkas mengapa jawaban tersebut benar, serta langkah-langkah penting yang diperlukan untuk mencapai kesimpulan tersebut, jika relevan. Setelah memberikan jawaban, lakukan evaluasi kritis terhadap soal untuk memastikan pemahaman yang tepat, termasuk kemungkinan alternatif jawaban dan asumsi yang mendasari. Sertakan persentase keyakinan Anda terhadap kebenaran jawaban ini, berdasarkan tingkat kepastian logis, bukti ilmiah, serta evaluasi terhadap kompleksitas atau ketidakpastian soal. Jelaskan mengapa Anda memilih tingkat keyakinan tersebut. Berikut soal yang dimaksud: ${question}.`
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    const data = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (data) {
      console.log("Jawaban AI berhasil diambil");
      res.json({ answer: data });
    } else {
      res.status(500).json({ error: "Content tidak ditemukan dalam candidate." });
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error.response?.data || error.message);
    res.status(500).json({ error: "Terjadi kesalahan saat memproses permintaan" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
