# Bank Assist API

A **Retrieval Augmented Generation (RAG)** powered banking support assistant for **TEES Bank**.

## Features

- RAG-based question answering using TEES Bank's knowledge base
- Fast and lightweight Node.js API
- Embedding-based similarity search (custom cosine matching)
- Secure environment variable loading
- Modern React frontend with TypeScript + Tailwind
- Works locally or via cloud deployment

## Tech Stack

### Backend
- Node.js
- TypeScript
- Express (or Deno if you choose)
- Custom RAG pipeline
- JSON knowledge base

### Frontend
- React (TypeScript template)
- Vite
- Tailwind CSS
- shadcn UI components

---

## Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/your-username/bank_assist_api.git
cd bank_assist_api

```

### Backend Setup (Node.js + TypeScript)
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Add Your Environment Variables**
   Create a `.env` file in the backend root:
   ```env
   OPENAI_API_KEY=your-api-key-here
   # OR whichever API provider you're using (Gemini, Lovable Gateway, etc):
   AI_API_KEY=your-key-here
   ```

3. **Add Your Knowledge Base**
   Place your dataset here:
   ```
   /data/tees_bank_synthetic.json
   /data/tees_bank_original.json
   ```
   You can merge them manually or via code.

4. **Start the API**
   ```bash
   npm run dev
   ```
   Backend now runs at:
   [http://localhost:3000](http://localhost:3000)

### Frontend Setup (React + TS + Tailwind)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at:
[http://localhost:5173](http://localhost:5173)

---

## API Endpoint

**POST /api/ask**
Send a question to the RAG model:

**Request:**
```json
{
  "question": "How do I reset my TEES Bank debit card PIN?"
}
```

**Response:**
```json
{
  "answer": "You can reset your TEES Bank debit card PIN by..."
}
```

---

## Folder Structure

```
bank_assist_api/
│
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── rag/
│   │   │   ├── embed.ts
│   │   │   ├── retrieve.ts
│   │   │   └── generate.ts
│   ├── data/
│   │   ├── tees_bank_synthetic.json
│   │   └── tees_bank_original.json
│   └── .env
│
└── frontend/
    ├── src/
    ├── components/
    └── index.html
```

---

## Deployment

Deploy easily using:
- Vercel (frontend + backend)
- Netlify + Railway
- Render
- Fly.io
- Any Node hosting environment

---

## License

This project is fully owned and maintained by **Ayooluwa Samuel**.
```
