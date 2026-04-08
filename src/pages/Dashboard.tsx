import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Activity, Droplets, ChevronRight, Thermometer,
  Stethoscope, FileText, BookOpen, Calendar,
  Heart, Sun, Moon, Sparkles, Clock
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCycleTracking } from "@/hooks/useCycleTracking";
import { useHealthAssessments } from "@/hooks/useHealthAssessments";
import { differenceInDays, parseISO, format } from "date-fns";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const dashboardSections = [
  { icon: FileText, title: "Medical Reports", description: "Upload & manage documents", path: "/dashboard/documents", color: "text-accent", bgColor: "bg-accent/15" },
  { icon: Stethoscope, title: "Find Doctors", description: "Connect with specialists", path: "/doctors", color: "text-teal", bgColor: "bg-teal/15" },
  { icon: BookOpen, title: "Health Resources", description: "Educational content", path: "/health-resources", color: "text-primary", bgColor: "bg-primary/15" },
  { icon: FileText, title: "Govt. Schemes", description: "Explore health benefits", path: "/schemes", color: "text-accent", bgColor: "bg-accent/15" },
];

const getRiskColor = (category: string | null) => {
  if (!category) return "text-muted-foreground";
  const lower = category.toLowerCase();
  if (lower === "high" || lower === "severe") return "text-destructive";
  if (lower === "moderate" || lower === "medium") return "text-accent";
  return "text-teal";
};

