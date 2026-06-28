# Koperasi Simpan Pinjam Tarunajaya

Aplikasi koperasi simpan pinjam berbasis Next.js App Router untuk tiga role utama:

- Anggota
- Admin
- Super admin

Project ini mengelola pendaftaran anggota, approval akun, simpanan, pinjaman, pembayaran angsuran, laporan koperasi, SHU, audit aktivitas admin, export Excel, dan cetak PDF untuk bukti/laporan.

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
- `public/uploads/pinjaman` - lokasi upload dokumen pendukung pengajuan pinjaman.
- `public/uploads/pembayaran-pinjaman` - lokasi upload bukti pembayaran tagihan pinjaman.
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
- `/dashboard/akun/admin/[id]` - Detail akun admin untuk super admin
- `/dashboard/akun/super-admin/[id]` - Detail akun super admin untuk super admin
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
- Login aktif memakai heartbeat berbasis interaksi pengguna. Interaksi klik, navigasi, keyboard, sentuh, atau input memperbarui status aktif akun.
- Jika tab ditutup tanpa logout, browser mengirim sinyal `release`; fallback lock kedaluwarsa sekitar 30 detik tanpa heartbeat/interaksi.
- Multi-tab anggota dijaga dengan `anggotaId` dan `sessionId` di URL anggota.

### Pendaftaran Anggota

- Validasi nama minimal 3 huruf.
- Validasi email minimal 6 huruf sebelum `@`.
- Kata sandi harus 8 karakter.
- Nomor seluler harus 10-12 digit angka tanpa simbol/huruf.
- Email dan nomor seluler ditolak bila sudah digunakan oleh anggota, admin, atau super admin.
- Nama otomatis dikapitalisasi.
- Popup konfirmasi sebelum daftar.
- Akun baru masuk status `MENUNGGU` dan perlu approval admin/super admin.
- Detail akun anggota status `MENUNGGU`, `DITOLAK`, dan `NONAKTIF` tidak menampilkan riwayat transaksi terakhir.
- Detail akun anggota mendukung edit nama, email, nomor telepon, dan kata sandi dari ikon marker. Perubahan email/kata sandi tersinkron dengan data login anggota.
- Nama anggota pada detail akun maksimal 50 karakter dan hanya boleh berisi huruf serta spasi.

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
- Kelola Simpanan memiliki tombol `Unduh` untuk ekspor riwayat simpanan anggota ke Excel.

### Pinjaman

- Pengajuan pinjaman baru anggota terhubung ke Kelola Pinjaman admin.
- Rumus pengajuan pinjaman mengikuti simulasi pinjaman.
- Mendukung tipe bunga `Menurun` dan `Tetap (Flat)`.
- ID pinjaman memakai format `PJ000001`.
- Nominal pinjaman minimal `Rp 1.000.000`.
- Satu anggota maksimal memiliki dua pengajuan/pinjaman, dengan akumulasi nominal maksimal `Rp 10.000.000`.
- Jangka waktu pinjaman minimal 4 bulan dan maksimal 12 bulan.
- Bunga pinjaman minimal 0,5% dan maksimal 1,5% per bulan.
- Dokumen pendukung pengajuan pinjaman wajib JPG/PNG maksimal 5MB dan dapat dipreview di detail pengajuan.
- Pembayaran tagihan pinjaman anggota memiliki upload bukti JPG/PNG maksimal 5MB, validasi wajib upload, dan riwayat pembayaran.
- Tagihan saat ini hanya berubah setelah pembayaran disetujui/terverifikasi admin/super admin.
- Jika pembayaran masih `MENUNGGU`, tagihan berikutnya belum naik.
- Jika angsuran yang sama masih `MENUNGGU`, anggota tidak dapat mengirim bukti pembayaran dobel dan sistem menampilkan pesan bahwa pembayaran sedang menunggu konfirmasi admin.
- Admin memiliki halaman Pembayaran Anggota dan Detail Pembayaran Anggota.
- Detail pembayaran anggota menampilkan data transaksi sebenarnya, foto bukti transfer yang diunggah anggota, popup preview gambar, tombol `Cetak Bukti` PDF, serta tombol `Setujui Pembayaran` dan `Tolak Pembayaran` dengan konfirmasi.
- Kelola Pinjaman memiliki ekspor Excel untuk Pengajuan Terbaru.
- Tabel Informasi Pinjaman anggota, Pengajuan Terbaru, dan Riwayat Pembayaran Anggota menampilkan kolom `Tipe` untuk tipe bunga `Menurun` atau `Tetap (Flat)`.
- Pinjaman berstatus `DISETUJUI` memiliki menu `Hapus` sebagai pengamanan admin/super admin; penghapusan juga menyesuaikan data anggota dan tercatat di aktivitas admin.
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
- Periode buku SHU anggota mengikuti tahun berjalan.
- Simulasi SHU anggota memakai rumus dan konteks dana SHU yang sama dengan halaman SHU anggota.
- Riwayat pembagian SHU anggota bisa diunduh.

