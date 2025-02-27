import { useCallback, useSyncExternalStore } from "react";

export function useLocalStorage(
  key: string,
): [string, (value: string) => void] {
  const store = useSyncExternalStore(
    // subscribe
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    // getSnapshot
    () => localStorage.getItem(key) || "",
  );

  const setState = useCallback(
    (value: string) => {
      localStorage.setItem(key, value);

      // setItem only dispatches on other tabs; we need to dispatch for our own
      // tab too
      window.dispatchEvent(new Event("storage"));
    },
    [key],
  );

  return [store, setState];
}
