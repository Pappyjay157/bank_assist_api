const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface AskResponse {
  answer?: string;
  error?: string;
}

export async function askBackend(question: string): Promise<AskResponse> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Failed to get response" };
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { 
      error: error instanceof Error ? error.message : "Network error. Please check your connection." 
    };
  }
}
