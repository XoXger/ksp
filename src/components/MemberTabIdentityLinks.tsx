"use client";

import { useEffect } from "react";

const MEMBER_TAB_IDENTITY_KEY = "koperasi.memberTabIdentity";
const MEMBER_TAB_SESSION_KEY = "koperasi.memberTabSession";
const MEMBER_PATH_PREFIXES = [
  "/anggota",
  "/simpanan",
  "/pinjaman",
  "/shu",
  "/simulasi-pinjaman",
];

export function MemberTabIdentityLinks() {
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const currentMemberId = currentUrl.searchParams.get("anggotaId");
    const currentSessionId = currentUrl.searchParams.get("sessionId");

    if (currentMemberId) {
      sessionStorage.setItem(MEMBER_TAB_IDENTITY_KEY, currentMemberId);
    }

    if (currentSessionId) {
      sessionStorage.setItem(MEMBER_TAB_SESSION_KEY, currentSessionId);
    }

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }

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

      if (!isMemberPath(targetUrl.pathname) && targetUrl.pathname !== "/logout") {
        return;
      }

      const originalHref = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
      const memberId =
        new URL(window.location.href).searchParams.get("anggotaId") ??
        sessionStorage.getItem(MEMBER_TAB_IDENTITY_KEY);
      const sessionId =
        new URL(window.location.href).searchParams.get("sessionId") ??
        sessionStorage.getItem(MEMBER_TAB_SESSION_KEY);

      if (!memberId || targetUrl.searchParams.get("anggotaId")) {
        return;
      }

      targetUrl.searchParams.set("anggotaId", memberId);
      if (sessionId && !targetUrl.searchParams.get("sessionId")) {
        targetUrl.searchParams.set("sessionId", sessionId);
      }
      const nextHref = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;

      if (nextHref === originalHref) {
        return;
      }

      anchor.setAttribute("href", nextHref);
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(nextHref);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}

function isMemberPath(pathname: string) {
  return MEMBER_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
