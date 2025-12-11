
export interface AskResponse {
  answer?: string;
  error?: string;
}

const BACKEND_URL = "http://localhost:3001";

export async function askBackend(question: string, mode: "RAG" | "API" = "RAG"): Promise<AskResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, mode }),
    });

    const text = await response.text();
    let data: any = {};

    try {
      data = JSON.parse(text);
    } catch {
      return { error: "Invalid JSON returned from backend" };
    }

    if (!response.ok) {
      return { error: data.error || "Backend error" };
    }

    return data;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network connection error",
    };
  }
}