
-- Add admin INSERT policy for doctors
CREATE POLICY "Admins can insert doctors"
ON public.doctors
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add admin UPDATE policy for doctors
CREATE POLICY "Admins can update doctors"
ON public.doctors
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin DELETE policy for doctors
CREATE POLICY "Admins can delete doctors"
ON public.doctors
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin SELECT all doctors policy
CREATE POLICY "Admins can view all doctors"
ON public.doctors
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
