import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const suggestions = [
  "Why is my cycle delayed?",
  "How to manage PCOS naturally?",
  "Tips for better sleep during menopause",
];

export const AskAIBox = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (text: string) => {
    if (!text.trim()) return;
    navigate(`/chatbot?q=${encodeURIComponent(text)}`);
  };

  return (
    <Card className="border-border/60 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-heading text-sm sm:text-base font-semibold text-foreground">Ask NaariCare AI</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Personalized answers about women's health</div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(q);
          }}
          className="flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask a health question..."
            className="flex-1 h-10 px-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm"
          />
          <button
            type="submit"
            aria-label="Send"
            className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
