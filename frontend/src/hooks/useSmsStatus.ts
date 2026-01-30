import { useEffect } from "react";
import { useGridStore } from "../store/useGridStore";

export const useSmsStatus = () => {
  const setSmsStatus = useGridStore(s => s.setSmsStatus);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/alerts/sms-status");
        const data = await res.json();
        setSmsStatus(data);
      } catch {}
    }, 2000);

    return () => clearInterval(interval);
  }, []);
};
