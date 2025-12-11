import { Building2, Shield } from "lucide-react";
import { useState } from "react";

interface ChatHeaderProps {
  mode: "RAG" | "API";
  onModeChange: (mode: "RAG" | "API") => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ mode,onModeChange }) => {

  const handleToggle = () => {
    const newMode = mode === "RAG" ? "API" : "RAG";
    onModeChange(newMode);
  };

  return (
    <header className="tees-gradient-header px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-primary-foreground">
            TEES Bank Assist
          </h1>
          <p className="text-xs text-primary-foreground/80">
            Your 24/7 Banking Assistant
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Secure Chat info */}
        <div className="flex items-center gap-2 text-primary-foreground/80 text-xs">
          <Shield className="w-4 h-4" />
          <span>Secure Chat</span>
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className="px-3 py-1 rounded-full border border-primary-foreground/50 bg-primary-foreground/10 text-primary-foreground text-xs font-medium hover:bg-primary-foreground/20 transition"
        >
          {mode === "RAG" ? "RAG Mode" : "API Mode"}
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
