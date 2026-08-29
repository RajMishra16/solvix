import { createJSONStorage } from 'zustand/middleware';

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const safeJSONStorage = createJSONStorage(() => {
  if (typeof window === 'undefined') {
    return noopStorage;
  }

  return window.localStorage;
});
