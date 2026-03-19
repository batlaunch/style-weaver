-- Create saved_outfits table
CREATE TABLE public.saved_outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  style TEXT NOT NULL,
  gender TEXT NOT NULL,
  harmony TEXT NOT NULL,
  items JSONB NOT NULL,
  palette JSONB NOT NULL,
  outfit_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write (device-based auth for now)
CREATE POLICY "Anyone can view saved outfits" ON public.saved_outfits
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert saved outfits" ON public.saved_outfits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete their saved outfits" ON public.saved_outfits
  FOR DELETE USING (true);

-- Index for device lookups
CREATE INDEX idx_saved_outfits_device_id ON public.saved_outfits (device_id);

-- Storage bucket for generated outfit images
INSERT INTO storage.buckets (id, name, public) VALUES ('outfit-images', 'outfit-images', true);

CREATE POLICY "Anyone can view outfit images" ON storage.objects
  FOR SELECT USING (bucket_id = 'outfit-images');

CREATE POLICY "Anyone can upload outfit images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'outfit-images');