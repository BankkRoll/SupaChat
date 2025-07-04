/**
 * SupaChat - useChatStore Zustand Store
 * Global chat state with persistence for SupaChat.
 */
import type { ChatStoreState } from "@/lib/supachat/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const storeInstances = new Map<string, any>();

export function createChatStore(config: { localStorageKey: string }) {
  if (storeInstances.has(config.localStorageKey)) {
    return storeInstances.get(config.localStorageKey);
  }

  const store = create<ChatStoreState>()(
    persist(
      (set, get) => ({
        sessionId: null,
        user: null,
        currentRoom: null,
        messages: [],
        unreadCount: 0,
        inputLocked: false,
        setSessionId: (id) => set({ sessionId: id }),
        setUser: (user) => set({ user }),
        setCurrentRoom: (room) => set({ currentRoom: room }),
        setMessages: (messages) => set({ messages }),
        addMessage: (message) =>
          set({ messages: [...get().messages, message] }),
        setUnreadCount: (count) => set({ unreadCount: count }),
        setInputLocked: (locked) => set({ inputLocked: locked }),
        reset: () =>
          set({
            sessionId: null,
            user: null,
            currentRoom: null,
            messages: [],
            unreadCount: 0,
            inputLocked: false,
          }),
      }),
      {
        name: config.localStorageKey,
        partialize: (state) => ({ ...state }),
      },
    ),
  );

  storeInstances.set(config.localStorageKey, store);
  return store;
}
