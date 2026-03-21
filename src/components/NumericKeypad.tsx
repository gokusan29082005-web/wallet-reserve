import { Delete } from "lucide-react";

interface NumericKeypadProps {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}

export function NumericKeypad({ onDigit, onBackspace, disabled }: NumericKeypadProps) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
      {keys.map((key, i) => {
        if (key === "") return <div key={i} />;
        if (key === "⌫") {
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={onBackspace}
              className="flex h-14 items-center justify-center rounded-xl bg-secondary text-foreground text-lg font-medium transition-all duration-150 hover:bg-secondary/80 active:scale-95 disabled:opacity-40"
            >
              <Delete className="h-5 w-5" />
            </button>
          );
        }
        return (
          <button
            key={i}
            disabled={disabled}
            onClick={() => onDigit(key)}
            className="flex h-14 items-center justify-center rounded-xl bg-card border border-border text-foreground text-xl font-semibold transition-all duration-150 hover:bg-secondary active:scale-95 disabled:opacity-40 shadow-sm"
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
