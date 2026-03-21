
ALTER TABLE public.health_assessments DROP CONSTRAINT health_assessments_assessment_type_check;
ALTER TABLE public.health_assessments ADD CONSTRAINT health_assessments_assessment_type_check 
  CHECK (assessment_type = ANY (ARRAY['pcos'::text, 'menopause'::text, 'menstrual'::text, 'pcos_ml_api'::text, 'pcos_ml_local'::text, 'menopause_ml_api'::text, 'menopause_ml_local'::text]));
