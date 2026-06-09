import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string) {
  const subscribe = (onStoreChange: () => void) => {
    const mq = window.matchMedia(query);
    const handler = () => onStoreChange();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }

    if (typeof mq.addListener === "function") {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }

    return () => undefined;
  };

  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
