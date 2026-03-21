import { useState } from "react";
import { MenstrualFormData, computeLiveRisk } from "@/lib/menstrual-ml";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  User, Droplets, Heart, CalendarIcon, Check, ArrowRight, ArrowLeft, Loader2, AlertTriangle, ShieldCheck, Activity,
} from "lucide-react";

const STEPS = [
  { id: "personal", label: "Personal", icon: User, desc: "Basic health profile" },
  { id: "cycle", label: "Cycle", icon: Droplets, desc: "Menstrual details" },
  { id: "health", label: "Health", icon: Heart, desc: "Medical conditions" },
  { id: "history", label: "History", icon: CalendarIcon, desc: "Past cycle data" },
];

interface AssessmentFormProps {
  form: MenstrualFormData;
  setField: (key: keyof MenstrualFormData, value: MenstrualFormData[keyof MenstrualFormData]) => void;
  onSubmit: () => void;
  loading: boolean;
}

function ChipSelect({ options, value, onChange }: { options: { label: string; value: string; emoji?: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200",
            value === o.value
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
              : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5"
          )}
        >
          {o.emoji && <span className="mr-1.5">{o.emoji}</span>}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function RiskGaugeInline({ score }: { score: number }) {
  const maxScore = 15;
  const pct = Math.min(100, (score / maxScore) * 100);
  const color = score < 3 ? "hsl(var(--teal))" : score < 6 ? "hsl(var(--accent))" : "hsl(var(--destructive))";
  const label = score < 3 ? "Low Risk" : score < 6 ? "Moderate" : "High Risk";
  const textColor = score < 3 ? "text-teal" : score < 6 ? "text-accent" : "text-destructive";
  const bgColor = score < 3 ? "bg-teal/10" : score < 6 ? "bg-accent/10" : "bg-destructive/10";

  return (
    <div className={cn("rounded-xl p-4 border transition-all duration-500", bgColor, 
      score < 3 ? "border-teal/20" : score < 6 ? "border-accent/20" : "border-destructive/20"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className={cn("w-4 h-4", textColor)} />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Risk Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-2xl font-heading font-bold", textColor)}>{score}</span>
          <span className="text-xs text-muted-foreground">/ {maxScore}</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-background overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className={cn("text-xs font-medium", textColor)}>{label}</span>
        <span className="text-[10px] text-muted-foreground">
          {score < 3 ? "Cycle likely regular" : score < 6 ? "Possible irregularity" : "Irregularity very likely"}
        </span>
      </div>
    </div>
  );
}

function BMIIndicator({ bmi }: { bmi: number }) {
  const getStatus = () => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-accent", bg: "bg-accent/10" };
    if (bmi <= 25) return { label: "Healthy", color: "text-teal", bg: "bg-teal/10" };
    if (bmi <= 30) return { label: "Overweight", color: "text-accent", bg: "bg-accent/10" };
    return { label: "Obese", color: "text-destructive", bg: "bg-destructive/10" };
  };
  const status = getStatus();
  const pct = Math.min(100, ((bmi - 14) / (45 - 14)) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">BMI Status</span>
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", status.color, status.bg)}>{status.label}</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--teal)), hsl(var(--teal)), hsl(var(--accent)), hsl(var(--destructive)))" }}>
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background shadow-md transition-all duration-300" style={{ left: `calc(${pct}% - 6px)` }} />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>14</span><span>18.5</span><span>25</span><span>30</span><span>45</span>
      </div>
      {(bmi < 18.5 || bmi > 30) && (
        <p className="text-[10px] text-accent flex items-center gap-1 mt-1">
          <AlertTriangle className="w-3 h-3" /> BMI outside healthy range — adds +2 to medical score
        </p>
      )}
    </div>
  );
}

