import { MenstrualPrediction, MenstrualFormData, getBreakdownRows } from "@/lib/menstrual-ml";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, CheckCircle2, RotateCcw, Apple, Dumbbell, Moon, 
  Stethoscope, TrendingUp, Calendar, Activity, ArrowRight, Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MenstrualResultsProps {
  prediction: MenstrualPrediction;
  form: MenstrualFormData;
  apiUsed: boolean;
  onReset: () => void;
}

function ScoreRing({ score, maxScore = 15 }: { score: number; maxScore?: number }) {
  const pct = Math.min(1, score / maxScore);
  const r = 40, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = score < 3 ? "hsl(var(--teal))" : score < 6 ? "hsl(var(--accent))" : "hsl(var(--destructive))";
  const label = score < 3 ? "Low" : score < 6 ? "Moderate" : "High";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="6" opacity="0.3" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">score</span>
        </div>
      </div>
      <span className="text-[11px] font-semibold mt-1" style={{ color }}>{label} Risk</span>
    </div>
  );
}

export function MenstrualResults({ prediction, form, apiUsed, onReset }: MenstrualResultsProps) {
  const navigate = useNavigate();
  const isRegular = prediction.result === "Regular";
  const breakdown = getBreakdownRows(form);

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Source badge */}
      <div className="flex justify-center">
        <Badge variant="secondary" className={cn(
          "text-[11px] px-3 py-1",
          apiUsed ? "bg-teal/10 text-teal border-teal/20" : "bg-muted text-muted-foreground"
        )}>
          <Sparkles className="w-3 h-3 mr-1" />
          {apiUsed ? "ML API Prediction" : "Local Analysis"}
        </Badge>
      </div>

      {/* Hero Result Card */}
      <div className={cn(
        "relative rounded-2xl p-6 text-center overflow-hidden border shadow-lg",
        isRegular
          ? "bg-gradient-to-br from-teal/8 via-background to-teal/5 border-teal/20 shadow-teal/10"
          : "bg-gradient-to-br from-primary/8 via-background to-primary/5 border-primary/20 shadow-primary/10"
      )}>
        {/* Background decoration */}
        <div className={cn("absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-[0.06]", isRegular ? "bg-teal" : "bg-primary")} />

        <Badge variant="secondary" className={cn(
          "mb-3 px-4 py-1.5 text-sm font-semibold",
          isRegular ? "bg-teal/15 text-teal border-teal/20" : "bg-primary/15 text-primary border-primary/20"
        )}>
          {isRegular ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <AlertTriangle className="w-4 h-4 mr-1.5" />}
          {prediction.result} Cycle
          {!isRegular && ` · ${prediction.severity}`}
        </Badge>

        <h2 className={cn("font-heading text-3xl font-bold mb-2", isRegular ? "text-teal" : "text-primary")}>
          {isRegular ? "Looking Great! ✨" : "Needs Attention ⚠️"}
        </h2>
        <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto leading-relaxed">
          {isRegular
            ? "Your menstrual cycle appears healthy and regular."
            : `Your cycle shows irregularity with ${prediction.severity.toLowerCase()} severity.`}
        </p>

        {/* Next period card */}
        <div className="inline-flex flex-col items-center bg-card/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-md border border-border/50">
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5 font-semibold">
            📅 Next Period Expected
          </span>
          <span className="font-heading text-xl font-bold text-foreground">{prediction.next_date}</span>
          <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> ~{prediction.predicted_cycle} day cycle
          </span>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-primary/10">
          <CardContent className="p-3 text-center">
            <ScoreRing score={prediction.medical_score} />
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardContent className="p-3 flex flex-col items-center justify-center h-full gap-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="font-heading text-xl font-bold text-primary">{prediction.predicted_cycle}d</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Predicted</div>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardContent className="p-3 flex flex-col items-center justify-center h-full gap-1">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-accent" />
            </div>
            <div className={cn("font-heading text-xl font-bold", prediction.variation > 7 ? "text-accent" : "text-teal")}>
              {prediction.variation}d
            </div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Variation</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card className="border-primary/10">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            📊 Analysis Summary
          </h3>
          <div className="space-y-2">
            {[
              { label: "Cycle Status", value: prediction.result, ok: isRegular },
              { label: "Avg Cycle", value: `${prediction.mean_cycle.toFixed(1)} days`, ok: prediction.mean_cycle >= 24 && prediction.mean_cycle <= 35 },
              { label: "ML Result", value: prediction.ml_result, ok: prediction.ml_result === "Regular" },
              { label: "Severity", value: prediction.severity, ok: prediction.severity === "Moderate" },
            ].map(m => (
              <div key={m.label} className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <Badge variant="secondary" className={cn(
                  "text-xs font-semibold",
                  m.ok ? "bg-teal/10 text-teal" : "bg-primary/10 text-primary"
                )}>{m.value}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Breakdown */}
      {breakdown.length > 0 && (
        <Card className="border-primary/10">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              🔍 What's Contributing to Your Score
            </h3>
            <div className="space-y-1">
              {breakdown.map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className={cn("font-bold text-sm px-2.5 py-0.5 rounded-lg", row.color,
                    row.color === "text-destructive" ? "bg-destructive/10" : "bg-accent/10"
                  )}>{row.points}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">Total Score</span>
              <span className="font-heading text-xl font-bold text-primary">{prediction.medical_score}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor Alert */}
      {!isRegular && (
        <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/15">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive mb-1">🩺 Consult a Specialist</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Irregular cycles can indicate PCOS, thyroid issues, or hormonal imbalances. A gynecologist can help.
              </p>
              <Button 
                size="sm" 
                onClick={() => navigate("/doctors?source=menstrual")}
                className="gap-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Find Doctors <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 px-1">
          💡 Personalized Tips
        </h3>
        <div className="space-y-3">
          {[
            {
              icon: Apple, title: "🥗 Diet", borderColor: "border-teal/15", dotColor: "bg-teal",
              items: isRegular 
                ? ["Maintain balanced iron-rich diet", "Stay hydrated (2L+ water daily)", "Include leafy greens and fruits"]
                : ["Iron-rich foods (spinach, lentils, dates)", "Lean protein in every meal", "Reduce refined sugar & processed food", "Anti-inflammatory foods (turmeric, berries)"],
            },
            {
              icon: Dumbbell, title: "🏃‍♀️ Exercise", borderColor: "border-accent/15", dotColor: "bg-accent",
              items: isRegular
                ? ["Continue regular activity", "30min daily movement", "Mix cardio with strength training"]
                : ["30min daily walking or yoga", "Light strength training 3x/week", "Gentle movement during period", "Avoid over-exercising"],
            },
            {
              icon: Moon, title: "🌙 Lifestyle", borderColor: "border-primary/15", dotColor: "bg-primary",
              items: isRegular
                ? ["Maintain 7-8 hours sleep", "Keep stress managed", "Track your cycle monthly"]
                : ["Sleep 7–8 hours at fixed times", "Stress reduction (meditation, yoga)", "Track symptoms & cycle monthly", "Avoid caffeine & alcohol excess"],
            },
          ].map((rec) => (
            <Card key={rec.title} className={cn("border overflow-hidden", rec.borderColor)}>
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2.5">{rec.title}</h4>
                <ul className="space-y-2">
                  {rec.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5", rec.dotColor)} />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-3 items-start p-3.5 rounded-xl bg-accent/5 border border-accent/15">
        <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-semibold text-accent">Disclaimer:</span> This AI prediction is for educational purposes only and does not replace professional medical advice.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 h-12" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" /> New Assessment
        </Button>
        <Button 
          className="flex-1 h-12 shadow-lg shadow-primary/20" 
          onClick={() => navigate("/doctors?source=menstrual")}
        >
          Find Doctors <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}