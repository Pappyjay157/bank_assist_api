import { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import SuggestionChips from "./SuggestionChips";
import { askBackend } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const getWelcomeMessage = (mode: "RAG" | "API"): Message => ({
  id: "welcome",
  role: "assistant",
  timestamp: new Date(),
  content:
    mode === "RAG"
      ? "Hello! I'm TEES Bank Assist using RAG mode. I will answer using verified Tees Bank knowledge."
      : "Hello! I'm TEES Bank Assist using API mode. I will answer based on general banking knowledge.",
});

const ChatWindow = () => {
  const [mode, setMode] = useState<"RAG" | "API">("RAG");

const [messages, setMessages] = useState<Message[]>([
  getWelcomeMessage("RAG"),
]);

  const [isLoading, setIsLoading] = useState(false);


  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  useEffect(() => {
  setMessages([getWelcomeMessage(mode)]);
}, [mode]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      //  CALL BACKEND WITH CURRENT MODE
      const response = await askBackend(content, mode);

      if (response.error) {
        throw new Error(response.error);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: response.answer,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Unable to get response",
        description:
          error instanceof Error
            ? error.message
            : "Please try again later.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content:
          "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* HEADER */}
      <ChatHeader mode={mode} onModeChange={setMode} />

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            role={message.role}
            timestamp={message.timestamp}
          />
        ))}

        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {showSuggestions && (
        <SuggestionChips
          onSelectSuggestion={handleSendMessage}
          disabled={isLoading}
        />
      )}

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatWindow;
