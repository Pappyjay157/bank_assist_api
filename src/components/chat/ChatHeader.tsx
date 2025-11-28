import { Building2, Shield } from "lucide-react";

const ChatHeader = () => {
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
      <div className="flex items-center gap-2 text-primary-foreground/80 text-xs">
        <Shield className="w-4 h-4" />
        <span>Secure Chat</span>
      </div>
    </header>
  );
};

export default ChatHeader;
