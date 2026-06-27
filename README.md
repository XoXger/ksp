# Koperasi Simpan Pinjam Tarunajaya

Aplikasi koperasi simpan pinjam berbasis Next.js App Router untuk tiga role utama:

- Anggota
- Admin
- Super admin

Project ini mengelola pendaftaran anggota, approval akun, simpanan, pinjaman, pembayaran angsuran, laporan koperasi, dan SHU.

## Stack

- Next.js `16.2.6`
- React `19`
- Prisma `7.8.0`
- PostgreSQL
- Tailwind CSS
- App Router dan Server Component

Catatan: versi Next.js di project ini memiliki breaking changes. Jika menambah fitur Next.js baru, baca dokumentasi lokal di `node_modules/next/dist/docs/` terlebih dahulu.

## Struktur Utama

- `src/app` - route App Router.
- `src/components/ui` - komponen tampilan halaman.
- `src/components` - komponen client-side kecil dan utilitas UI.
- `src/lib` - helper session, Prisma, login aktif, audit aktivitas admin, dan utilitas server.
- `prisma/schema.prisma` - schema Prisma aktif.
- `public/uploads/simpanan` - lokasi upload bukti transfer simpanan anggota.
- `ui-snapshots` - folder snapshot/screenshot UI.

## Setup Development

Install dependency:

```bash
npm install
```

Generate Prisma Client:

```bash
npx prisma generate
```

Sinkronkan schema ke database:

```bash
npx prisma db push
```

Jalankan development server:

```bash
npm run dev
```

Buka aplikasi di:

```text
http://localhost:3000
```

Pada Windows jika PowerShell bermasalah dengan working directory, gunakan pola berikut:

```bash
cmd.exe /c "cd /d d:\Users\Lenovo\Documents\koperasi-simpan-pinjam && npm run dev"
```

## Validasi

Type-check:

```bash
cmd.exe /c "cd /d d:\Users\Lenovo\Documents\koperasi-simpan-pinjam && npx tsc --noEmit"
```

Lint:

```bash
npm run lint
```

Prisma:

```bash
npx prisma generate
npx prisma db push
```

## Role dan Route Utama

### Anggota

- `/anggota` - Beranda anggota
- `/anggota/riwayat` - Riwayat transaksi anggota
- `/anggota/profil` - Profil anggota
- `/anggota/aktivitas` - Riwayat Aktivitas Koperasi
- `/simpanan` - Simpanan anggota
- `/simpanan/tambah` - Tambah simpanan
- `/pinjaman` - Pinjaman anggota
- `/pinjaman/baru` - Pengajuan pinjaman baru
- `/pinjaman/bayar-tagihan` - Bayar Tagihan Pinjaman
- `/shu` - SHU anggota
- `/shu/simulasi` - Simulasi SHU anggota
- `/simulasi-pinjaman` - Simulasi pinjaman anggota

### Admin dan Super Admin

- `/dashboard` - Beranda admin
- `/dashboard/profil` - Profil admin/super admin
- `/dashboard/aktivitas` - Riwayat Aktivitas Koperasi
- `/dashboard/akun` - Kelola akun
- `/dashboard/akun/anggota/[id]` - Detail akun anggota
- `/dashboard/simpanan` - Kelola simpanan
- `/dashboard/simpanan/[id]` - Detail simpanan
- `/dashboard/pinjaman` - Kelola pinjaman
- `/dashboard/pinjaman/pembayaran` - Pembayaran anggota
- `/dashboard/pinjaman/pembayaran/[id]` - Detail pembayaran anggota
- `/dashboard/laporan` - Laporan koperasi
- `/dashboard/shu` - Kelola SHU

Route yang tidak dipakai lagi:

- `/dashboard/shu/hitung-pembagian`

## Fitur Saat Ini

### Akun dan Login

- Login anggota, admin, dan super admin.
- Akun harus berstatus `AKTIF` agar bisa login.
- Akun `MENUNGGU`, `DITOLAK`, dan `NONAKTIF` tidak bisa login.
- Pencegahan login ganda untuk akun yang sama.
- Logout melalui `/logout` membersihkan cookie dan lock login sesuai role yang keluar.
- Session anggota, admin, dan super admin dipisah agar tab beda role tidak saling menimpa.
- Jika tab ditutup tanpa logout, browser mengirim sinyal `release`; fallback lock kedaluwarsa sekitar 15 detik.
- Multi-tab anggota dijaga dengan `anggotaId` dan `sessionId` di URL anggota.

### Pendaftaran Anggota

- Validasi nama minimal 3 huruf.
- Validasi email minimal 6 huruf sebelum `@`.
- Kata sandi harus 8 karakter.
- Nomor seluler harus 10 digit setelah `+62`.
- Nama otomatis dikapitalisasi.
- Popup konfirmasi sebelum daftar.
- Akun baru masuk status `MENUNGGU` dan perlu approval admin/super admin.

### Simpanan

Simpanan default anggota aktif:

- Simpanan pokok: `Rp 500.000`
- Simpanan wajib: `Rp 300.000`
- Simpanan sukarela: `Rp 200.000`

Tambah simpanan anggota:

