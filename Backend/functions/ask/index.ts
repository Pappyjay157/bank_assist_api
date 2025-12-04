import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import syntheticData from "./tees_bank_synthetic.json" assert { type: "json" };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TEES Bank Knowledge Base - RAG data store
const knowledgeBase = syntheticData.map((item, index) => ({
  id: item.id || index + 1,
  category: item.category,
  question: item.question,
  answer: item.answer
}));

// Simple cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getTextEmbedding(text: string): number[] {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  const vocab = [
    "pin", "reset", "card", "account", "savings", "loan", "transfer", "fee",
    "interest", "rate", "mobile", "app", "branch", "deposit", "withdraw",
    "balance", "transaction", "dispute", "lost", "stolen", "credit", "debit",
    "payment", "security", "password", "login", "international", "wire",
    "routing", "check", "apply", "customer", "support", "fraud", "alert",
    "limit", "rewards", "travel", "student"
  ];

  return vocab.map(v => words.filter(w => w.includes(v) || v.includes(w)).length);
}

// Retrieve top-K matched Q&A entries via RAG
function retrieveRelevantContext(question: string, topK = 3) {
  const qEmbed = getTextEmbedding(question);
  const scored = knowledgeBase.map(entry => {
    const combined = `${entry.question} ${entry.answer}`;
    const eEmbed = getTextEmbedding(combined);
    const similarity = cosineSimilarity(qEmbed, eEmbed);
    return { entry, similarity };
  });

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK).map(s => `Q: ${s.entry.question}\nA: ${s.entry.answer}`);
}

// -------------------------
// MAIN SERVER
// -------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User question:", question);

    // RAG Step 1 — Retrieve context
    const context = retrieveRelevantContext(question, 3);

    // RAG Step 2 — Build system prompt
    const systemPrompt = `
You are TEES Bank Assist, the official AI support assistant for TEES Bank.

Rules:
1. Use ONLY the provided context to answer.
2. Do NOT invent fees, policies, or interest rates.
3. If the context does not contain the answer, say:
   "I don't have that information at the moment. Please contact TEES Bank customer service for further help."
4. Keep responses helpful, clear, and friendly.

CONTEXT:
${context.join("\n\n---\n\n")}
    `;

    // Load API key
    const OPENAI_KEY = Deno.env.get("TEESBANK_OPENAI_KEY");
    if (!OPENAI_KEY) {
      throw new Error("Missing environment variable: TEESBANK_OPENAI_KEY");
    }



    // RAG Step 3 — Call OpenAI API directly
        const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ]
      })
    });

    const data = await aiResponse.json();
    console.log("AI responded successfully");

  const answer = data.output_text ?? "I couldn't generate a response.";

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});