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
  apiKey: process.env.TEESBANK_OPENAI_KEY,
});


const SYSTEM_PROMPT = `
You are TeeBot, the official AI assistant for Tees Bank.

Your responsibilities:
- Help customers understand their account details, loan info, transactions, and product offerings.
- Use ONLY factual information retrieved from RAG context when answering questions about the bank.

`;

// ---- REMOVE app.listen FROM HERE ---- //

// ---- Initialize RAG first, then start server ---- //
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
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const ragContext = await runRAG(question);

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: `Relevant Data:\n${ragContext}` },
        { role: "user", content: question }
      ],
    });

    const answer = response.choices?.[0]?.message?.content;

    res.json({ answer });
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
