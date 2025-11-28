import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex items-end gap-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your banking question..."
          className="min-h-[48px] max-h-32 resize-none rounded-xl border-border bg-background focus-visible:ring-primary"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          size="icon"
          className="h-12 w-12 rounded-xl shrink-0 bg-primary hover:bg-tees-blue-dark transition-colors"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        TEES Bank Assist uses AI to help answer your banking questions.
      </p>
    </div>
  );
};

export default ChatInput;
