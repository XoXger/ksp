# Plan Proyek Koperasi Simpan Pinjam Tarunajaya

## Snapshot Terbaru

Aplikasi ini adalah sistem koperasi simpan pinjam berbasis Next.js App Router, React, Prisma 7, dan PostgreSQL untuk tiga role: anggota, admin, dan super admin. UI mengikuti rancangan Google Stitch yang sudah diterapkan ke komponen lokal.

Tanggal update konteks: 26 Juni 2026.

## Stack

- Next.js `16.2.6`
- React `19`
- Prisma `7.8.0`
- PostgreSQL
- Tailwind CSS

Catatan: versi Next.js project ini memiliki breaking changes. Jika menambah fitur Next baru, baca dokumentasi lokal di `node_modules/next/dist/docs/`.

## Struktur Project

- `src/app/.../page.tsx` untuk route.
- `src/components/ui/...` untuk tampilan halaman.
- `src/components/...` untuk komponen kecil client-side.
- `src/lib/prisma.ts` untuk helper Prisma.
- `src/lib/session.ts`, `src/lib/memberSession.ts`, `src/lib/activeLogin.ts`, dan `src/lib/adminActivity.ts` untuk session/login dan audit aktivitas admin.
- `prisma/schema.prisma` adalah schema Prisma aktif.
- `public/uploads/simpanan` menyimpan bukti transfer simpanan anggota.
- `ui-snapshots` menyimpan screenshot UI.

## Validasi Teknis

Gunakan perintah berikut dari root project:

```bash
cmd.exe /c "cd /d d:\Users\Lenovo\Documents\koperasi-simpan-pinjam && npx tsc --noEmit"
npx prisma generate
npx prisma db push
npm run lint
```

Catatan Windows: bila PowerShell mengabaikan `workdir`, gunakan path absolut atau `cmd.exe /c "cd /d <path> && <command>"`.

## Akun Testing

Anggota utama:

- `ANG260001` - Arga Budi Mulya - `argabudimulya@gmail.com` / `12345678`

Anggota lain:

- `ANG260002` - Santoso
- `ANG260004` - Intan

Admin:

- `ADM260001` - Fanza Maulana - `fanzamaulana@gmail.com` / `12345678`

Super admin:

- `SAD260001` - Taufik Ramlan - `taufikramlan@gmail.com` / `12345678`
- Ahmad Maulana - `maulana@gmail.com` / `12345678`

## Database

Model utama:

- `Anggota`
- `Admin`
- `SuperAdmin`
- `Simpanan`
- `Pinjaman`
- `PembayaranPinjaman`
- Tabel raw SQL `admin_activity` untuk audit aktivitas admin/super admin.

Model `AccountSession` sudah dihapus. Lock login aktif memakai kolom langsung di tabel `anggota`, `admin`, dan `super_admin`:

- `active_session_id`
- `active_session_seen_at`

Enum penting:

- `AccountStatus`: `AKTIF`, `NONAKTIF`, `MENUNGGU`, `DITOLAK`
- `StatusSimpanan`: `MENUNGGU`, `TERVERIFIKASI`, `DITOLAK`
- `StatusPinjaman`: `MENUNGGU`, `DISETUJUI`, `DITOLAK`
- `StatusPembayaranPinjaman`: `MENUNGGU`, `TERVERIFIKASI`, `DITOLAK`
- `JenisSimpanan`: `POKOK`, `WAJIB`, `SUKARELA`
- `TipeBungaPinjaman`: `MENURUN`, `FLAT`

## Format ID dan Rupiah

- Anggota: `ANG260001`
- Admin: `ADM260001`
- Super admin: `SAD260001`
- Pinjaman: `PJ000001`
- Transaksi: `TRX260001`
- Pembayaran: `BYR260001`
- Rupiah memakai `Rp`, bukan `Rp.`. Contoh: `Rp 500.000`.
- Nilai negatif: `- Rp 7.000.000`.

## Login dan Session

File penting:

- `src/app/login/actions.ts`
- `src/lib/session.ts`
- `src/lib/activeLogin.ts`
- `src/components/ActiveLoginHeartbeat.tsx`
- `src/app/api/active-login/heartbeat/route.ts`
- `src/app/logout/route.ts`

Aturan:

- Hanya akun `AKTIF` yang bisa login.
- Akun `MENUNGGU`, `DITOLAK`, dan `NONAKTIF` ditolak login.
- Akun ditolak menampilkan pesan: `Maaf, anda belum berhak untuk terdaftar sebagai anggota.`
- Akun yang sedang aktif tidak bisa login lagi di tab/browser lain.
- Logout melalui `/logout` membersihkan cookie dan lock login sesuai role yang keluar.
- Session anggota, admin, dan super admin dipisah melalui cookie `memberSessionId`, `adminSessionId`, dan `superAdminSessionId`.
- Bila tab ditutup tanpa logout, browser mengirim sinyal `release`; fallback lock kedaluwarsa sekitar 15 detik tanpa heartbeat.
- Heartbeat aktif berjalan sekitar tiap 5 detik.
- Untuk menghindari tab anggota tertimpa cookie admin, halaman anggota membawa `anggotaId` dan `sessionId` di URL.
- `MemberTabIdentityLinks` menjaga link internal anggota tetap membawa identitas tab.

