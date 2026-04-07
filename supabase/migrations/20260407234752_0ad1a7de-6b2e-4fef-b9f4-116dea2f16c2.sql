
-- Add nullable user_id column to saved_outfits
ALTER TABLE public.saved_outfits ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing overly-permissive policies
DROP POLICY IF EXISTS "Anyone can delete their saved outfits" ON public.saved_outfits;
DROP POLICY IF EXISTS "Anyone can insert saved outfits" ON public.saved_outfits;
DROP POLICY IF EXISTS "Anyone can view saved outfits" ON public.saved_outfits;

-- New policies: allow anon access (device_id based) and authenticated access (user_id based)
CREATE POLICY "Users can view own outfits"
  ON public.saved_outfits FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can insert own outfits"
  ON public.saved_outfits FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can delete own outfits"
  ON public.saved_outfits FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Allow authenticated users to update (for claiming device outfits)
CREATE POLICY "Users can update own outfits"
  ON public.saved_outfits FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
  )
  WITH CHECK (
    user_id = auth.uid()
  );
