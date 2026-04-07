import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/deviceId";
import { useAuth } from "@/hooks/useAuth";
import type { SavedOutfit, Outfit } from "@/lib/outfitTypes";

export function useSavedOutfits() {
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const deviceId = getDeviceId();
  const { user } = useAuth();

  const fetchOutfits = useCallback(async () => {
    setIsLoading(true);

    let query = supabase
      .from("saved_outfits")
      .select("*")
      .order("created_at", { ascending: false });

    if (user) {
      // Logged in: show user's outfits
      query = query.eq("user_id", user.id);
    } else {
      // Anonymous: show device outfits
      query = query.eq("device_id", deviceId).is("user_id", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching outfits:", error);
    } else {
      setSavedOutfits(
        (data || []).map((row) => ({
          id: row.id,
          style: row.style,
          gender: row.gender,
          harmony: row.harmony,
          items: row.items as unknown as SavedOutfit["items"],
          palette: row.palette as unknown as SavedOutfit["palette"],
          outfitImageUrl: row.outfit_image_url,
          createdAt: row.created_at,
        }))
      );
    }
    setIsLoading(false);
  }, [deviceId, user]);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  const saveOutfit = useCallback(
    async (outfit: Outfit, style: string, gender: string, outfitImageUrl?: string) => {
      const { error } = await supabase.from("saved_outfits").insert({
        device_id: deviceId,
        style,
        gender,
        harmony: outfit.harmony,
        items: outfit.items as any,
        palette: outfit.palette as any,
        outfit_image_url: outfitImageUrl || null,
        user_id: user?.id || null,
      });
      if (error) {
        console.error("Error saving outfit:", error);
        return false;
      }
      await fetchOutfits();
      return true;
    },
    [deviceId, user, fetchOutfits]
  );

  const deleteOutfit = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("saved_outfits").delete().eq("id", id);
      if (error) {
        console.error("Error deleting outfit:", error);
        return false;
      }
      setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
      return true;
    },
    []
  );

  return { savedOutfits, isLoading, saveOutfit, deleteOutfit, refetch: fetchOutfits };
}
