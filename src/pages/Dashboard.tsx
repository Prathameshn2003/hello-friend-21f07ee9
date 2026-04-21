import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Activity, Droplets, Thermometer, Sun, Moon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCycleTracking } from "@/hooks/useCycleTracking";
import { useHealthAssessments } from "@/hooks/useHealthAssessments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, parseISO, format } from "date-fns";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AIInsightHero } from "@/components/dashboard/AIInsightHero";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { HealthOverviewCards, HealthCard } from "@/components/dashboard/HealthOverviewCards";
import { CycleChart } from "@/components/dashboard/CycleChart";
import { HealthScoreRing } from "@/components/dashboard/HealthScoreRing";
import { TodaySnapshot, SnapshotItem } from "@/components/dashboard/TodaySnapshot";
import { RecentActivity, ActivityItem } from "@/components/dashboard/RecentActivity";
import { AskAIBox } from "@/components/dashboard/AskAIBox";
import { CycleCalendar } from "@/components/menstrual/CycleCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

const getRiskColor = (category: string | null) => {
  if (!category) return "text-muted-foreground";
  const lower = category.toLowerCase();
  if (lower === "high" || lower === "severe") return "text-destructive";
  if (lower === "moderate" || lower === "medium") return "text-warning";
  return "text-success";
};

const getRiskLabel = (category: string | null) => {
  if (!category) return null;
  const lower = category.toLowerCase();
  if (lower === "high" || lower === "severe") return "🔴 High Risk";
  if (lower === "moderate" || lower === "medium") return "🟠 Moderate Risk";
  if (lower === "low" || lower === "none") return "🟢 Low Risk";
  return category;
};

const getMenopauseStage = (category: string | null) => {
  if (!category) return null;
  const lower = category.toLowerCase();
  if (lower === "high") return "Post-Menopause";
  if (lower === "medium" || lower === "moderate") return "Peri-Menopause";
  return "Pre-Menopause";
};

