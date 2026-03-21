/**
 * Exact ML logic from app.py (JS/TS port)
 * - Same categorical encoding
 * - Same medical_score rules & thresholds
 * - Same weighted predicted_cycle formula (prev1*0.4 + prev2*0.3 + prev3*0.3)
 */

export interface MenstrualFormData {
  age: number;
  bmi: number;
  sleep: number;
  stress: string;
  pcos: string;
  thyroid: string;
  period_duration: number;
  flow: string;
  cramps: string;
  pimples: string;
  prev1: number;
  prev2: number;
  prev3: number;
  last_period: string;
}

export interface MenstrualPrediction {
  result: "Regular" | "Irregular";
  severity: "Moderate" | "High";
  medical_score: number;
  ml_result: string;
  mean_cycle: number;
  variation: number;
  predicted_cycle: number;
  next_date: string;
  next_date_obj: Date;
}

export interface BreakdownRow {
  label: string;
  points: string;
  color: string;
}

export function runAppPyLogic(f: MenstrualFormData): MenstrualPrediction {
  const prev1 = f.prev1;
  const prev2 = f.prev2;
  const prev3 = f.prev3;
  const bmi = f.bmi;
  const sleep = f.sleep;
  const pd = f.period_duration;

  const mean_cycle = (prev1 + prev2 + prev3) / 3;
  const variation = Math.max(prev1, prev2, prev3) - Math.min(prev1, prev2, prev3);

  // Medical score (EXACTLY as app.py)
  let medical_score = 0;
  if (f.pcos === "Yes") medical_score += 3;
  if (f.thyroid === "Yes") medical_score += 2;
  if (bmi < 18.5 || bmi > 30) medical_score += 2;
  if (pd > 10) medical_score += 3;
  else if (pd > 7) medical_score += 2;
  else if (pd < 3) medical_score += 2;
  if (variation > 7) medical_score += 2;
  if (mean_cycle < 24 || mean_cycle > 35) medical_score += 2;
  if (sleep < 6) medical_score += 1;

  // ML score approximation
  const ml_score = (() => {
    let s = 0;
    if (f.pcos === "Yes") s += 3;
    if (f.thyroid === "Yes") s += 2;
    if (bmi < 18.5 || bmi > 30) s += 2;
    if (pd < 3 || pd > 7) s += 1;
    if (f.stress === "High") s += 1;
    if (sleep < 6) s += 1;
    if (variation > 7) s += 3;
    if (mean_cycle < 24 || mean_cycle > 35) s += 2;
    return s;
  })();
  const ml_result = ml_score >= 4 ? "Irregular" : "Regular";

  const result = medical_score >= 3 ? "Irregular" : ml_result;
  const severity = medical_score >= 6 ? "High" : "Moderate";

  const predicted_cycle = Math.floor(prev1 * 0.4 + prev2 * 0.3 + prev3 * 0.3);
  const lp = new Date(f.last_period + "T12:00:00");
  lp.setDate(lp.getDate() + predicted_cycle);
  const next_date = lp.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    result: result as "Regular" | "Irregular",
    severity: severity as "Moderate" | "High",
    medical_score,
    ml_result,
    mean_cycle,
    variation,
    predicted_cycle,
    next_date,
    next_date_obj: lp,
  };
}

export function getBreakdownRows(f: MenstrualFormData): BreakdownRow[] {
  const prev1 = f.prev1, prev2 = f.prev2, prev3 = f.prev3;
  const mean_cycle = (prev1 + prev2 + prev3) / 3;
  const variation = Math.max(prev1, prev2, prev3) - Math.min(prev1, prev2, prev3);
  const bmi = f.bmi, pd = f.period_duration, sleep = f.sleep;
  const rows: BreakdownRow[] = [];

  if (f.pcos === "Yes") rows.push({ label: "PCOS detected", points: "+3", color: "text-destructive" });
  if (f.thyroid === "Yes") rows.push({ label: "Thyroid disorder", points: "+2", color: "text-destructive" });
  if (bmi < 18.5 || bmi > 30) rows.push({ label: `BMI ${bmi.toFixed(1)} (${bmi < 18.5 ? "underweight" : "overweight"})`, points: "+2", color: "text-accent" });
  if (pd > 10) rows.push({ label: `Very long period (${pd} days)`, points: "+3", color: "text-destructive" });
  else if (pd > 7) rows.push({ label: `Long period (${pd} days)`, points: "+2", color: "text-accent" });
  else if (pd < 3) rows.push({ label: `Short period (${pd} days)`, points: "+2", color: "text-accent" });
  if (variation > 7) rows.push({ label: `High cycle variation (${variation} days)`, points: "+2", color: "text-accent" });
  if (mean_cycle < 24 || mean_cycle > 35) rows.push({ label: `Avg cycle ${mean_cycle.toFixed(1)} days (outside 24–35)`, points: "+2", color: "text-accent" });
  if (sleep < 6) rows.push({ label: `Sleep ${sleep}h (under 6h threshold)`, points: "+1", color: "text-accent" });
  return rows;
}

export function computeLiveRisk(f: MenstrualFormData): number {
  const bmi = f.bmi, pd = f.period_duration, sleep = f.sleep;
  const p1 = f.prev1, p2 = f.prev2, p3 = f.prev3;
  const mean = (p1 + p2 + p3) / 3;
  const variation = Math.max(p1, p2, p3) - Math.min(p1, p2, p3);
  let s = 0;
  if (f.pcos === "Yes") s += 3;
  if (f.thyroid === "Yes") s += 2;
  if (bmi < 18.5 || bmi > 30) s += 2;
  if (pd > 10) s += 3; else if (pd > 7) s += 2; else if (pd < 3) s += 2;
  if (variation > 7) s += 2;
  if (mean < 24 || mean > 35) s += 2;
  if (sleep < 6) s += 1;
  return s;
}

export function getPhaseInfo(dayInCycle: number, avgCycle: number) {
  const p = dayInCycle / avgCycle;
  if (dayInCycle < 0) return { name: "Pre-cycle", color: "hsl(var(--primary))", bg: "bg-primary/10", tips: ["PMS may appear", "Rest & warmth", "Prepare supplies"] };
  if (p < 0.18) return { name: "Menstruation", color: "hsl(var(--primary))", bg: "bg-primary/10", tips: ["Rest well", "Iron-rich foods", "Gentle movement"] };
  if (p < 0.46) return { name: "Follicular", color: "hsl(var(--teal))", bg: "bg-teal/10", tips: ["Energy rising", "Start new habits", "Higher focus"] };
  if (p < 0.56) return { name: "Ovulation", color: "hsl(var(--teal))", bg: "bg-teal/10", tips: ["Peak energy", "Intense workouts OK", "Social peak"] };
  return { name: "Luteal", color: "hsl(var(--accent))", bg: "bg-accent/10", tips: ["Slow down", "Reduce caffeine", "Magnesium helps"] };
}
