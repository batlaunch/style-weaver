-- Add liked column to saved_outfits for favorite sorting
ALTER TABLE public.saved_outfits ADD COLUMN liked BOOLEAN NOT NULL DEFAULT false;

-- Update existing rows to have liked = false
UPDATE public.saved_outfits SET liked = false;