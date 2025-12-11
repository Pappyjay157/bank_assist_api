import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { initRAG, runRAG } from "./rag.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: "sk-***" ,
});


const SYSTEM_PROMPT = `
You are TeeBot, the official AI assistant for Tees Bank.

Rules:
1. ALWAYS attempt to answer based on the RAG data provided.
2. If the RAG data is missing or incomplete, STILL answer confidently using general banking knowledge.
3. NEVER say "I don't know" or "I don't have information".
4. NEVER tell the user to visit a website or call support unless the question is impossible.
5. Keep answers short, helpful, and professional.
`;

<<<<<<< HEAD



=======
// ---- Initialize RAG first, then start server ---- //
>>>>>>> 0d88fd7db734570e4cb5b56b70f2fbd100768cce
initRAG()
  .then(() => {
    console.log("RAG is ready!");

    app.listen(3001, () => {
      console.log("Server running on http://localhost:3001");
    });
  })
  .catch((err) => {
    console.error("RAG failed to initialize:", err);
  });

app.post("/ask", async (req, res) => {
  try {
    const { question, mode } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    let messages = [
      { role: "system", content: SYSTEM_PROMPT }
    ];

    // ---------------------------------------
    //  MODE 1: RAG MODE (use JSON + vector DB)
    // ---------------------------------------
    if (mode === "RAG") {
      try {
        const ragContext = await runRAG(question);

        messages.push({
          role: "system",
          content: `Relevant Data:\n${ragContext}`
        });

      } catch (err) {
        console.error("RAG failed:", err);
        messages.push({
          role: "system",
          content: "RAG failed. Respond using general banking knowledge."
        });
      }
    }

    // ---------------------------------------
    //  MODE 2: API MODE (NO RAG, NO JSON)
    // ---------------------------------------
    if (mode === "API") {
      messages.push({
        role: "system",
        content: "RAG is disabled. Answer using only your general banking knowledge."
      });
    }

    messages.push({ role: "user", content: question });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages,
    });

    res.json({
      answer: response.choices?.[0]?.message?.content || ""
    });

  } catch (err) {
    console.error("Backend error", err);
    res.status(500).json({ error: "Server error" });
  }
});
