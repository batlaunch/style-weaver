-- 1. Delete anonymous outfit rows (cannot be securely scoped to a device)
DELETE FROM public.saved_outfits WHERE user_id IS NULL;

-- 2. Make user_id NOT NULL going forward
ALTER TABLE public.saved_outfits ALTER COLUMN user_id SET NOT NULL;

-- 3. Replace RLS policies on saved_outfits with strict owner-only access
DROP POLICY IF EXISTS "Users can view own outfits" ON public.saved_outfits;
DROP POLICY IF EXISTS "Users can insert own outfits" ON public.saved_outfits;
DROP POLICY IF EXISTS "Users can update own outfits" ON public.saved_outfits;
DROP POLICY IF EXISTS "Users can delete own outfits" ON public.saved_outfits;

CREATE POLICY "Owners can view their outfits"
  ON public.saved_outfits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Owners can insert their outfits"
  ON public.saved_outfits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can update their outfits"
  ON public.saved_outfits FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can delete their outfits"
  ON public.saved_outfits FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Tighten storage policies on outfit-images bucket
DROP POLICY IF EXISTS "Anyone can view outfit images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload outfit images" ON storage.objects;

-- Files are stored under "<user_id>/..." path. Owner-only access.
CREATE POLICY "Users can view their own outfit images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'outfit-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own outfit images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'outfit-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own outfit images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'outfit-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. Make the outfit-images bucket private (no public listing/access)
UPDATE storage.buckets SET public = false WHERE id = 'outfit-images';