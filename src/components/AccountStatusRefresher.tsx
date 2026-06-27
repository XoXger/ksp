"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AccountStatusRefresher() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const refreshSafely = () => {
      if (!isMounted) {
        return;
      }

      try {
        router.refresh();
      } catch (error) {
        if (!isRouterInitializationError(error)) {
          throw error;
        }
      }
    };
    const intervalId = window.setInterval(() => {
      refreshSafely();
    }, 3_000);
    const timeoutId = window.setTimeout(refreshSafely, 1_000);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [router]);

  return null;
}

function isRouterInitializationError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : "";

  return message.includes("Router action dispatched before initialization");
}