export function AssessmentForm({ form, setField, onSubmit, loading }: AssessmentFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const stepOK = [
    !!form.stress,
    !!form.flow && !!form.cramps && !!form.pimples,
    !!form.pcos && !!form.thyroid,
    !!form.last_period,
  ];

  const riskScore = computeLiveRisk(form);
  const completedSteps = stepOK.filter(Boolean).length;
  const progressPct = (completedSteps / 4) * 100;

  return (
    <div className="space-y-4">
      {/* Step Indicator with progress */}
      <div className="space-y-3">
        <div className="flex items-center max-w-md mx-auto">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => {
                  // Allow clicking completed or current step
                  if (i <= currentStep || stepOK.slice(0, i).every(Boolean)) setCurrentStep(i);
                }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 border-2",
                  i < currentStep ? "bg-teal text-teal-foreground border-teal shadow-md shadow-teal/20" :
                  i === currentStep ? "bg-primary text-primary-foreground border-primary ring-4 ring-primary/15 shadow-md shadow-primary/20" :
                  "bg-card border-border text-muted-foreground group-hover:border-primary/30"
                )}>
                  {i < currentStep ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={cn("text-[10px] font-semibold mt-1.5 uppercase tracking-wider transition-colors",
                  i === currentStep ? "text-primary" : i < currentStep ? "text-teal" : "text-muted-foreground"
                )}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-0.5 mb-5 mx-2 rounded-full transition-all duration-500",
                  i < currentStep ? "bg-teal" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>
        {/* Overall progress bar */}
        <div className="relative h-1 bg-border/50 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-teal rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Step {currentStep + 1} of 4 · <span className="font-medium text-foreground">{STEPS[currentStep].desc}</span>
        </p>
      </div>

      {/* Live Risk Gauge */}
      <RiskGaugeInline score={riskScore} />

      {/* Step 0: Personal */}
      {currentStep === 0 && (
        <Card className="animate-fade-up border-primary/10 shadow-md">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground">Personal Information</h3>
                <p className="text-xs text-muted-foreground">Tell us about your basic health profile</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    🎂 Age
                  </Label>
                  <span className="font-heading text-xl font-bold text-primary">{form.age} <span className="text-sm font-normal text-muted-foreground">years</span></span>
                </div>
                <Slider min={13} max={55} step={1} value={[form.age]} onValueChange={([v]) => setField("age", v)} className="py-1" />
                <div className="flex justify-between text-[9px] text-muted-foreground"><span>13</span><span>55</span></div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    ⚖️ BMI
                  </Label>
                  <span className="font-heading text-xl font-bold text-primary">{form.bmi.toFixed(1)}</span>
                </div>
                <Slider min={14} max={45} step={0.1} value={[form.bmi]} onValueChange={([v]) => setField("bmi", parseFloat(v.toFixed(1)))} className="py-1" />
                <BMIIndicator bmi={form.bmi} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    😴 Sleep Hours
                  </Label>
                  <span className="font-heading text-xl font-bold text-primary">{form.sleep}<span className="text-sm font-normal text-muted-foreground">h</span></span>
                </div>
                <Slider min={3} max={12} step={0.5} value={[form.sleep]} onValueChange={([v]) => setField("sleep", v)} className="py-1" />
                <div className="flex justify-between text-[9px] text-muted-foreground"><span>3h</span><span>12h</span></div>
                {form.sleep < 6 && (
                  <p className="text-[10px] text-accent flex items-center gap-1 bg-accent/5 px-2 py-1 rounded-lg">
                    <AlertTriangle className="w-3 h-3" /> Sleep under 6h — adds +1 to medical score
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  😰 Stress Level
                </Label>
                <ChipSelect
                  options={[
                    { label: "Low", value: "Low", emoji: "😌" },
                    { label: "Medium", value: "Medium", emoji: "😐" },
                    { label: "High", value: "High", emoji: "😫" },
                  ]}
                  value={form.stress}
                  onChange={(v) => setField("stress", v)}
                />
              </div>
            </div>

            <Button className="w-full h-12 text-base shadow-lg shadow-primary/20" onClick={() => setCurrentStep(1)} disabled={!stepOK[0]}>
              Next: Cycle Details <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Cycle */}
      {currentStep === 1 && (
        <Card className="animate-fade-up border-primary/10 shadow-md">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
                <Droplets className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground">Menstrual Details</h3>
                <p className="text-xs text-muted-foreground">Your current cycle characteristics</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold">📅 Period Duration</Label>
                  <span className="font-heading text-xl font-bold text-primary">{form.period_duration} <span className="text-sm font-normal text-muted-foreground">days</span></span>
                </div>
                <Slider min={1} max={15} step={1} value={[form.period_duration]} onValueChange={([v]) => setField("period_duration", v)} className="py-1" />
                <div className="flex justify-between text-[9px] text-muted-foreground"><span>1 day</span><span>15 days</span></div>
                {form.period_duration > 10 && <p className="text-[10px] text-destructive flex items-center gap-1 bg-destructive/5 px-2 py-1 rounded-lg"><AlertTriangle className="w-3 h-3" /> &gt;10 days — adds +3 to score</p>}
                {form.period_duration > 7 && form.period_duration <= 10 && <p className="text-[10px] text-accent flex items-center gap-1 bg-accent/5 px-2 py-1 rounded-lg"><AlertTriangle className="w-3 h-3" /> 7–10 days — adds +2</p>}
                {form.period_duration < 3 && <p className="text-[10px] text-accent flex items-center gap-1 bg-accent/5 px-2 py-1 rounded-lg"><AlertTriangle className="w-3 h-3" /> &lt;3 days — adds +2</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider font-semibold">💧 Flow Type</Label>
                <ChipSelect
                  options={[
                    { label: "Light", value: "Light", emoji: "💧" },
                    { label: "Medium", value: "Medium", emoji: "💧💧" },
                    { label: "Heavy", value: "Heavy", emoji: "💧💧💧" },
                  ]}
                  value={form.flow} onChange={(v) => setField("flow", v)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider font-semibold">🤕 Cramps Severity</Label>
                <ChipSelect
                  options={[
                    { label: "Low", value: "Low", emoji: "🟢" },
                    { label: "Medium", value: "Medium", emoji: "🟡" },
                    { label: "High", value: "High", emoji: "🔴" },
                  ]}
                  value={form.cramps} onChange={(v) => setField("cramps", v)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider font-semibold">Pimples around period</Label>
                <ChipSelect
                  options={[{ label: "Yes", value: "Yes", emoji: "😟" }, { label: "No", value: "No", emoji: "😊" }]}
                  value={form.pimples} onChange={(v) => setField("pimples", v)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setCurrentStep(0)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button className="flex-[2] h-12 text-base shadow-lg shadow-primary/20" onClick={() => setCurrentStep(2)} disabled={!stepOK[1]}>
                Next: Health <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Health */}
      {currentStep === 2 && (
        <Card className="animate-fade-up border-primary/10 shadow-md">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground">Health Conditions</h3>
                <p className="text-xs text-muted-foreground">Medical conditions that affect your cycle</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏥</span>
                  <Label className="text-sm font-semibold">PCOS (Polycystic Ovary Syndrome)</Label>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">PCOS affects hormone levels and can cause irregular periods, weight gain, and acne.</p>
                <ChipSelect options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]} value={form.pcos} onChange={(v) => setField("pcos", v)} />
                {form.pcos === "Yes" && (
                  <p className="text-[10px] text-destructive flex items-center gap-1 bg-destructive/5 px-2 py-1 rounded-lg">
                    <AlertTriangle className="w-3 h-3" /> PCOS detected — adds +3 to medical score
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🦋</span>
                  <Label className="text-sm font-semibold">Thyroid Disorder</Label>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Thyroid imbalances can cause heavier, lighter, or irregular periods.</p>
                <ChipSelect options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]} value={form.thyroid} onChange={(v) => setField("thyroid", v)} />
                {form.thyroid === "Yes" && (
                  <p className="text-[10px] text-destructive flex items-center gap-1 bg-destructive/5 px-2 py-1 rounded-lg">
                    <AlertTriangle className="w-3 h-3" /> Thyroid disorder — adds +2 to medical score
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button className="flex-[2] h-12 text-base shadow-lg shadow-primary/20" onClick={() => setCurrentStep(3)} disabled={!stepOK[2]}>
                Next: History <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: History */}
      {currentStep === 3 && (
        <Card className="animate-fade-up border-primary/10 shadow-md">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground">Cycle History</h3>
                <p className="text-xs text-muted-foreground">Enter your last 3 cycle lengths for accurate prediction</p>
              </div>
            </div>

            <div>
              <Label className="text-[11px] uppercase tracking-wider font-semibold mb-3 block">Previous Cycle Lengths (days)</Label>
              <div className="grid grid-cols-3 gap-3">
                {([["prev1", "Cycle 1", "Most recent"], ["prev2", "Cycle 2", "Previous"], ["prev3", "Cycle 3", "Oldest"]] as const).map(([key, label, sub]) => (
                  <div key={key} className="space-y-1.5 text-center">
                    <div className="text-xs font-medium text-foreground">{label}</div>
                    <Input
                      type="number"
                      min={18}
                      max={50}
                      value={form[key]}
                      onChange={(e) => setField(key, parseInt(e.target.value) || 28)}
                      className="text-center font-heading text-2xl font-bold text-primary h-14 border-primary/20 focus:border-primary"
                    />
                    <span className="text-[9px] text-muted-foreground">{sub}</span>
                  </div>
                ))}
              </div>
              {(() => {
                const avg = Math.round((form.prev1 + form.prev2 + form.prev3) / 3);
                const v = Math.max(form.prev1, form.prev2, form.prev3) - Math.min(form.prev1, form.prev2, form.prev3);
                return (
                  <div className="mt-3 flex gap-3">
                    <div className="flex-1 text-center p-2 rounded-lg bg-primary/5">
                      <div className="text-lg font-heading font-bold text-primary">{avg}d</div>
                      <div className="text-[9px] text-muted-foreground uppercase">Average</div>
                    </div>
                    <div className={cn("flex-1 text-center p-2 rounded-lg", v > 7 ? "bg-accent/10" : "bg-teal/5")}>
                      <div className={cn("text-lg font-heading font-bold", v > 7 ? "text-accent" : "text-teal")}>{v}d</div>
                      <div className="text-[9px] text-muted-foreground uppercase">Variation</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                📅 Last Period Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn(
                    "w-full justify-start text-left font-normal h-12 border-primary/20",
                    !form.last_period && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {form.last_period ? format(new Date(form.last_period + "T12:00:00"), "PPP") : "Select your last period date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.last_period ? new Date(form.last_period + "T12:00:00") : undefined}
                    onSelect={(d) => d && setField("last_period", format(d, "yyyy-MM-dd"))}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {form.last_period && (
                <p className="text-xs text-teal flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Date set — ready to predict!
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                className="flex-[2] h-14 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all"
                onClick={onSubmit}
                disabled={!stepOK[3] || loading}
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Analyzing your cycle...</>
                ) : (
                  <>🔮 Predict My Cycle <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