- Simpanan Wajib harus tepat `Rp 300.000`.
- Simpanan Sukarela minimal `Rp 100.000`.
- Jika Simpanan Wajib `Rp 300.000` bulan berjalan sudah `TERVERIFIKASI`, pilihan Simpanan Wajib otomatis terkunci.
- Tanggal transfer hanya boleh dari 7 hari terakhir sampai hari ini.
- Bukti transfer wajib PNG/JPG maksimal 5MB.
- Bukti transfer disimpan ke `public/uploads/simpanan`.
- Status awal simpanan upload anggota adalah `MENUNGGU`.
- Admin/super admin dapat `Setujui`, `Tolak`, `Hapus`, dan melihat detail bukti transfer.
- Menu `Hapus` tidak ditampilkan untuk simpanan otomatis/default anggota baru.
- Tombol `Cetak Bukti` tersedia pada setiap detail transaksi dan mengekspor PDF berisi data transaksi serta gambar bukti transfer jika ada.

### Pinjaman

- Pengajuan pinjaman baru anggota terhubung ke Kelola Pinjaman admin.
- Rumus pengajuan pinjaman mengikuti simulasi pinjaman.
- Mendukung tipe bunga `Menurun` dan `Tetap (Flat)`.
- ID pinjaman memakai format `PJ000001`.
- Pembayaran tagihan pinjaman anggota sudah memiliki halaman dan riwayat pembayaran.
- Admin memiliki halaman Pembayaran Anggota dan Detail Pembayaran Anggota.
- Halaman pinjaman anggota tidak lagi memakai kotak Distribusi Pinjaman.
- Kotak Aktivitas Terkini ditempatkan di sisi kanan halaman pinjaman anggota.

### Laporan Koperasi

- Rincian laporan berbasis database.
- Kategori laporan: Simpanan Pokok, Simpanan Wajib, Simpanan Sukarela, Angsuran Pinjaman, dan Pencairan Pinjaman.
- Arus kas masuk, arus kas keluar, dan saldo bersih mengikuti rincian laporan.
- Export Excel tersedia.

### SHU

Rumus aktif:

- Laba Bersih = total bunga pinjaman seluruh anggota - `Rp 7.000.000`.
- Dana Cadangan = Laba Bersih x `40%`.
- Dana Anggota = Laba Bersih x `60%`.
- Dana Jasa Simpanan = Dana Anggota x `70%`.
- Dana Jasa Pinjaman = Dana Anggota x `30%`.
- Estimasi SHU negatif ditampilkan `Rp 0`.

Fitur SHU:

- Admin melihat daftar penerima SHU anggota aktif.
- Search daftar penerima SHU berdasarkan ID atau nama.
- Export Excel daftar penerima SHU.
- Aksi `Kirim` menyimpan SHU sebagai Simpanan Sukarela anggota.
- Anggota melihat ringkasan dan riwayat pembagian SHU.
- Riwayat pembagian SHU anggota bisa diunduh.

### Profil dan Aktivitas Admin

- Profil admin/super admin tersedia di `/dashboard/profil`.
- Kotak `Aktivitas Terkini` menampilkan aktivitas admin/super admin yang sedang login.
- Aktivitas admin tersimpan di tabel raw SQL `admin_activity`.
- Aktivitas yang dicatat saat ini mencakup aksi akun anggota, simpanan, pinjaman, dan kirim SHU.

### Penyesuaian UI Terbaru

- Icon notifikasi/lonceng sudah dihapus dari header karena tidak digunakan.
- Kotak Statistik Dana di beranda anggota sudah dihapus.
- Tombol `Riwayat` pada kartu Total Saldo Aktif anggota berada di kanan bawah kartu.
- Kotak Distribusi Pinjaman anggota dihapus dan diganti posisi Aktivitas Terkini.

## Format Data

Format rupiah:

- Gunakan `Rp`, bukan `Rp.`.
- Contoh: `Rp 500.000`.
- Nilai negatif: `- Rp 7.000.000`.

Format ID:

- Anggota: `ANG260001`
- Admin: `ADM260001`
- Super admin: `SAD260001`
- Pinjaman: `PJ000001`
- Transaksi: `TRX260001`
- Pembayaran: `BYR260001`
- Audit aktivitas admin: tabel `admin_activity`

## Akun Testing

Anggota:

- `argabudimulya@gmail.com` / `12345678`

Admin:

- `fanzamaulana@gmail.com` / `12345678`

Super admin:

- `taufikramlan@gmail.com` / `12345678`
- `maulana@gmail.com` / `12345678`

## Catatan Teknis

- Prisma Client aktif berasal dari `src/generated/prisma/client`.
- Schema aktif adalah `prisma/schema.prisma`.
- Tabel `account_session` sudah tidak dipakai.
- Lock login aktif memakai kolom `active_session_id` dan `active_session_seen_at` pada tabel akun.
- Session per role memakai cookie `memberSessionId`, `adminSessionId`, dan `superAdminSessionId`.
- Password masih plaintext untuk development; untuk produksi perlu hashing.
- Perubahan schema saat ini memakai `npx prisma db push`, belum migration formal.
- File upload masih disimpan lokal di `public/uploads`; untuk production perlu storage permanen.

## Dokumen Lanjutan

Baca dokumen berikut untuk konteks lebih detail sebelum melanjutkan pengembangan:

- `plan.md`
- `roadmap.md`
