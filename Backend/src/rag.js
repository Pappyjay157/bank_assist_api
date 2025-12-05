import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.TEESBANK_OPENAI_KEY,
});
const __dirname = path.dirname(__filename);

let data = [];
let embeddedData = [];

// Load JSON + embed database
export async function initRAG() {
  try {
    const filePath = path.join(__dirname, "tees_bank_synthetic.json");
    console.log("Loading RAG JSON from:", filePath);

    const raw = fs.readFileSync(filePath, "utf8");
    data = JSON.parse(raw);

    console.log(`Loaded ${data.length} banking knowledge records`);

    // Pre-generate embeddings
    const texts = data.map((item) => item.content);

    const embedding = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });

    embeddedData = data.map((item, index) => ({
      ...item,
      embedding: embedding.data[index].embedding,
    }));

    console.log("RAG initialized with embeddings.");
  } catch (err) {
    console.error("RAG failed to initialize:", err);
  }
}

// Cosine similarity helper
function cosineSim(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

// Main RAG function
export async function runRAG(query) {
  if (!embeddedData.length) return "No RAG context available.";

  const queryEmbedding = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  const q = queryEmbedding.data[0].embedding;

  const ranked = embeddedData
    .map((item) => ({
      ...item,
      score: cosineSim(q, item.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return ranked.map((r) => r.content).join("\n\n");
}

// Initialize on import
await initRAG();
