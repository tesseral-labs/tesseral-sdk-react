import { useEffect, useState } from "react";

export function useDebouncedNow(updatePeriodMillis: number): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), updatePeriodMillis);
    return () => clearInterval(interval);
  }, []);
  return now;
}