## Rumus Perhitungan

### Simpanan

- Total Simpanan Aktif = jumlah simpanan anggota dengan status `TERVERIFIKASI`.
- Total Simpanan per jenis = jumlah simpanan `TERVERIFIKASI` berdasarkan `POKOK`, `WAJIB`, atau `SUKARELA`.
- Simpanan yang masih `MENUNGGU` atau `DITOLAK` tidak dihitung ke saldo aktif anggota, profil anggota, beranda anggota, riwayat transaksi anggota, dan laporan anggota.

### Pinjaman dan Angsuran

Konstanta pinjaman:

- Minimal nominal pinjaman = `Rp 1.000.000`.
- Maksimal akumulasi pinjaman per anggota = `Rp 10.000.000`.
- Maksimal jumlah pinjaman per anggota = 2 pinjaman.
- Minimal tenor = 4 bulan.
- Maksimal tenor = 12 bulan.
- Minimal bunga = 0,5% per bulan.
- Maksimal bunga = 1,5% per bulan.

Rumus angsuran:

- Bunga Bulanan = `bunga / 100`.
- Pokok Angsuran Reguler = `floor(nominal pinjaman / tenor)`.
- Sisa Pokok Awal Bulan ke-n = `nominal pinjaman - (Pokok Angsuran Reguler x (n - 1))`.
- Pokok Angsuran Bulan ke-n = `Pokok Angsuran Reguler`, kecuali bulan terakhir memakai seluruh sisa pokok.
- Jika tipe bunga `MENURUN`, Dasar Bunga = Sisa Pokok Awal Bulan ke-n.
- Jika tipe bunga `FLAT`, Dasar Bunga = Nominal Pinjaman awal.
- Bunga Bulan ke-n = `round(Dasar Bunga x Bunga Bulanan)`.
- Total Angsuran Bulan ke-n = `Pokok Angsuran Bulan ke-n + Bunga Bulan ke-n`.

Tagihan anggota:

- Tagihan Saat Ini = jumlah angsuran berjalan dari seluruh pinjaman `DISETUJUI`.
- Urutan angsuran hanya maju jika pembayaran sebelumnya berstatus `TERVERIFIKASI`.
- Pembayaran `MENUNGGU` tidak mengubah Tagihan Saat Ini.
- Pembayaran `DITOLAK` tidak dihitung sebagai angsuran terbayar.

Jatuh tempo:

- Jatuh tempo normal adalah tanggal 1 bulan berikutnya.
- Jika pembayaran/pengajuan berada dalam 7 hari terakhir sebelum tanggal 1 bulan berikutnya, jatuh tempo diarahkan ke tanggal 1 dua bulan berikutnya.
- Perhitungan bisnis menganggap satu bulan 30 hari untuk aturan ambang 7 hari.

### SHU

Rumus SHU aktif:

