import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TEES Bank Knowledge Base - RAG data store
const knowledgeBase = [
  {
    id: 1,
    question: "How do I reset my PIN?",
    answer: "To reset your PIN, visit any TEES Bank ATM, select 'PIN Services', then 'Reset PIN'. You'll need your debit card and registered mobile number for OTP verification. Alternatively, you can reset your PIN through the TEES Bank mobile app under Settings > Card Management > Reset PIN."
  },
  {
    id: 2,
    question: "What are the bank's working hours?",
    answer: "TEES Bank branches are open Monday to Friday from 9:00 AM to 5:00 PM, and Saturday from 9:00 AM to 1:00 PM. We are closed on Sundays and public holidays. Our online banking and mobile app services are available 24/7."
  },
  {
    id: 3,
    question: "How do I open a new savings account?",
    answer: "To open a new savings account with TEES Bank, you can visit any branch with your government-issued ID, proof of address, and a minimum deposit of $100. You can also apply online through our website or mobile app - the process takes about 10 minutes and your account is typically activated within 24 hours."
  },
  {
    id: 4,
    question: "What is the interest rate on savings accounts?",
    answer: "TEES Bank offers competitive interest rates on savings accounts: Basic Savings earns 2.5% APY, Premium Savings earns 3.5% APY (minimum balance $5,000), and High-Yield Savings earns 4.25% APY (minimum balance $25,000). Interest is compounded daily and credited monthly."
  },
  {
    id: 5,
    question: "How do I report a lost or stolen card?",
    answer: "If your card is lost or stolen, immediately call our 24/7 hotline at 1-800-TEES-BANK (1-800-833-7226) or use the TEES Bank mobile app to instantly freeze your card under Card Management. You can also visit any branch during business hours. We'll block your card immediately and issue a replacement within 3-5 business days."
  },
  {
    id: 6,
    question: "What are the fees for international transfers?",
    answer: "TEES Bank charges a flat fee of $25 for international wire transfers. Exchange rates are updated in real-time and include a 1.5% margin. Premium account holders enjoy reduced fees of $15 per transfer and a 1% margin. Transfers typically complete within 2-4 business days depending on the destination country."
  },
  {
    id: 7,
    question: "How do I apply for a loan?",
    answer: "You can apply for personal loans, auto loans, or home loans through TEES Bank. Visit our website or mobile app, click on 'Loans', and complete the application form. You'll need to provide income verification, employment details, and consent for a credit check. Decisions are typically made within 24-48 hours for personal and auto loans."
  },
  {
    id: 8,
    question: "What mobile banking features are available?",
    answer: "The TEES Bank mobile app offers: account balance and transaction history, fund transfers (internal, external, and international), bill payments, mobile check deposit, card management (freeze/unfreeze, PIN change), loan applications, investment portfolio tracking, and 24/7 customer support chat."
  },
  {
    id: 9,
    question: "How do I set up direct deposit?",
    answer: "To set up direct deposit, provide your employer with TEES Bank's routing number (021000089) and your account number (found on your checks or in the mobile app under Account Details). Deposits typically begin within 1-2 pay cycles after setup. You can also generate a pre-filled direct deposit form in our mobile app."
  },
  {
    id: 10,
    question: "What security features protect my account?",
    answer: "TEES Bank employs multiple security layers: 256-bit encryption, two-factor authentication (2FA), biometric login (fingerprint/face ID), real-time fraud monitoring, instant transaction alerts, and automatic suspicious activity blocking. We also offer free credit monitoring for all account holders."
  },
  {
    id: 11,
    question: "How do I dispute a transaction?",
    answer: "To dispute a transaction, log into your TEES Bank account online or via the mobile app, find the transaction in question, and click 'Dispute'. You can also call our customer service at 1-800-TEES-BANK or visit a branch. Please dispute within 60 days of the transaction date. Investigation typically takes 10-14 business days."
  },
  {
    id: 12,
    question: "What credit cards does TEES Bank offer?",
    answer: "TEES Bank offers several credit cards: TEES Everyday Card (no annual fee, 1.5% cashback), TEES Travel Rewards (2x points on travel, $95 annual fee), TEES Premium (3% cashback on dining, 2% on groceries, $150 annual fee), and TEES Student Card (no annual fee, no foreign transaction fees, credit-building features)."
  }
];

// Simple cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Simple text-based similarity using word overlap (TF-IDF-like approach)
function getTextEmbedding(text: string): number[] {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const vocabulary = [
    'pin', 'reset', 'card', 'account', 'savings', 'loan', 'transfer', 'fee',
    'interest', 'rate', 'mobile', 'app', 'online', 'branch', 'hours', 'open',
    'deposit', 'withdraw', 'balance', 'transaction', 'dispute', 'lost', 'stolen',
    'credit', 'debit', 'payment', 'bill', 'security', 'password', 'login',
    'international', 'wire', 'direct', 'routing', 'check', 'apply', 'how',
    'what', 'where', 'when', 'why', 'customer', 'service', 'support', 'help',
    'fraud', 'alert', 'notification', 'limit', 'minimum', 'maximum', 'annual',
    'monthly', 'daily', 'cashback', 'rewards', 'points', 'travel', 'student'
  ];
  
  const embedding = vocabulary.map(v => {
    const count = words.filter(w => w.includes(v) || v.includes(w)).length;
    return count;
  });
  
  return embedding;
}

// Retrieve most relevant knowledge base entries
function retrieveRelevantContext(question: string, topK: number = 3): string[] {
  const questionEmbedding = getTextEmbedding(question);
  
  const scored = knowledgeBase.map(entry => {
    const entryText = `${entry.question} ${entry.answer}`;
    const entryEmbedding = getTextEmbedding(entryText);
    const similarity = cosineSimilarity(questionEmbedding, entryEmbedding);
    return { entry, similarity };
  });
  
  scored.sort((a, b) => b.similarity - a.similarity);
  
  return scored.slice(0, topK).map(s => 
    `Q: ${s.entry.question}\nA: ${s.entry.answer}`
  );
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    
    if (!question || typeof question !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received question:', question);

    // RAG Step 1: Retrieve relevant context
    const relevantContext = retrieveRelevantContext(question, 3);
    console.log('Retrieved context entries:', relevantContext.length);

    // RAG Step 2: Build prompt with context
    const systemPrompt = `You are TEES Bank Assist, a friendly and professional AI banking assistant for TEES Bank. 
You help customers with their banking questions and concerns.

IMPORTANT INSTRUCTIONS:
1. Use ONLY the information provided in the CONTEXT below to answer questions.
2. If the information is not in the context, politely say: "I don't have that information at the moment. Please contact our customer service at 1-800-TEES-BANK for further assistance."
3. Be helpful, professional, and concise.
4. If relevant, suggest related services or next steps the customer might find useful.
5. Never make up information about rates, fees, or policies that isn't in the context.

CONTEXT FROM TEES BANK KNOWLEDGE BASE:
${relevantContext.join('\n\n---\n\n')}`;

    // RAG Step 3: Call AI with context
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Service is busy. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    console.log('Generated answer successfully');

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ask function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