const getRiskLabel = (category: string | null) => {
  if (!category) return null;
  const lower = category.toLowerCase();
  if (lower === "high" || lower === "severe") return "High Risk";
  if (lower === "moderate" || lower === "medium") return "Moderate Risk";
  if (lower === "low" || lower === "none") return "Low Risk";
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
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';
  const loading = cycleLoading || assessmentLoading;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", icon: Sun };
    if (hour < 18) return { text: "Good afternoon", icon: Sun };
    return { text: "Good evening", icon: Moon };
  }, []);

  const cycleData = useMemo(() => {
    if (cycleLogs.length === 0) {
      return { currentDay: null, cycleLength: 28, phase: "unknown" };
    }
    const latestCycle = cycleLogs[0];
    const cycleStart = parseISO(latestCycle.start_date);
    const today = new Date();
    const dayOfCycle = differenceInDays(today, cycleStart) + 1;
    const cycleLength = insights.averageCycleLength || 28;
    const periodLength = latestCycle.period_length || insights.averagePeriodLength || 5;
    const ovulationCenter = Math.round(cycleLength / 2);

    let phase = "follicular";
    if (dayOfCycle <= periodLength) phase = "menstrual";
    else if (dayOfCycle >= ovulationCenter - 2 && dayOfCycle <= ovulationCenter + 2) phase = "ovulation";
    else if (dayOfCycle > ovulationCenter + 2) phase = "luteal";

    return {
      currentDay: dayOfCycle > 0 && dayOfCycle <= cycleLength ? dayOfCycle : null,
      cycleLength,
      phase,
    };
  }, [cycleLogs, insights]);

  // Get predicted date from multiple sources
  const menstrualPredictedDate = useMemo(() => {
    // Source 1: cycle_predictions table
    if (prediction?.predicted_start_date) {
      return {
        date: format(parseISO(prediction.predicted_start_date), "dd MMM yyyy"),
        daysUntil: prediction.days_until,
      };
    }
    // Source 2: menstrual assessment recommendations (saved next_date)
    if (menstrualAssessment?.recommendations) {
      const recs = menstrualAssessment.recommendations as Record<string, unknown>;
      const nextDate = recs.next_date as string | undefined;
      if (nextDate) {
        try {
          const parsed = new Date(nextDate);
          if (!isNaN(parsed.getTime())) {
            const daysUntil = differenceInDays(parsed, new Date());
            return {
              date: format(parsed, "dd MMM yyyy"),
              daysUntil: daysUntil > 0 ? daysUntil : 0,
            };
          }
        } catch {}
      }
    }
    return null;
  }, [prediction, menstrualAssessment]);

  // Build health cards from real data
  const healthCards = useMemo(() => {
    const pcosRiskLabel = pcosAssessment ? getRiskLabel(pcosAssessment.risk_category) : null;
    const pcosScore = pcosAssessment?.risk_score != null ? Math.round(100 - pcosAssessment.risk_score) : null;
    
    const menopauseStage = menopauseAssessment ? getMenopauseStage(menopauseAssessment.risk_category) : null;

    // Menstrual assessment data
    const menstrualStatus = menstrualAssessment
      ? (menstrualAssessment.risk_category === "low" ? "Regular" : "Irregular")
      : (cycleData.currentDay ? `Day ${cycleData.currentDay} of Cycle` : null);

    return [
      {
        title: "Menstrual Health",
        status: menstrualStatus || "Start tracking",
        statusColor: menstrualAssessment
          ? getRiskColor(menstrualAssessment.risk_category)
          : (cycleData.currentDay ? "text-teal" : "text-muted-foreground"),
        icon: Droplets,
        iconBg: "bg-teal/15",
        iconColor: "text-teal",
        path: "/modules/menstrual",
        hasData: !!menstrualAssessment || cycleLogs.length > 0,
        predictedDate: menstrualPredictedDate?.date || null,
        daysUntil: menstrualPredictedDate?.daysUntil ?? null,
        metric: null as string | null,
        metricLabel: null as string | null,
      },
      {
        title: "PCOS Risk",
        status: pcosRiskLabel || null,
        statusColor: pcosAssessment ? getRiskColor(pcosAssessment.risk_category) : "text-muted-foreground",
        icon: Activity,
        iconBg: "bg-accent/15",
        iconColor: "text-accent",
        path: "/modules/pcos",
        metric: pcosScore != null ? `${pcosScore}%` : null,
        metricLabel: "Health Score",
        hasData: !!pcosAssessment,
        predictedDate: null as string | null,
        daysUntil: null as number | null,
      },
      {
        title: "Menopause Stage",
        status: menopauseStage || null,
        statusColor: menopauseAssessment ? getRiskColor(menopauseAssessment.risk_category) : "text-muted-foreground",
        icon: Thermometer,
        iconBg: "bg-primary/15",
        iconColor: "text-primary",
        path: "/modules/menopause",
        metric: menopauseAssessment?.risk_score != null ? `${Math.round(menopauseAssessment.risk_score)}%` : null,
        metricLabel: "Risk Score",
        hasData: !!menopauseAssessment,
        predictedDate: null as string | null,
        daysUntil: null as number | null,
      },
    ];
  }, [cycleData, cycleLogs, insights, pcosAssessment, menopauseAssessment, menstrualAssessment, menstrualPredictedDate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 md:space-y-8">
          <Skeleton className="h-48 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-up">
        {/* Welcome Hero Section */}
        <div className="relative overflow-hidden glass-card rounded-2xl p-5 sm:p-6 md:p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-teal/10">
          <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-teal/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <img src={logoImg} alt="NaariCare Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg object-contain" />
              <span className="font-heading font-bold text-lg sm:text-xl text-foreground">
                Naari<span className="text-accent">Care</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground mb-1.5 sm:mb-2">
              <greeting.icon className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{greeting.text}</span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-lg">
              Here's your personalized health summary. Track your cycle, monitor your health, and access resources all in one place.
            </p>
            
            <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 sm:mt-6">
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-background/60 backdrop-blur-sm border border-border/50">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium">
                  {cycleLogs.length} {cycleLogs.length === 1 ? 'Cycle' : 'Cycles'} Logged
                </span>
              </div>
              {cycleData.currentDay && (
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-background/60 backdrop-blur-sm border border-border/50">
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  <span className="text-xs sm:text-sm font-medium">Day {cycleData.currentDay}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Modules */}
        <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <h2 className="font-heading text-base sm:text-lg md:text-xl font-semibold text-foreground mb-3 sm:mb-4">Health Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {healthCards.map((card, index) => (
              <Link 
                key={card.title} 
                to={card.path} 
                className="glass-card card-hover rounded-xl p-4 sm:p-5 group animate-fade-up"
                style={{ animationDelay: `${(index + 1) * 75}ms` }}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${card.iconBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                    <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.iconColor}`} />
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-heading text-sm sm:text-base font-semibold text-foreground mb-1">{card.title}</h3>
                
                {card.hasData ? (
                  <>
                    <p className={`text-xs sm:text-sm font-medium ${card.statusColor} mb-2 sm:mb-3`}>{card.status}</p>
                    {card.predictedDate ? (
                      <div className="pt-2 sm:pt-3 border-t border-border px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-primary/5 border-primary/10">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                          <span className="text-[10px] sm:text-xs font-medium text-primary">Next Period</span>
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-foreground">{card.predictedDate}</div>
                        {card.daysUntil != null && card.daysUntil > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
                            <span className="text-[10px] sm:text-xs text-muted-foreground">{card.daysUntil} days away</span>
                          </div>
                        )}
                      </div>
                    ) : card.metric ? (
                      <div className="pt-2 sm:pt-3 border-t border-border">
                        <div className="text-lg sm:text-xl font-bold gradient-text">{card.metric}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{card.metricLabel}</div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="mt-1.5 sm:mt-2">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">No assessment yet</p>
                    <div className="pt-2 sm:pt-3 border-t border-border flex items-center gap-2 text-primary text-xs sm:text-sm font-medium">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Start Assessment
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Resources Grid */}
        <div className="animate-fade-up" style={{ animationDelay: '400ms' }}>
          <h2 className="font-heading text-base sm:text-lg md:text-xl font-semibold text-foreground mb-3 sm:mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {dashboardSections.map((section, index) => (
              <Link 
                key={section.title} 
                to={section.path} 
                className="glass-card card-hover rounded-xl p-3 sm:p-4 md:p-5 group text-center"
                style={{ animationDelay: `${(index + 5) * 50}ms` }}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${section.bgColor} flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                  <section.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${section.color}`} />
                </div>
                <h3 className="font-medium text-foreground text-xs sm:text-sm mb-0.5 sm:mb-1">{section.title}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{section.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
