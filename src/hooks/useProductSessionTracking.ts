import { supabase } from "@/lib/supabase";
import { recordProductSession } from "@/services/productAnalyticsService";
import { useEffect } from "react";

let recordedUserId: string | null = null;

export const useProductSessionTracking = () => {
  useEffect(() => {
    const recordForUser = async (userId?: string) => {
      if (!userId || recordedUserId === userId) return;

      try {
        await recordProductSession();
        recordedUserId = userId;
      } catch {
        console.warn("Failed to record product session");
      }
    };

    void supabase.auth.getSession().then(({ data }) => recordForUser(data.session?.user.id));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        recordedUserId = null;
        return;
      }

      void recordForUser(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);
};