## Pendaftaran Anggota

Form daftar anggota sudah memiliki:

- Toggle mata kata sandi.
- Popup konfirmasi `Ya` dan `Tidak`.
- Validasi field wajib, radio gender, dan syarat ketentuan.
- Nama otomatis kapital di awal kata.
- Akun baru masuk status `MENUNGGU` dan perlu disetujui admin/super admin.
- Pesan sukses rata tengah.

Validasi:

- Nama minimal 3 huruf.
- Email minimal 6 huruf sebelum `@` dan domain valid.
- Kata sandi harus 8 karakter huruf/angka.
- Nomor seluler 10 digit setelah `+62`.
- Pesan browser untuk nama/password sudah custom.

## Simpanan

Simpanan default anggota aktif/baru diterima:

- Simpanan Pokok: `Rp 500.000`
- Simpanan Wajib: `Rp 300.000`
- Simpanan Sukarela: `Rp 200.000`

Tambah simpanan anggota:

- Route: `/simpanan/tambah`.
- Nama anggota otomatis sesuai login/tab.
- Pilihan: Simpanan Wajib dan Simpanan Sukarela.
- Radio terpilih diberi warna hijau samar.
- Nominal memakai pemisah ribuan.
- Placeholder nominal: `300.000` untuk Wajib dan `100.000` untuk Sukarela.
- Nominal Simpanan Wajib harus tepat `Rp 300.000`.
- Minimal nominal Simpanan Sukarela `Rp 100.000`.
- Jika Simpanan Wajib `Rp 300.000` bulan berjalan sudah `TERVERIFIKASI`, radio Simpanan Wajib otomatis tidak dapat dipencet.
- Tanggal transfer hanya boleh dari 7 hari terakhir sampai hari ini.
- Bukti transfer wajib PNG/JPG maksimal 5MB.
- Bukti transfer disimpan ke `public/uploads/simpanan`.
- Database menyimpan path bukti transfer, contoh `/uploads/simpanan/<file>.jpg`.
- Status awal simpanan upload anggota adalah `MENUNGGU`.

Kelola Simpanan admin/super admin:

- Summary mengambil data database.
- Riwayat simpanan mengambil data database.
- Search bisa mencari nama atau ID.
- Filter: `Terverifikasi`, `Menunggu`, `Ditolak`.
- Menu aksi: `Detail`, `Setujui`, `Tolak`, `Hapus`.
- Menu `Hapus` tidak muncul untuk simpanan otomatis/default anggota baru.
- `Setujui` dan `Tolak` memakai popup konfirmasi `Ya`/`Tidak`.
- `Hapus` memakai popup konfirmasi `Ya`/`Tidak`.
- Detail simpanan menampilkan tanggal transfer asli dan gambar bukti transfer asli untuk upload baru.
- Simpanan otomatis/default tidak menampilkan bukti transfer.
- Tombol `Cetak Bukti` tersedia untuk semua detail simpanan dan mengekspor PDF; PDF menampilkan gambar bukti transfer jika ada.

## Pinjaman

- `/pinjaman` menampilkan data pinjaman anggota dari database.
- `/pinjaman/baru` mengirim pengajuan pinjaman anggota ke Kelola Pinjaman admin.
- Rumus pengajuan disamakan dengan Simulasi Pinjaman.
- Tipe bunga: `Menurun` dan `Tetap (Flat)`.
- ID pinjaman memakai `PJ000001`.
- Tabel informasi pinjaman memiliki status `Menunggu`, `Terutang`, `Lunas`, `Ditolak`.
- `/pinjaman/bayar-tagihan` sudah memiliki rekening koperasi, upload bukti, tombol kirim, dan riwayat pembayaran.
- Admin memiliki `/dashboard/pinjaman/pembayaran` dan detail pembayaran.
- Kotak Distribusi Pinjaman anggota sudah dihapus.
- Kotak Aktivitas Terkini dipindahkan ke posisi kanan halaman Pinjaman.

## Simulasi Pinjaman

- Tombol `Kalkulasi` sudah berfungsi.
- Kotak hasil kalkulasi berubah sesuai input.
- Tabel angsuran berisi `No.`, `Bulan`, `Sisa Pokok Awal`, `Pokok`, `Bunga`, dan `Total Angsuran`.
- Pokok pinjaman memakai pemisah ribuan.
- Minimal nominal `Rp 1.000.000`, jangka waktu 5 bulan, bunga 0.5% per bulan.

## Laporan Koperasi

- Rincian laporan berdasarkan database.
- Kategori: Simpanan Pokok, Simpanan Wajib, Simpanan Sukarela, Angsuran Pinjaman, Pencairan Pinjaman.
- Arus kas masuk, arus kas keluar, dan saldo bersih mengikuti rincian laporan.
- Tombol `Unduh PDF` sudah dihapus.
- Tombol `Unduh Excel` masih ada.
- Badge `Sehat` sudah dihapus.
- Rincian laporan memakai icon garis tiga untuk minimize.

