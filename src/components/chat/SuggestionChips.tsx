interface SuggestionChipsProps {
  onSelectSuggestion: (suggestion: string) => void;
  disabled?: boolean;
}

const suggestions = [
  "How do I reset my PIN?",
  "What are the interest rates?",
  "Report lost card",
  "Bank hours",
];

const SuggestionChips = ({ onSelectSuggestion, disabled }: SuggestionChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center px-4 py-3">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelectSuggestion(suggestion)}
          disabled={disabled}
          className="px-3 py-1.5 text-xs rounded-full bg-tees-blue-light text-tees-blue hover:bg-accent transition-colors border border-tees-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SuggestionChips;
