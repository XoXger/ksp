"use client";

import { useEffect } from "react";
import type { SessionIdentity } from "@/lib/session";

const MEMBER_TAB_IDENTITY_KEY = "koperasi.memberTabIdentity";
const MEMBER_TAB_SESSION_KEY = "koperasi.memberTabSession";
const ADMIN_TAB_ADMIN_ID_KEY = "koperasi.adminTabAdminId";
const ADMIN_TAB_SUPER_ADMIN_ID_KEY = "koperasi.adminTabSuperAdminId";
const ADMIN_TAB_SESSION_KEY = "koperasi.adminTabSession";
const ACTIVE_LOGIN_INTERACTION_KEY = "koperasi.activeLoginInteractedSession";
const HEARTBEAT_INTERVAL_MS = 5_000;
const IDLE_TIMEOUT_MS = 30_000;

export function ActiveLoginHeartbeat({
  session,
}: {
  session: SessionIdentity | null;
}) {
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const currentMemberId = currentUrl.searchParams.get("anggotaId");
    const currentAdminId = currentUrl.searchParams.get("adminId");
    const currentSuperAdminId = currentUrl.searchParams.get("superAdminId");
    const currentSessionId = currentUrl.searchParams.get("sessionId");
    const isLoginLifecyclePage =
      window.location.pathname === "/login" ||
      window.location.pathname === "/logout";

    if (
      !currentMemberId &&
      !currentSessionId &&
      isLoginLifecyclePage
    ) {
      sessionStorage.removeItem(MEMBER_TAB_IDENTITY_KEY);
      sessionStorage.removeItem(MEMBER_TAB_SESSION_KEY);
    }

    if (isLoginLifecyclePage) {
      return;
    }

    if (currentMemberId) {
      sessionStorage.setItem(MEMBER_TAB_IDENTITY_KEY, currentMemberId);
    }

    if (currentSessionId) {
      sessionStorage.setItem(MEMBER_TAB_SESSION_KEY, currentSessionId);
    }

    if (currentAdminId) {
      sessionStorage.setItem(ADMIN_TAB_ADMIN_ID_KEY, currentAdminId);
      sessionStorage.removeItem(ADMIN_TAB_SUPER_ADMIN_ID_KEY);
    }

    if (currentSuperAdminId) {
      sessionStorage.setItem(ADMIN_TAB_SUPER_ADMIN_ID_KEY, currentSuperAdminId);
      sessionStorage.removeItem(ADMIN_TAB_ADMIN_ID_KEY);
    }

    if (currentSessionId && (currentAdminId || currentSuperAdminId)) {
      sessionStorage.setItem(ADMIN_TAB_SESSION_KEY, currentSessionId);
    }

    const getHeartbeatBody = () => {
      const memberId = sessionStorage.getItem(MEMBER_TAB_IDENTITY_KEY);
      const memberSessionId = sessionStorage.getItem(MEMBER_TAB_SESSION_KEY);
      const adminId = sessionStorage.getItem(ADMIN_TAB_ADMIN_ID_KEY);
      const superAdminId = sessionStorage.getItem(ADMIN_TAB_SUPER_ADMIN_ID_KEY);
      const adminSessionId = sessionStorage.getItem(ADMIN_TAB_SESSION_KEY);
      const isMemberArea = isMemberPath(window.location.pathname);
      const isAdminArea = isAdminPath(window.location.pathname);

      if (isMemberArea && memberId && memberSessionId) {
        return {
          id: memberSessionId,
          userId: memberId,
          role: "ANGGOTA" as const,
        };
      }

      if (isAdminArea && adminSessionId && superAdminId) {
        return {
          id: adminSessionId,
          userId: superAdminId,
          role: "SUPER_ADMIN" as const,
        };
      }

      if (isAdminArea && adminSessionId && adminId) {
        return {
          id: adminSessionId,
          userId: adminId,
          role: "ADMIN" as const,
        };
      }

      return session;
    };

    let lastInteractionAt = Date.now();
    let idleReleased = false;
    let heartbeatIntervalId: number | null = null;

    const hasUnlockedInteraction = () => {
      const body = getHeartbeatBody();

      return Boolean(
        body && sessionStorage.getItem(ACTIVE_LOGIN_INTERACTION_KEY) === body.id,
      );
    };

    let hasInteracted = hasUnlockedInteraction();

    const sendHeartbeat = () => {
      const body = getHeartbeatBody();

      if (!body) {
        return;
      }

      fetch("/api/active-login/heartbeat", {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        method: "POST",
      }).catch(() => undefined);
    };

    const buildLogoutHref = () => {
      const body = getHeartbeatBody();

      if (!body) {
        return "/logout";
      }

      const params = new URLSearchParams({ sessionId: body.id });

      if (body.role === "ANGGOTA") {
        params.set("anggotaId", body.userId);
      } else if (body.role === "ADMIN") {
        params.set("adminId", body.userId);
      } else {
        params.set("superAdminId", body.userId);
      }

      return `/logout?${params.toString()}`;
    };

    const releaseActiveSession = () => {
      if (idleReleased) {
        return;
      }

      const body = getHeartbeatBody();

      if (!body) {
        return;
      }

      idleReleased = true;
      const payload = JSON.stringify(body);

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/active-login/release",
          new Blob([payload], { type: "application/json" }),
        );
        return;
      }

      fetch("/api/active-login/release", {
        body: payload,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        method: "POST",
      }).catch(() => undefined);
    };

    const startPersistentHeartbeat = () => {
      if (heartbeatIntervalId !== null) {
        return;
      }

      heartbeatIntervalId = window.setInterval(
        sendHeartbeat,
        HEARTBEAT_INTERVAL_MS,
      );
    };

    const markInteraction = () => {
      lastInteractionAt = Date.now();
      idleReleased = false;
      hasInteracted = true;
      const body = getHeartbeatBody();

      if (body) {
        sessionStorage.setItem(ACTIVE_LOGIN_INTERACTION_KEY, body.id);
      }

      sendHeartbeat();
      startPersistentHeartbeat();
    };

    const checkIdleSession = () => {
      if (hasInteracted || hasUnlockedInteraction()) {
        hasInteracted = true;
        startPersistentHeartbeat();
        return;
      }

      if (Date.now() - lastInteractionAt < IDLE_TIMEOUT_MS) {
        return;
      }

      releaseActiveSession();
      window.location.assign(buildLogoutHref());
    };

    const interactionEvents = [
      "click",
      "keydown",
      "pointerdown",
      "scroll",
      "touchstart",
    ] as const;

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, markInteraction, {
        passive: true,
      });
    });
    sendHeartbeat();
    if (hasInteracted) {
      startPersistentHeartbeat();
    }
    const idleIntervalId = window.setInterval(checkIdleSession, 1_000);
    window.addEventListener("pagehide", releaseActiveSession);

    return () => {
      if (heartbeatIntervalId !== null) {
        window.clearInterval(heartbeatIntervalId);
      }

      window.clearInterval(idleIntervalId);
      window.removeEventListener("pagehide", releaseActiveSession);
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, markInteraction);
      });
    };
  }, [session]);

  return null;
}

function isMemberPath(pathname: string) {
  return (
    pathname === "/anggota" ||
    pathname.startsWith("/anggota/") ||
    pathname === "/simpanan" ||
    pathname.startsWith("/simpanan/") ||
    pathname === "/pinjaman" ||
    pathname.startsWith("/pinjaman/") ||
    pathname === "/shu" ||
    pathname.startsWith("/shu/") ||
    pathname === "/simulasi-pinjaman"
  );
}

function isAdminPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}
