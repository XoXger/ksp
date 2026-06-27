"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type AccountRole = "ANGGOTA" | "ADMIN" | "SUPER ADMIN";
type AccountStatus = "AKTIF" | "NONAKTIF" | "MENUNGGU" | "DITOLAK";

export function AccountActionMenu({
  accountId,
  accountRole,
  accountStatus,
  isOpen,
  onClose,
  onToggle,
  viewerRole,
  viewerSessionId,
  viewerUserId,
}: {
  accountId: string;
  accountRole: AccountRole;
  accountStatus: AccountStatus;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  viewerRole: AccountRole | null;
  viewerSessionId: string | null;
  viewerUserId: string | null;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const canViewDetail = canViewAccountDetail(viewerRole, accountRole);
  const canDeleteRemovableAccount =
    accountRole === "ANGGOTA" &&
    (accountStatus === "DITOLAK" || accountStatus === "NONAKTIF") &&
    (viewerRole === "ADMIN" || viewerRole === "SUPER ADMIN");
  const detailHref = buildDetailHref(
    accountId,
    accountRole,
    viewerRole,
    viewerSessionId,
    viewerUserId,
  );

  const deleteRemovableAccount = async () => {
    if (!viewerSessionId) {
      return;
    }

    setIsDeleting(true);
    const response = await fetch(
      `/api/accounts/anggota/${accountId}/status?viewerSessionId=${encodeURIComponent(viewerSessionId)}`,
      {
        method: "DELETE",
      },
    );
    setIsDeleting(false);
    setPendingDelete(false);
    onClose();

    if (response.ok) {
      refreshSafely(router);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) {
      setMenuPosition(null);
      return;
    }

    const updateMenuPosition = () => {
      const buttonRect = buttonRef.current?.getBoundingClientRect();

      if (!buttonRect) {
        return;
      }

      setMenuPosition({
        top: buttonRect.bottom + 8,
        left: Math.max(16, buttonRect.right - 170),
      });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex justify-end" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-label="Buka menu aksi akun"
        className="rounded-md px-2 py-1 text-xl font-extrabold leading-none transition hover:bg-[#f0f1d5]"
        onClick={onToggle}
        ref={buttonRef}
        type="button"
      >
        ...
      </button>

      {isOpen && menuPosition ? (
        <div
          className="fixed z-50 min-w-[170px] overflow-hidden rounded-lg bg-white py-2 text-left shadow-[0_12px_28px_rgba(23,79,62,0.18)] ring-1 ring-black/10"
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
          }}
        >
          {canViewDetail ? (
            <a
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#10231d] transition hover:bg-[#fbfbe8]"
              href={detailHref}
            >
              <EyeIcon className="h-4 w-4" />
              Detail akun
            </a>
          ) : null}
          {canDeleteRemovableAccount ? (
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-[#c3171f] transition hover:bg-[#fff0ef]"
              onClick={() => {
                setPendingDelete(true);
                onClose();
              }}
              type="button"
            >
              <TrashIcon className="h-4 w-4" />
              Hapus
            </button>
          ) : null}
          {!canViewDetail && !canDeleteRemovableAccount ? (
            <span className="block px-4 py-3 text-sm text-[#8b918c]">
              Tidak ada aksi
            </span>
          ) : null}
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/30 px-4">
          <div className="w-full max-w-[380px] rounded-xl bg-white p-6 text-center shadow-[0_18px_42px_rgba(0,0,0,0.24)] ring-1 ring-black/10">
            <h3 className="text-lg font-extrabold text-[#10231d]">
              Hapus akun anggota?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#52615b]">
              Akun anggota ini akan dihapus permanen dari daftar akun. Lanjutkan?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                className="h-10 rounded-full bg-[#c3171f] px-8 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isDeleting}
                onClick={deleteRemovableAccount}
                type="button"
              >
                Ya
              </button>
              <button
                className="h-10 rounded-full bg-[#f0f0d8] px-8 text-sm font-extrabold text-[#10231d] ring-1 ring-black/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isDeleting}
                onClick={() => setPendingDelete(false)}
                type="button"
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function canViewAccountDetail(
  viewerRole: AccountRole | null,
  accountRole: AccountRole,
) {
  if (!viewerRole) {
    return false;
  }

  if (accountRole === "ANGGOTA") {
    return viewerRole === "ADMIN" || viewerRole === "SUPER ADMIN";
  }

  if (accountRole === "ADMIN") {
    return viewerRole === "SUPER ADMIN";
  }

  return viewerRole === "SUPER ADMIN";
}

function getDetailSegment(role: AccountRole) {
  if (role === "ANGGOTA") {
    return "anggota";
  }

  if (role === "ADMIN") {
    return "admin";
  }

  return "super-admin";
}

function buildDetailHref(
  accountId: string,
  accountRole: AccountRole,
  viewerRole: AccountRole | null,
  viewerSessionId: string | null,
  viewerUserId: string | null,
) {
  const baseHref = `/dashboard/akun/${getDetailSegment(accountRole)}/${accountId}`;

  if (!viewerSessionId || !viewerUserId) {
    return baseHref;
  }

  const params = new URLSearchParams({ sessionId: viewerSessionId });

  if (viewerRole === "SUPER ADMIN") {
    params.set("superAdminId", viewerUserId);
  } else if (viewerRole === "ADMIN") {
    params.set("adminId", viewerUserId);
  } else {
    return baseHref;
  }

  return `${baseHref}?${params.toString()}`;
}

function refreshSafely(router: ReturnType<typeof useRouter>) {
  try {
    router.refresh();
  } catch (error) {
    if (!isRouterInitializationError(error)) {
      throw error;
    }
  }
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

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-.8 12H6.8L6 9Zm3 2 .4 8h1.8l-.3-8H9Zm3 0v8h2v-8h-2Zm3.1 0-.3 8h1.8l.4-8h-1.9Z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5c5.2 0 8.7 4.6 9.7 6.2.2.5.2 1.1 0 1.6C20.7 14.4 17.2 19 12 19s-8.7-4.6-9.7-6.2a1.7 1.7 0 0 1 0-1.6C3.3 9.6 6.8 5 12 5Zm0 2c-4 0-6.8 3.4-7.8 5 1 1.6 3.8 5 7.8 5s6.8-3.4 7.8-5c-1-1.6-3.8-5-7.8-5Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
    </svg>
  );
}
