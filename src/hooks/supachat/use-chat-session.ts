/**
 * SupaChat - useChatSession Hook
 * Manages chat session lifecycle, persistence, and restoration.
 */
import { createChatStore } from "@/hooks/supachat/use-chat-store";
import type { SupaChatConfig } from "@/lib/supachat/types";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useChatSession(config: SupaChatConfig) {
  const chatStore = useMemo(
    () => createChatStore({ localStorageKey: config.localStorageKey }),
    [config.localStorageKey],
  );
  const sessionId = chatStore((s: any) => s.sessionId);
  const setSessionId = chatStore((s: any) => s.setSessionId);
  const [isNewSession, setIsNewSession] = useState(false);

  const generateSessionId = () => {
    if (typeof window === "undefined") return null;
    return crypto.randomUUID();
  };

  const restoreSession = useCallback(() => {
    if (typeof window === "undefined") return;

    if (!sessionId) {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId!);
      setIsNewSession(true);
    } else {
      setIsNewSession(false);
    }
  }, [sessionId, setSessionId]);

  const clearSession = useCallback(() => {
    if (typeof window === "undefined") return;
    setSessionId("");
    setIsNewSession(true);
  }, [setSessionId]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return {
    sessionId,
    isNewSession,
    restoreSession,
    clearSession,
  };
}
