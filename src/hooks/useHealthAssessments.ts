import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface HealthAssessment {
  id: string;
  user_id: string;
  assessment_type: string;
  risk_score: number | null;
  risk_category: string | null;
  responses: Record<string, unknown> | null;
  recommendations: Record<string, unknown> | null;
  created_at: string;
}

export function useHealthAssessments() {
  const { user } = useAuth();

  const { data: pcosAssessment, isLoading: pcosLoading } = useQuery({
    queryKey: ["health-assessment", "pcos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("health_assessments")
        .select("*")
        .eq("user_id", user!.id)
        .or("assessment_type.eq.pcos_ml_api,assessment_type.eq.pcos_ml_local")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as HealthAssessment | null;
    },
    enabled: !!user,
  });

  const { data: menopauseAssessment, isLoading: menopauseLoading } = useQuery({
    queryKey: ["health-assessment", "menopause", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("health_assessments")
        .select("*")
        .eq("user_id", user!.id)
        .or("assessment_type.eq.menopause_ml_api,assessment_type.eq.menopause_ml_local")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as HealthAssessment | null;
    },
    enabled: !!user,
  });

  const { data: menstrualAssessment, isLoading: menstrualLoading } = useQuery({
    queryKey: ["health-assessment", "menstrual", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("health_assessments")
        .select("*")
        .eq("user_id", user!.id)
        .or("assessment_type.eq.menstrual_ml_api,assessment_type.eq.menstrual_ml_local")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as HealthAssessment | null;
    },
    enabled: !!user,
  });

  return {
    pcosAssessment,
    menopauseAssessment,
    menstrualAssessment,
    loading: pcosLoading || menopauseLoading || menstrualLoading,
  };
}