## SHU

Rumus aktif:

- Laba Bersih = total bunga pinjaman seluruh anggota - `Rp 7.000.000`.
- Dana Cadangan = Laba Bersih x `40%`.
- Dana Anggota = Laba Bersih x `60%`.
- Dana Jasa Simpanan = Dana Anggota x `70%`.
- Dana Jasa Pinjaman = Dana Anggota x `30%`.
- SHU Simpanan = `(Total Simpanan Anggota / Total Simpanan Seluruh Anggota) x Dana Jasa Simpanan`.
- SHU Pinjaman = `(Total Bunga Dibayar Anggota / Total Bunga Dibayar Seluruh Anggota) x Dana Jasa Pinjaman`.
- Estimasi SHU negatif ditampilkan `Rp 0`.

SHU admin:

- Menampilkan Laba Bersih, Dana Cadangan, dan Dana Anggota.
- Daftar Penerima SHU menampilkan anggota aktif.
- Search berdasarkan ID atau nama.
- Tombol `Unduh` ekspor Excel.
- Menu `Kirim` menyimpan SHU sebagai Simpanan Sukarela dan disabled jika estimasi `Rp 0`.

SHU anggota:

- Ringkasan SHU mengikuti rumus admin.
- Riwayat Pembagian SHU berasal dari aksi `Kirim` admin.
- Tombol `Cetak Riwayat` mengunduh riwayat.
- Simulasi SHU sudah disederhanakan menjadi satu kotak parameter memanjang.

## Profil Admin dan Audit Aktivitas

- `/dashboard/profil` menampilkan profil admin/super admin yang sedang login.
- Kotak `Aktivitas Terkini` berada di samping kartu profil admin/super admin.
- Aktivitas tersimpan di tabel raw SQL `admin_activity`.
- Aktivitas yang dicatat saat ini:
  - update status akun anggota;
  - hapus akun anggota ditolak/nonaktif;
  - setujui/tolak/hapus simpanan;
  - setujui/tolak pinjaman;
  - kirim SHU anggota.
- Tabel `admin_activity` dibuat otomatis oleh helper `src/lib/adminActivity.ts` saat aktivitas dibaca/dicatat.

## Route Utama

Anggota:

- `/anggota`
- `/anggota/riwayat`
- `/anggota/profil`
- `/anggota/aktivitas`
- `/simpanan`
- `/simpanan/tambah`
- `/pinjaman`
- `/pinjaman/baru`
- `/pinjaman/bayar-tagihan`
- `/shu`
- `/shu/simulasi`
- `/simulasi-pinjaman`

Admin/super admin:

- `/dashboard`
- `/dashboard/profil`
- `/dashboard/aktivitas`
- `/dashboard/akun`
- `/dashboard/akun/anggota/[id]`
- `/dashboard/akun/admin/[id]`
- `/dashboard/akun/super-admin/[id]` masih belum dipakai/masih perlu finalisasi jika super admin detail dipisah
- `/dashboard/simpanan`
- `/dashboard/simpanan/[id]`
- `/dashboard/pinjaman`
- `/dashboard/pinjaman/pembayaran`
- `/dashboard/pinjaman/pembayaran/[id]`
- `/dashboard/laporan`
- `/dashboard/shu`

Route yang tidak dipakai:

- `/dashboard/shu/hitung-pembagian`

## Catatan UI

- Background utama: `#fbfcdf`.
- Sidebar hijau utama: `#185440`.
- Hijau aktif admin: `#075f48`.
- Semua button/interaksi harus memakai cursor pointer.
- Dropdown tabel sebaiknya `position: fixed` agar tidak terpotong box.
- Dropdown tidak boleh muncul di pojok kiri atas halaman.
- Halaman profil anggota/admin tidak menampilkan icon profil di header.
- Background halaman pinjaman dan pengajuan pinjaman baru anggota mengikuti warna simpanan.
- Icon notifikasi/lonceng sudah dihapus.
- Beranda anggota tidak memakai kotak Statistik Dana.
- Tombol `Riwayat` di kartu Total Saldo Aktif anggota berada di kanan bawah.
- Halaman Pinjaman anggota tidak memakai kotak Distribusi Pinjaman.

## Status Terakhir

- Update konteks terakhir: 26 Juni 2026.
- Tambah Simpanan sudah terhubung ke Kelola Simpanan.
- Status awal simpanan upload anggota adalah `MENUNGGU`.
- Aksi `Setujui`, `Tolak`, dan `Hapus` simpanan sudah memakai popup konfirmasi.
- Detail simpanan menampilkan tanggal transfer dan bukti transfer asli untuk upload baru.
- Simpanan Wajib bulan berjalan terkunci jika sudah ada pembayaran `Rp 300.000` yang terverifikasi.
- Profil admin/super admin sudah memiliki kotak Aktivitas Terkini berbasis tabel `admin_activity`.
- Validasi terakhir terkait perubahan terbaru: `npx tsc --noEmit` berhasil.
