import { AdminAccountEditableField } from "@/components/AdminAccountEditableField";

const adminProfileMenuItems = [
  { label: "Beranda", icon: GridIcon, href: "/dashboard" },
  { label: "Kelola Akun", icon: UserSettingsIcon, href: "/dashboard/akun" },
  { label: "Kelola Simpanan", icon: WalletIcon, href: "/dashboard/simpanan" },
  { label: "Kelola Pinjaman", icon: MoneyIcon, href: "/dashboard/pinjaman" },
  { label: "Laporan Koperasi", icon: ReportIcon, href: "/dashboard/laporan" },
  { label: "SHU", icon: CoinIcon, href: "/dashboard/shu" },
];

export type AdminProfileData = {
  email: string;
  id: string;
  jenisKelamin: string;
  nama: string;
  nomorSeluler: string;
  peran: string;
  status: string;
  tanggalBergabung: string;
};

export type AdminProfileActivity = {
  detail: string;
  id: string;
  time: string;
  title: string;
};

export function AdminProfileView({
  activities = [],
  admin,
  canEditPassword = false,
  mode = "profile",
}: {
  activities?: AdminProfileActivity[];
  admin: AdminProfileData;
  canEditPassword?: boolean;
  mode?: "profile" | "detail";
}) {
  const isDetailMode = mode === "detail";
  const accountType = admin.peran === "Super Admin" ? "super-admin" : "admin";

  return (
    <main className="min-h-screen bg-[#fbfcdf] text-[#10231d] lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        <aside className="hidden w-[230px] shrink-0 flex-col bg-[#185440] px-5 py-6 text-white shadow-[10px_0_28px_rgba(23,79,62,0.18)] lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#185440]">
              <BankIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-lg font-extrabold uppercase">KSP</p>
              <p className="text-lg font-extrabold uppercase">Tarunajaya</p>
              <p className="mt-0.5 text-xs font-semibold text-[#89bea9]">
                Admin Portal
              </p>
            </div>
          </div>

          <nav className="mt-12 space-y-3">
            {adminProfileMenuItems.map((item) => (
              <a
                className="relative flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold text-[#8fc0ab] hover:bg-[#0f6049] hover:text-white"
                href={item.href}
                key={item.label}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </a>
            ))}
          </nav>

          <a
            className="mt-auto flex h-10 items-center gap-3 px-4 text-sm font-semibold text-[#9bc4b4] hover:text-white"
            href="/logout"
          >
            <LogoutIcon className="h-5 w-5" />
            Keluar
          </a>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#dcdcc0] bg-white px-5 sm:px-7 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                aria-label="Buka menu"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#185440] text-white lg:hidden"
                type="button"
              >
                <GridIcon className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold text-[#0f4333] sm:text-xl">
                Dashboard Admin
              </h1>
            </div>
            <div className="flex items-center gap-5 text-[#6b665f]">
</div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-7 lg:px-8">
            <a
              className="mb-7 inline-flex items-center gap-3 text-lg font-medium text-[#10231d] hover:text-[#075f48]"
              href={isDetailMode ? "/dashboard/akun" : "/dashboard"}
            >
              <ArrowLeftIcon className="h-5 w-5" />
              {isDetailMode ? "Kembali ke Kelola Akun" : "Kembali"}
            </a>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight">
                {isDetailMode ? `Detail Akun - ${admin.nama}` : "Profil Admin"}
              </h2>
              <p className="mt-2 text-base text-[#26322e]">
                {isDetailMode
                  ? "Informasi lengkap mengenai profil dan akses admin."
                  : "Kelola informasi data diri dan detail akses admin."}
              </p>
            </div>

            <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className="rounded-xl bg-white p-8 shadow-[0_8px_24px_rgba(23,79,62,0.08)] ring-1 ring-black/10">
                <div className="grid gap-8 md:grid-cols-[170px_1fr]">
                  <div className="flex flex-col items-center">
                    <div className="grid h-32 w-32 place-items-center rounded-full bg-[#f2f2df] text-black ring-4 ring-[#fbfcdf] shadow-md">
                      <UserIcon className="h-20 w-20" />
                    </div>
                    <span className="mt-5 rounded-full bg-[#b8f2df] px-5 py-1.5 text-sm font-bold text-[#06251d]">
                      {admin.status}
                    </span>
                  </div>

                  <div>
                    {isDetailMode ? (
                      <AdminAccountEditableField
                        accountId={admin.id}
                        accountType={accountType}
                        className="[&>p:first-child]:sr-only [&>p:last-child]:mt-0 [&>p:last-child]:text-2xl [&>p:last-child]:font-extrabold"
                        field="name"
                        label="Nama"
                        value={admin.nama}
                      />
                    ) : (
                      <h3 className="text-2xl font-extrabold">{admin.nama}</h3>
                    )}
                    <p className="mt-2 text-base">{admin.id}</p>

                    <div className="mt-8 grid gap-x-16 gap-y-8 sm:grid-cols-2">
                      {isDetailMode ? (
                        <AdminAccountEditableField
                          accountId={admin.id}
                          accountType={accountType}
                          field="email"
                          label="Email"
                          value={admin.email}
                        />
                      ) : (
                        <ProfileField label="Email" value={admin.email} />
                      )}
                      <ProfileField label="Peran" value={admin.peran} />
                      <ProfileField
                        label="Tanggal Bergabung"
                        value={admin.tanggalBergabung}
                      />
                      <ProfileField
                        label="Jenis Kelamin"
                        value={admin.jenisKelamin}
                      />
                      {isDetailMode ? (
                        <AdminAccountEditableField
                          accountId={admin.id}
                          accountType={accountType}
                          field="phone"
                          label="No. Telepon"
                          value={admin.nomorSeluler}
                        />
                      ) : (
                        <ProfileField
                          label="No. Telepon"
                          value={admin.nomorSeluler}
                        />
                      )}
                      {isDetailMode ? (
                        canEditPassword ? (
                          <AdminAccountEditableField
                            accountId={admin.id}
                            accountType={accountType}
                            field="password"
                            label="Kata Sandi"
                            value="********"
                          />
                        ) : (
                          <ProfileField label="Kata Sandi" value="********" />
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex max-h-[520px] min-h-0 flex-col rounded-xl bg-white p-6 shadow-[0_8px_24px_rgba(23,79,62,0.08)] ring-1 ring-black/10">
                <h3 className="text-xl font-extrabold">Aktivitas Terkini</h3>
                <div className="mt-6 min-h-0 flex-1 space-y-5 overflow-y-auto pr-2">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div
                        className="border-b border-[#e6e6d2] pb-4 last:border-b-0 last:pb-0"
                        key={activity.id || `${activity.title}-${activity.time}-${index}`}
                      >
                        <p className="text-sm font-extrabold text-[#10231d]">
                          {activity.title}
                        </p>
                        {activity.detail ? (
                          <p className="mt-1 text-sm text-[#4c5a54]">
                            {activity.detail}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-[#6f7772]">
                          {activity.time}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#4c5a54]">
                      Belum ada aktivitas admin.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-extrabold text-[#26322e]">{label}</p>
      <p className="mt-3 text-base text-black">{value}</p>
    </div>
  );
}

function BankIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 3 7.5v2h18v-2L12 3Zm-6 8v6H4v2h16v-2h-2v-6h-2v6h-3v-6h-2v6H8v-6H6Z" /></svg>;
}
function GridIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h7v7H4V4Zm2 2v3h3V6H6Zm7-2h7v7h-7V4Zm2 2v3h3V6h-3ZM4 13h7v7H4v-7Zm2 2v3h3v-3H6Zm7-2h7v7h-7v-7Zm2 2v3h3v-3h-3Z" /></svg>;
}
function UserSettingsIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h9.1a6.4 6.4 0 0 1-.1-1 6 6 0 0 1 3.1-5.2A13.8 13.8 0 0 0 12 14Zm8.7 5.4.8-.6-1-1.7-1 .4a3 3 0 0 0-.7-.4l-.2-1.1h-2l-.2 1.1a3 3 0 0 0-.7.4l-1-.4-1 1.7.8.6v.8l-.8.6 1 1.7 1-.4a3 3 0 0 0 .7.4l.2 1.1h2l.2-1.1a3 3 0 0 0 .7-.4l1 .4 1-1.7-.8-.6v-.8ZM17.6 21a1 1 0 1 1 1-1 1 1 0 0 1-1 1Z" /></svg>;
}
function WalletIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h14a2 2 0 0 1 2 2v1h-6a4 4 0 0 0 0 8h6v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm10 5h7v4h-7a2 2 0 1 1 0-4Z" /></svg>;
}
function MoneyIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v12H3V6Zm2 3a3 3 0 0 0 3-1H5v1Zm0 6v1h3a3 3 0 0 0-3-1Zm14 1v-1a3 3 0 0 0-3 1h3Zm0-8h-3a3 3 0 0 0 3 1V8Zm-7 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>;
}
function ReportIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h14v18H5V3Zm3 14h2V9H8v8Zm3 0h2V6h-2v11Zm3 0h2v-5h-2v5Z" /></svg>;
}
function CoinIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15.9V20h-2v-2.1A4 4 0 0 1 7.6 15h2.2a2.1 2.1 0 0 0 2.2 1.2c1.2 0 2-.5 2-1.3s-.6-1.2-2.4-1.7c-2.3-.7-3.7-1.6-3.7-3.5A3.5 3.5 0 0 1 11 6.3V4h2v2.2A3.8 3.8 0 0 1 16.1 9H14a1.9 1.9 0 0 0-2-1c-1 0-1.8.5-1.8 1.4s.7 1.1 2.6 1.7c2.4.7 3.4 1.8 3.4 3.5A3.5 3.5 0 0 1 13 17.9Z" /></svg>;
}
function LogoutIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h9v2H6v12h7v2H4V4Zm11.5 4.5 1.4-1.4L22 12l-5.1 4.9-1.4-1.4L18 13h-8v-2h8l-2.5-2.5Z" /></svg>;
}
function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm-7-4h14v-2l-2-2.5V10a5 5 0 0 0-4-4.9V3h-2v2.1A5 5 0 0 0 7 10v3.5L5 16v2Z" /></svg>;
}
function UserIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-4.7 0-8 2.4-8 5v1h16v-1c0-2.6-3.3-5-8-5Z" /></svg>;
}
function ArrowLeftIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="m10 5 1.4 1.4L7.8 10H20v2H7.8l3.6 3.6L10 17l-6-6 6-6Z" /></svg>;
}