- Total Bunga Pinjaman = jumlah bunga dari seluruh pinjaman `DISETUJUI` berdasarkan skema angsuran pinjaman.
- Laba Bersih = `Total Bunga Pinjaman - Rp 7.000.000`.
- Laba Bersih Distribusi = `max(0, Laba Bersih)`.
- Dana Cadangan = `Laba Bersih Distribusi x 40%`.
- Dana Anggota = `Laba Bersih Distribusi x 60%`.
- Dana Jasa Simpanan = `Dana Anggota x 70%`.
- Dana Jasa Pinjaman = `Dana Anggota x 30%`.
- Total Simpanan Seluruh Anggota = jumlah simpanan `TERVERIFIKASI` milik anggota aktif.
- Total Bunga Seluruh Anggota = Total Bunga Pinjaman.
- SHU Simpanan Anggota = `(Total Simpanan Anggota / Total Simpanan Seluruh Anggota) x Dana Jasa Simpanan`.
- SHU Pinjaman Anggota = `(Total Bunga Pinjaman Anggota / Total Bunga Seluruh Anggota) x Dana Jasa Pinjaman`.
- Total Estimasi SHU Anggota = `max(0, SHU Simpanan Anggota + SHU Pinjaman Anggota)`.

Catatan implementasi:

- Jika hasil SHU negatif, UI menampilkan `Rp 0` untuk total estimasi.
- Dashboard admin menampilkan Sisa Hasil Usaha sebagai `max(0, Laba Bersih)`, sedangkan Kelola SHU tetap menampilkan Laba Bersih raw agar kondisi rugi terlihat.
- Daftar Penerima SHU admin menampilkan Simpanan sebagai total simpanan terverifikasi aktual dan Pinjaman sebagai total pinjaman disetujui aktual.
- Simulasi SHU anggota memakai konteks dana SHU aktual yang sama dengan halaman SHU anggota.
- Untuk simulasi input pinjaman, estimasi bunga pinjaman simulasi memakai `input pinjaman x 1,5%` sebagai kontribusi jasa pinjaman simulasi.

### Profil dan Aktivitas Admin

- Profil admin/super admin tersedia di `/dashboard/profil`.
- Kotak `Aktivitas Terkini` menampilkan aktivitas admin/super admin yang sedang login.
- Kotak aktivitas memiliki scrollbar jika daftar aktivitas melebihi tinggi kartu.
- Super admin dapat membuka detail akun admin dan super admin dari Kelola Akun; halaman detail menampilkan data diri dan aktivitas akun yang dipilih.
- Super admin dapat mengubah nama, email, nomor telepon, dan kata sandi admin/super admin dari halaman detail akun admin/super admin.
- Edit nama admin/super admin maksimal 50 karakter dan hanya boleh berisi huruf serta spasi; nomor telepon 10-12 digit; kata sandi 8 karakter huruf/angka.
- Aktivitas admin tersimpan di tabel raw SQL `admin_activity`.
- Aktivitas yang dicatat saat ini mencakup aksi akun anggota, simpanan, pinjaman, dan kirim SHU.

### Penyesuaian UI Terbaru

- Icon notifikasi/lonceng sudah dihapus dari header karena tidak digunakan.
- Kotak Statistik Dana di beranda anggota sudah dihapus.
- Tombol `Riwayat` pada kartu Total Saldo Aktif anggota berada di kanan bawah kartu.
- Kotak Distribusi Pinjaman anggota dihapus dan diganti posisi Aktivitas Terkini.
- Tombol `Cetak Laporan` di beranda anggota mengekspor PDF berisi nama anggota, ID anggota, simpanan per jenis, pinjaman, riwayat transaksi, estimasi SHU, serta tanggal/waktu cetak.
- Dropdown titik tiga pada Kelola Akun, Kelola Simpanan, Kelola Pinjaman, Riwayat Pembayaran Anggota, dan SHU admin menutup otomatis saat klik di luar menu.

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
- Lock login aktif memakai kolom `active_session_id` dan `active_session_seen_at` pada tabel akun dengan masa segar sekitar 30 detik.
- Session per role memakai cookie `memberSessionId`, `adminSessionId`, dan `superAdminSessionId`.
- Password masih plaintext untuk development; untuk produksi perlu hashing.
- Perubahan schema saat ini memakai `npx prisma db push`, belum migration formal.
- File upload masih disimpan lokal di `public/uploads`; untuk production perlu storage permanen.

## Dokumen Lanjutan

Baca dokumen berikut untuk konteks lebih detail sebelum melanjutkan pengembangan:

- `plan.md`
- `roadmap.md`
