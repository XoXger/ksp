"use client";

import { useEffect } from "react";

const ADMIN_TAB_ADMIN_ID_KEY = "koperasi.adminTabAdminId";
const ADMIN_TAB_SUPER_ADMIN_ID_KEY = "koperasi.adminTabSuperAdminId";
const ADMIN_TAB_SESSION_KEY = "koperasi.adminTabSession";

export function AdminTabIdentityLinks() {
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const currentAdminId = currentUrl.searchParams.get("adminId");
    const currentSuperAdminId = currentUrl.searchParams.get("superAdminId");
    const currentSessionId = currentUrl.searchParams.get("sessionId");

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

    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest("a");

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
        return;
      }

      const targetUrl = new URL(href, window.location.origin);

      if (targetUrl.origin !== window.location.origin) {
        return;
      }

      if (!isAdminPath(targetUrl.pathname) && targetUrl.pathname !== "/logout") {
        return;
      }

      applyAdminTabParams(targetUrl);
      anchor.setAttribute(
        "href",
        `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`,
      );
    };

    const originalFetch = window.fetch.bind(window);

    window.fetch = (input, init) => {
      const requestUrl =
        typeof input === "string"
          ? new URL(input, window.location.origin)
          : input instanceof URL
            ? input
            : new URL(input.url, window.location.origin);

      if (
        requestUrl.origin === window.location.origin &&
        requestUrl.pathname.startsWith("/api/")
      ) {
        const headers = new Headers(init?.headers);
        const identity = getStoredAdminIdentity();

        if (identity) {
          headers.set("x-koperasi-session-id", identity.sessionId);
          if (identity.adminId) {
            headers.set("x-koperasi-admin-id", identity.adminId);
          }
          if (identity.superAdminId) {
            headers.set("x-koperasi-super-admin-id", identity.superAdminId);
          }
        }

        return originalFetch(input, { ...init, headers });
      }

      return originalFetch(input, init);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}

function applyAdminTabParams(targetUrl: URL) {
  const identity = getStoredAdminIdentity();

  if (!identity || targetUrl.searchParams.get("sessionId")) {
    return;
  }

  targetUrl.searchParams.set("sessionId", identity.sessionId);

  if (identity.superAdminId) {
    targetUrl.searchParams.set("superAdminId", identity.superAdminId);
    return;
  }

  if (identity.adminId) {
    targetUrl.searchParams.set("adminId", identity.adminId);
  }
}

function getStoredAdminIdentity() {
  const currentUrl = new URL(window.location.href);
  const sessionId =
    currentUrl.searchParams.get("sessionId") ??
    sessionStorage.getItem(ADMIN_TAB_SESSION_KEY);
  const superAdminId =
    currentUrl.searchParams.get("superAdminId") ??
    sessionStorage.getItem(ADMIN_TAB_SUPER_ADMIN_ID_KEY);
  const adminId =
    currentUrl.searchParams.get("adminId") ??
    sessionStorage.getItem(ADMIN_TAB_ADMIN_ID_KEY);

  if (!sessionId || (!adminId && !superAdminId)) {
    return null;
  }

  return { adminId, sessionId, superAdminId };
}

function isAdminPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}
