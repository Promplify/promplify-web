import { supabase } from "@/lib/supabase";

export type TemplateSaveSource = "templates" | "template_detail";

const PRODUCT_SESSION_KEY = "promplify.product-session.v1";
const PRODUCT_SESSION_TIMEOUT_MS = 30 * 60 * 1000;

type StoredProductSession = {
  id: string;
  lastSeenAt: number;
};

const readStoredSession = (): StoredProductSession | null => {
  try {
    const value = window.localStorage.getItem(PRODUCT_SESSION_KEY);
    if (!value) return null;

    const parsed = JSON.parse(value) as Partial<StoredProductSession>;
    if (typeof parsed.id !== "string" || typeof parsed.lastSeenAt !== "number") {
      return null;
    }

    return { id: parsed.id, lastSeenAt: parsed.lastSeenAt };
  } catch {
    return null;
  }
};

export const getProductSessionId = (now = Date.now()) => {
  const storedSession = readStoredSession();
  const sessionId = storedSession && now - storedSession.lastSeenAt < PRODUCT_SESSION_TIMEOUT_MS ? storedSession.id : crypto.randomUUID();

  window.localStorage.setItem(
    PRODUCT_SESSION_KEY,
    JSON.stringify({
      id: sessionId,
      lastSeenAt: now,
    } satisfies StoredProductSession)
  );

  return sessionId;
};

export const recordProductSession = async () => {
  const sessionId = getProductSessionId();
  const { error } = await supabase.rpc("record_product_session", {
    p_session_id: sessionId,
  });

  if (error) throw error;
};

export const recordTemplateSaved = async (promptId: string, templateId: string | number, source: TemplateSaveSource) => {
  const numericTemplateId = typeof templateId === "number" ? templateId : Number(templateId);
  if (!Number.isSafeInteger(numericTemplateId)) {
    throw new Error("Invalid template ID");
  }

  const { error } = await supabase.rpc("record_template_saved", {
    p_prompt_id: promptId,
    p_template_id: numericTemplateId,
    p_source: source,
  });

  if (error) throw error;
};