const Dashboard = () => {
  const { user } = useAuth();
  const { cycleLogs, loading: cycleLoading, insights, prediction } = useCycleTracking();
  const { pcosAssessment, menopauseAssessment, menstrualAssessment, loading: assessmentLoading } = useHealthAssessments();

  const { data: latestPrediction } = useQuery({
    queryKey: ["cycle-predictions", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("cycle_predictions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: recentDocs } = useQuery({
    queryKey: ["dashboard-documents", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("documents")
        .select("id, file_name, uploaded_at")
        .eq("user_id", user!.id)
        .order("uploaded_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
    enabled: !!user,
  });

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "there";
  const loading = cycleLoading || assessmentLoading;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", icon: Sun };
    if (hour < 18) return { text: "Good afternoon", icon: Sun };
    return { text: "Good evening", icon: Moon };
  }, []);

  const cycleData = useMemo(() => {
    if (cycleLogs.length === 0) return { currentDay: null, cycleLength: 28, phase: "unknown", lastPeriod: "" };
    const latestCycle = cycleLogs[0];
    const cycleStart = parseISO(latestCycle.start_date);
    const today = new Date();
    const dayOfCycle = differenceInDays(today, cycleStart) + 1;
    const cycleLength = insights.averageCycleLength || 28;
    return {
      currentDay: dayOfCycle > 0 && dayOfCycle <= cycleLength ? dayOfCycle : null,
      cycleLength,
      phase: "follicular",
      lastPeriod: latestCycle.start_date,
    };
  }, [cycleLogs, insights]);

  const menstrualPredictedDate = useMemo(() => {
    if (latestPrediction?.predicted_start_date) {
      const parsed = parseISO(latestPrediction.predicted_start_date);
      const daysUntil = differenceInDays(parsed, new Date());
      return { date: format(parsed, "dd MMM yyyy"), daysUntil: daysUntil > 0 ? daysUntil : 0 };
    }
    if (prediction?.predicted_start_date) {
      return { date: format(parseISO(prediction.predicted_start_date), "dd MMM yyyy"), daysUntil: prediction.days_until };
    }
    return null;
  }, [latestPrediction, prediction]);

  // Build AI insight
  const aiInsight = useMemo(() => {
    const parts: string[] = [];
    if (insights.regularity) parts.push(`Your cycle is ${insights.regularity}.`);
    if (pcosAssessment?.risk_category) {
      const lower = pcosAssessment.risk_category.toLowerCase();
      if (lower === "high") parts.push("PCOS risk is high — consider consulting a doctor.");
      else if (lower === "moderate" || lower === "medium") parts.push("PCOS risk is moderate — lifestyle monitoring recommended.");
      else parts.push("PCOS indicators look good.");
    }
    if (parts.length === 0) return "Complete an assessment to get personalized AI insights about your health.";
    return parts.join(" ");
  }, [insights, pcosAssessment]);

  const alertText = menstrualPredictedDate?.daysUntil != null && menstrualPredictedDate.daysUntil <= 30
    ? `Next period in ~${menstrualPredictedDate.daysUntil} days (${menstrualPredictedDate.date})`
    : null;

  const healthCards: HealthCard[] = useMemo(() => {
    const pcosRiskLabel = pcosAssessment ? getRiskLabel(pcosAssessment.risk_category) : null;
    const pcosScore = pcosAssessment?.risk_score != null ? Math.round(100 - pcosAssessment.risk_score) : null;
    const menopauseStage = menopauseAssessment ? getMenopauseStage(menopauseAssessment.risk_category) : null;
    const menstrualStatus = menstrualAssessment
      ? menstrualAssessment.risk_category === "low" ? "🟢 Regular" : "🟠 Irregular"
      : cycleData.currentDay ? `Day ${cycleData.currentDay} of Cycle` : null;

    return [
      {
        title: "Menstrual Health",
        status: menstrualStatus || "Start tracking",
        statusColor: menstrualAssessment ? getRiskColor(menstrualAssessment.risk_category) : (cycleData.currentDay ? "text-teal" : "text-muted-foreground"),
        icon: Droplets,
        iconBg: "bg-teal/15",
        iconColor: "text-teal",
        path: "/modules/menstrual",
        hasData: !!menstrualAssessment || cycleLogs.length > 0,
        predictedDate: menstrualPredictedDate?.date || null,
        daysUntil: menstrualPredictedDate?.daysUntil ?? null,
        metric: null,
        metricLabel: null,
      },
      {
        title: "PCOS Risk",
        status: pcosRiskLabel,
        statusColor: pcosAssessment ? getRiskColor(pcosAssessment.risk_category) : "text-muted-foreground",
        icon: Activity,
        iconBg: "bg-accent/15",
        iconColor: "text-accent",
        path: "/modules/pcos",
        metric: pcosScore != null ? `${pcosScore}%` : null,
        metricLabel: "Health Score",
        hasData: !!pcosAssessment,
        predictedDate: null,
        daysUntil: null,
      },
      {
        title: "Menopause Stage",
        status: menopauseStage,
        statusColor: menopauseAssessment ? getRiskColor(menopauseAssessment.risk_category) : "text-muted-foreground",
        icon: Thermometer,
        iconBg: "bg-primary/15",
        iconColor: "text-primary",
        path: "/modules/menopause",
        metric: menopauseAssessment?.risk_score != null ? `${Math.round(menopauseAssessment.risk_score)}%` : null,
        metricLabel: "Risk Score",
        hasData: !!menopauseAssessment,
        predictedDate: null,
        daysUntil: null,
      },
    ];
  }, [cycleData, cycleLogs, pcosAssessment, menopauseAssessment, menstrualAssessment, menstrualPredictedDate]);

  // Cycle chart data
  const cycleChartData = useMemo(() => {
    return [...cycleLogs]
      .filter((c) => c.cycle_length)
      .reverse()
      .slice(-8)
      .map((c, i) => ({ cycle: `C${i + 1}`, length: c.cycle_length || 28 }));
  }, [cycleLogs]);

  // Health score (composite)
  const healthScore = useMemo(() => {
    let score = 70; // baseline
    if (pcosAssessment?.risk_score != null) score = Math.round((score + (100 - pcosAssessment.risk_score)) / 2);
    if (menopauseAssessment?.risk_score != null) score = Math.round((score + (100 - menopauseAssessment.risk_score)) / 2);
    if (insights.regularity === "regular") score = Math.min(100, score + 5);
    if (insights.regularity === "very irregular") score = Math.max(0, score - 10);
    return score;
  }, [pcosAssessment, menopauseAssessment, insights]);

  // Today's snapshot
  const snapshotItems: SnapshotItem[] = useMemo(() => {
    const items: SnapshotItem[] = [];
    items.push({
      label: "Cycle",
      value: insights.regularity ? insights.regularity.charAt(0).toUpperCase() + insights.regularity.slice(1) : "Not tracked",
      status: insights.regularity === "regular" ? "good" : insights.regularity ? "warn" : "tip",
    });
    items.push({
      label: "PCOS Status",
      value: pcosAssessment ? (getRiskLabel(pcosAssessment.risk_category) || "Unknown") : "No assessment",
      status: !pcosAssessment ? "tip" : pcosAssessment.risk_category?.toLowerCase() === "low" ? "good" : "warn",
    });
    items.push({
      label: "Last Activity",
      value: cycleLogs[0] ? format(parseISO(cycleLogs[0].start_date), "dd MMM yyyy") : "Log your first cycle",
      status: cycleLogs[0] ? "good" : "tip",
    });
    return items;
  }, [insights, pcosAssessment, cycleLogs]);

  const suggestion = useMemo(() => {
    if (!pcosAssessment) return "Take the PCOS assessment to get a personalized risk analysis.";
    if (cycleLogs.length === 0) return "Log your period to start tracking your cycle patterns.";
    if (insights.regularity && insights.regularity !== "regular") return "Stay hydrated, sleep 7-8 hrs, and reduce stress for better cycle regularity.";
    return "Keep up the great habits! Regular tracking helps detect changes early.";
  }, [pcosAssessment, cycleLogs, insights]);

  // Recent activity
  const recentItems: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];
    if (pcosAssessment) items.push({ id: pcosAssessment.id, type: "pcos", title: "PCOS Assessment", subtitle: getRiskLabel(pcosAssessment.risk_category) || "Completed", date: pcosAssessment.created_at });
    if (menopauseAssessment) items.push({ id: menopauseAssessment.id, type: "menopause", title: "Menopause Assessment", subtitle: getMenopauseStage(menopauseAssessment.risk_category) || "Completed", date: menopauseAssessment.created_at });
    if (menstrualAssessment) items.push({ id: menstrualAssessment.id, type: "menstrual", title: "Menstrual Assessment", subtitle: getRiskLabel(menstrualAssessment.risk_category) || "Completed", date: menstrualAssessment.created_at });
    if (cycleLogs[0]) items.push({ id: cycleLogs[0].id, type: "cycle", title: "Period Logged", subtitle: `Started ${format(parseISO(cycleLogs[0].start_date), "dd MMM")}`, date: cycleLogs[0].created_at });
    (recentDocs || []).forEach((d) => items.push({ id: d.id, type: "document", title: "Report Uploaded", subtitle: d.file_name, date: d.uploaded_at }));
    return items.sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5);
  }, [pcosAssessment, menopauseAssessment, menstrualAssessment, cycleLogs, recentDocs]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-7">
        {/* 1. AI Insight Hero */}
        <AIInsightHero
          userName={userName}
          greeting={greeting}
          aiInsight={aiInsight}
          alertText={alertText}
          cyclesLogged={cycleLogs.length}
          currentDay={cycleData.currentDay}
        />

        {/* 2. Quick Actions */}
        <QuickActions />

        {/* 3. Health Overview Cards */}
        <HealthOverviewCards cards={healthCards} />

        {/* 4. Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CycleChart data={cycleChartData} averageLength={insights.averageCycleLength || 28} />
          </div>
          <HealthScoreRing score={healthScore} />
        </div>

        {/* 5. Calendar + Today's Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg font-heading flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  Cycle Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CycleCalendar
                  lastPeriod={cycleData.lastPeriod}
                  avgCycle={insights.averageCycleLength || 28}
                  periodDuration={insights.averagePeriodLength || 5}
                />
              </CardContent>
            </Card>
          </div>
          <TodaySnapshot items={snapshotItems} suggestion={suggestion} />
        </div>

        {/* 6. Recent Activity + Ask AI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentActivity items={recentItems} />
          </div>
          <AskAIBox />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
