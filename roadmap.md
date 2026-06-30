# Roadmap Lanjutan Proyek

## Snapshot Kondisi Saat Ini

Project Koperasi Simpan Pinjam Tarunajaya sudah memiliki alur utama untuk anggota, admin, dan super admin. Banyak halaman sudah terhubung ke database, terutama akun, simpanan, pinjaman, laporan, dan SHU.

Update konteks: 29 Juni 2026.

Area yang sudah cukup matang:

- Login anggota, admin, dan super admin.
- Pencegahan login ganda untuk akun yang sama.
- Session per role untuk anggota, admin, dan super admin agar tab berbeda role tidak saling menimpa.
- Logout bersih lewat `/logout` sesuai role yang keluar.
- Release active login saat tab ditutup dan fallback lock sekitar 30 detik tanpa heartbeat.
- Heartbeat login aktif berjalan otomatis selama dashboard terbuka; auto-disconnect karena idle 30 detik sudah dihapus.
- Login memvalidasi email/password sebelum mengecek lock sesi aktif sehingga pesan `Akun sedang digunakan` hanya muncul jika kredensial benar.
- Approval akun anggota baru.
- Kelola akun, filter, search, ekspor, detail, update status, dan hapus akun ditolak/nonaktif.
- Simpanan default anggota aktif.
- Default simpanan anggota aktif otomatis dilengkapi per jenis dan ID `TRX` dibuat aman agar tidak bentrok.
- Tambah simpanan anggota dengan validasi nominal, tanggal, dan bukti transfer.
- Simpanan Wajib bulanan harus tepat `Rp 300.000` dan terkunci bila bulan berjalan sudah terverifikasi.
- Kelola simpanan admin berbasis database, termasuk `Setujui`, `Tolak`, `Hapus`, dan detail bukti transfer.
- Cetak bukti transaksi simpanan ke PDF.
- Pengajuan pinjaman anggota dan kelola pinjaman admin.
- Halaman pinjaman anggota sudah tidak memakai Distribusi Pinjaman; Aktivitas Terkini dipindah ke sisi kanan.
- Halaman pembayaran tagihan pinjaman anggota.
- Halaman pembayaran anggota admin dan detail pembayaran.
- Verifikasi/tolak pembayaran pinjaman dari detail pembayaran admin/super admin.
- Bukti pembayaran pinjaman wajib JPG/PNG maksimal 5MB dan wajib diupload.
- Tagihan pinjaman anggota tidak berubah sebelum pembayaran disetujui/terverifikasi.
- Pengiriman bukti pembayaran dobel untuk angsuran yang masih `MENUNGGU` sudah ditolak.
- Pengajuan pinjaman dibatasi maksimal dua pinjaman/pengajuan yang belum lunas per anggota dan total akumulasi maksimal `Rp 10.000.000`.
- Pinjaman selesai/lunas tidak dihitung sebagai batas dua pinjaman aktif.
- Tipe bunga tampil di informasi pinjaman anggota, Pengajuan Terbaru admin, dan Riwayat Pembayaran Anggota.
- Tipe bunga `Tetap (Flat)` memakai rumus total bunga `Pokok Pinjaman x persentase bunga x Lama Pinjaman`, termasuk di Simulasi Pinjaman.
- Kelola Pinjaman memiliki ekspor Excel untuk Pengajuan Terbaru.
- Pengajuan Terbaru di Kelola Pinjaman dibatasi 5 data per halaman.
- Informasi Pinjaman anggota, Riwayat Transaksi anggota, Riwayat Pembayaran Bayar Tagihan, dan Riwayat Pembagian SHU anggota dibatasi 5 data per halaman dengan pagination `< 1 >`.
- Laporan koperasi berbasis database.
- SHU admin dan SHU anggota berbasis rumus yang sudah dipatenkan.
- Simulasi SHU anggota memakai konteks rumus SHU aktual.
- Export Excel untuk beberapa tabel.
- Cetak laporan PDF beranda anggota.
- Profil anggota dan profil admin/super admin.
- Profil admin/super admin memiliki kotak Aktivitas Terkini berbasis tabel `admin_activity`.
- Detail akun admin dan super admin dari Kelola Akun sudah tersedia untuk super admin.
- Detail akun anggota/admin/super admin mendukung edit data profil sesuai hak akses. Nama maksimal 50 karakter dan hanya huruf/spasi.
- Akun anggota `NONAKTIF` dapat diaktifkan kembali dari marker status di detail akun dan tetap menampilkan riwayat transaksi terakhir; akun `MENUNGGU`/`DITOLAK` tetap kosong.
- Dropdown titik tiga di tabel admin menutup otomatis saat klik di luar menu.
- Dashboard admin/super admin memakai metrik real-time untuk anggota aktif, simpanan terverifikasi, pinjaman disetujui, dan Sisa Hasil Usaha yang sinkron dengan halaman SHU.
- Riwayat Aktivitas Koperasi.

Dokumen yang perlu dibaca saat membuka percakapan baru:

- `plan.md`
- `roadmap.md`
- `README.md`

## Prioritas Paling Mendesak

### 1. Tes alur tambah simpanan sampai approval admin

File terkait:

- `src/app/simpanan/tambah/actions.ts`
- `src/components/ui/MemberAddSavingsView.tsx`
- `src/app/dashboard/simpanan/page.tsx`
- `src/components/ui/AdminSavingsView.tsx`
- `src/app/api/simpanan/[id]/route.ts`
- `src/app/dashboard/simpanan/[id]/page.tsx`
- `src/components/ui/AdminSavingsDetailView.tsx`

Tes manual:

- Tambah Simpanan Wajib harus tepat `Rp 300.000`.
- Jika Simpanan Wajib bulan berjalan sudah `TERVERIFIKASI`, radio Simpanan Wajib harus terkunci.
- Tambah Simpanan Sukarela minimal `Rp 100.000`.
- Tanggal transfer hanya boleh 7 hari terakhir sampai hari ini.
- Upload bukti transfer PNG/JPG maksimal 5MB.
- Data muncul di Kelola Simpanan status `Menunggu`.
- Detail simpanan menampilkan tanggal transfer yang diinput.
- Detail simpanan menampilkan gambar bukti transfer asli.
- Klik `Setujui`, status berubah `Terverifikasi`.
- Klik `Tolak`, status berubah `Ditolak`.
- Klik `Hapus`, row hilang dan summary ikut berubah.
- Transaksi simpanan otomatis/default anggota baru tidak menampilkan menu `Hapus`.
- Cetak bukti transaksi simpanan menghasilkan PDF berisi foto bukti transfer jika ada.

### 2. Tes login aktif dan logout

Sistem tidak memakai tabel `account_session` lagi. Lock login memakai kolom:

- `active_session_id`
- `active_session_seen_at`

File terkait:

- `src/app/login/actions.ts`
- `src/lib/activeLogin.ts`
- `src/components/ActiveLoginHeartbeat.tsx`
- `src/app/api/active-login/heartbeat/route.ts`
- `src/app/api/active-login/release/route.ts`
- `src/app/logout/route.ts`

Tes manual:

- Login akun anggota di tab/browser pertama.
- Coba login akun anggota yang sama di tab/browser kedua, harus ditolak.
- Login akun admin di tab/browser pertama.
- Coba login akun admin yang sama di tab/browser kedua, harus ditolak.
- Login akun super admin di tab/browser pertama.
- Coba login akun super admin yang sama di tab/browser kedua, harus ditolak.
- Klik `Keluar`, lalu coba login akun yang sama lagi, harus berhasil.
- Tutup tab tanpa logout, lalu coba login akun yang sama lagi; release tab harus melepas lock, fallback maksimal sekitar 30 detik.
- Setelah login, diamkan dashboard lebih dari 30 detik dan pastikan akun tidak otomatis keluar karena idle.
- Pastikan heartbeat tetap memperbarui sesi selama halaman dashboard terbuka.

### 3. Tes multi-tab beda akun/role

Cookie browser global antar tab, jadi halaman anggota memakai `anggotaId` di URL.

File terkait:

- `src/components/MemberTabIdentityLinks.tsx`
- `src/lib/memberSession.ts`
- `src/lib/session.ts`
- `src/app/anggota/page.tsx`
- `src/app/anggota/riwayat/page.tsx`
- `src/app/anggota/profil/page.tsx`
- `src/app/simpanan/page.tsx`
- `src/app/pinjaman/page.tsx`
- `src/app/shu/page.tsx`

Tes manual:

- Tab 1 login anggota Arga.
- Tab 2 login admin.
- Tab 1 tetap menampilkan data Arga saat pindah ke Simpanan, Pinjaman, SHU, Riwayat, dan Profil.
- Tab 1 logout dari halaman anggota harus melepas lock anggota, bukan lock admin.
- Tab admin/super admin tetap dapat membuka profil dan melakukan aksi approval walaupun tab lain login anggota.

### 4. Rapikan route protection berdasarkan role

- Route admin hanya boleh diakses admin/super admin.
- Route anggota hanya boleh diakses anggota sesuai identitas tab/URL.
- Detail simpanan, pinjaman, pembayaran, laporan, dan SHU perlu dicek konsistensi proteksinya.

## Prioritas Fitur Berikutnya

### 1. Uji end-to-end pembayaran pinjaman dan status selesai

Yang sudah ada:

- Halaman anggota Bayar Tagihan Pinjaman.
- Halaman admin Pembayaran Anggota.
- Detail pembayaran anggota.
- Submit pembayaran anggota menyimpan data pembayaran.
- Verifikasi pembayaran admin mengubah status pembayaran.
- Tolak pembayaran admin mengubah status pembayaran.
- Pembayaran `MENUNGGU` tidak menaikkan tagihan/angsuran berjalan.
- Pinjaman berubah tampil sebagai `Selesai` jika jumlah pembayaran `TERVERIFIKASI` sudah mencapai tenor.
- Pinjaman `Selesai` tidak dihitung sebagai pinjaman aktif atau batas dua pinjaman aktif.
- Halaman Bayar Tagihan Pinjaman hanya menghitung Total Pinjaman dari pinjaman aktif terkini dan Jatuh Tempo sinkron dengan halaman Pinjaman anggota.

Yang perlu dilengkapi:

- Tes manual menyeluruh untuk beberapa pinjaman aktif dan pinjaman selesai pada anggota yang sama.
- Pertimbangkan apakah database perlu enum status final `SELESAI`; saat ini status selesai dihitung dari pembayaran terverifikasi vs tenor.

### 2. Finalisasi status pinjaman anggota di database

UI memakai status:

- `Menunggu` = pengajuan belum dikonfirmasi.
- `Terutang` = pengajuan disetujui dan belum lunas.
- `Selesai` = pinjaman sudah dibayar lunas.
- `Ditolak` = pengajuan ditolak.

Database saat ini:

- `MENUNGGU`
- `DISETUJUI`
- `DITOLAK`

Perlu rancangan final untuk status lunas/angsuran.

### 3. Review detail akun admin dan super admin

Route yang perlu dipastikan/dibuat:

- `/dashboard/akun/admin/[id]` sudah tersedia untuk super admin melihat detail admin.
- `/dashboard/akun/super-admin/[id]` sudah tersedia untuk super admin melihat detail super admin.

Aturan akses yang disarankan:

- Admin biasa tidak perlu melihat detail admin lain.
- Admin biasa tidak boleh melihat detail super admin.
- Super admin boleh melihat detail admin dan super admin.
- Super admin dapat mengubah nama, email, nomor telepon, dan kata sandi admin/super admin.
- Edit data profil perlu tetap sinkron dengan kredensial login.

### 4. Perluas audit aktivitas admin

Yang sudah ada:

- Tabel raw SQL `admin_activity`.
- Profil admin/super admin menampilkan Aktivitas Terkini.
- Aksi akun anggota, simpanan, pinjaman, dan kirim SHU mulai dicatat.
- Detail akun admin/super admin menampilkan aktivitas akun yang dipilih.
- Kotak aktivitas memiliki scrollbar.

Yang perlu dilengkapi:

- Pastikan aksi verifikasi/tolak pembayaran pinjaman selalu tercatat untuk semua jalur aksi.
- Catat ekspor penting jika diperlukan.
- Tambahkan filter/tanggal jika aktivitas makin banyak.

### 5. Finalisasi distribusi SHU

Rumus saat ini:

- Laba Bersih = total bunga pinjaman seluruh anggota - `Rp 3.000.000`.
- Sisa Hasil Usaha Berjalan = Laba Bersih - total `Distribusi SHU` yang sudah dikirim.
- Dana Cadangan = `max(0, Sisa Hasil Usaha Berjalan) x 40%`.
- Dana Anggota = `max(0, Sisa Hasil Usaha Berjalan) x 60%`.
- Dana Jasa Simpanan = Dana Anggota x `70%`.
- Dana Jasa Pinjaman = Dana Anggota x `30%`.

Aksi `Kirim` sudah menyimpan SHU sebagai Simpanan Sukarela.
Simpanan Sukarela hasil `Distribusi SHU` dikecualikan dari basis pembagian SHU berikutnya agar nilai SHU yang sudah dikirim tidak menggandakan kontribusi simpanan anggota.
Ringkasan Kelola SHU menampilkan `Sisa Hasil Usaha`, yaitu Laba Bersih yang sudah dikurangi total `Distribusi SHU` yang dikirim, lalu menghitung Dana Cadangan dan Dana Anggota dari sisa terbaru. Beranda admin juga menampilkan `Sisa Hasil Usaha` dengan nominal yang sama seperti halaman Kelola SHU.

Yang perlu dipertimbangkan:

- Pengiriman SHU dobel saat ini dicegah per anggota berdasarkan distribusi yang sudah ada; berikutnya perlu basis periode/tahun buku.
- Tambahkan field tahun buku/periode.
- Tambahkan audit trail pengirim SHU.
- Pastikan riwayat SHU anggota hanya menampilkan distribusi SHU, bukan simpanan sukarela biasa.

### 6. Rancang sistem denda jika diperlukan

Project belum memiliki sistem denda khusus. Jika denda dibuat, butuh field/model untuk:

- Jatuh tempo.
- Keterlambatan.
- Nominal denda.
- Status denda.

### 7. Keamanan password

Password masih plaintext untuk development. Untuk produksi, ganti ke hash password.

## Route Anggota

- `/anggota` -> Beranda anggota
- `/anggota/riwayat` -> Riwayat transaksi anggota
- `/anggota/profil` -> Profil anggota
- `/anggota/aktivitas` -> Riwayat Aktivitas Koperasi
- `/simpanan` -> Simpanan anggota
- `/simpanan/tambah` -> Tambah simpanan
- `/pinjaman` -> Pinjaman anggota
- `/pinjaman/baru` -> Pengajuan pinjaman baru
- `/pinjaman/bayar-tagihan` -> Bayar Tagihan Pinjaman
- `/shu` -> SHU anggota
- `/shu/simulasi` -> Simulasi SHU anggota
- `/simulasi-pinjaman` -> Simulasi pinjaman anggota
- `/logout` -> Logout dan clear lock login

## Route Admin dan Super Admin

- `/dashboard` -> Beranda admin
- `/dashboard/profil` -> Profil admin/super admin
- `/dashboard/aktivitas` -> Riwayat Aktivitas Koperasi
- `/dashboard/akun` -> Kelola akun
- `/dashboard/akun/anggota/[id]` -> Detail akun anggota
- `/dashboard/akun/admin/[id]` -> Detail akun admin untuk super admin
- `/dashboard/akun/super-admin/[id]` -> Detail akun super admin untuk super admin
- `/dashboard/simpanan` -> Kelola simpanan
- `/dashboard/simpanan/[id]` -> Detail simpanan
- `/dashboard/pinjaman` -> Kelola pinjaman
- `/dashboard/pinjaman/pembayaran` -> Pembayaran anggota
- `/dashboard/pinjaman/pembayaran/[id]` -> Detail pembayaran anggota
- `/dashboard/laporan` -> Laporan koperasi
- `/dashboard/shu` -> Kelola SHU
- `/logout` -> Logout dan clear lock login

Route tidak dipakai:

- `/dashboard/shu/hitung-pembagian`

## File Penting

Login dan session:

- `src/app/login/actions.ts`
- `src/lib/session.ts`
- `src/lib/memberSession.ts`
- `src/lib/activeLogin.ts`
- `src/components/ActiveLoginHeartbeat.tsx`
- `src/components/MemberTabIdentityLinks.tsx`
- `src/app/api/active-login/heartbeat/route.ts`
- `src/app/api/active-login/release/route.ts`
- `src/app/logout/route.ts`

Akun:

- `src/app/dashboard/akun/page.tsx`
- `src/components/ui/AdminAccountsView.tsx`
- `src/components/AccountActionMenu.tsx`
- `src/components/AccountStatusRefresher.tsx`
- `src/app/dashboard/akun/anggota/[id]/page.tsx`
- `src/app/dashboard/akun/admin/[id]/page.tsx`
- `src/app/dashboard/akun/super-admin/[id]/page.tsx`
- `src/components/ui/AdminMemberDetailView.tsx`
- `src/components/ui/AdminProfileView.tsx`
- `src/components/AccountStatusEditor.tsx`
- `src/app/api/accounts/anggota/[id]/status/route.ts`

Simpanan:

- `src/app/simpanan/page.tsx`
- `src/app/simpanan/tambah/page.tsx`
- `src/app/simpanan/tambah/actions.ts`
- `src/app/dashboard/simpanan/page.tsx`
- `src/app/dashboard/simpanan/[id]/page.tsx`
- `src/app/api/simpanan/[id]/route.ts`
- `src/app/api/simpanan/[id]/status/route.ts`
- `src/components/ui/MemberSavingsView.tsx`
- `src/components/ui/MemberAddSavingsView.tsx`
- `src/components/ui/AdminSavingsView.tsx`
- `src/components/ui/AdminSavingsDetailView.tsx`

Pinjaman:

- `src/app/pinjaman/page.tsx`
- `src/app/pinjaman/baru/page.tsx`
- `src/app/pinjaman/baru/actions.ts`
- `src/app/dashboard/pinjaman/page.tsx`
- `src/app/dashboard/pinjaman/pembayaran/page.tsx`
- `src/app/dashboard/pinjaman/pembayaran/[id]/page.tsx`
- `src/app/pinjaman/bayar-tagihan/page.tsx`
- `src/app/pinjaman/bayar-tagihan/actions.ts`
- `src/components/ui/MemberLoanView.tsx`
- `src/components/ui/MemberNewLoanView.tsx`
- `src/components/ui/MemberLoanPaymentView.tsx`
- `src/components/ui/AdminLoansView.tsx`
- `src/components/ui/AdminLoanPaymentsView.tsx`

SHU:

- `src/app/dashboard/shu/page.tsx`
- `src/app/api/shu/kirim/route.ts`
- `src/app/shu/page.tsx`
- `src/app/shu/simulasi/page.tsx`
- `src/components/ui/AdminShuView.tsx`
- `src/components/ui/MemberShuView.tsx`
- `src/components/ui/MemberShuSimulationView.tsx`

Laporan dan dashboard:

- `src/app/dashboard/page.tsx`
- `src/app/dashboard/profil/page.tsx`
- `src/app/dashboard/aktivitas/page.tsx`
- `src/app/dashboard/laporan/page.tsx`
- `src/lib/adminActivity.ts`
- `src/components/ui/AdminDashboardView.tsx`
- `src/components/ui/AdminReportsView.tsx`
- `src/components/DownloadReportExcelButton.tsx`

Register:

- `src/app/register/actions.ts`
- `src/components/ui/RegisterView.tsx`

## Risiko dan Hutang Teknis

- Password belum di-hash.
- Belum ada migration formal; schema memakai `npx prisma db push`.
- Lock login memakai heartbeat/release dengan fallback sekitar 30 detik jika heartbeat berhenti; auto logout karena idle sudah dihapus.
- Tabel `admin_activity` dibuat via raw SQL helper, belum masuk Prisma schema formal.
- Route protection perlu dicek ulang menyeluruh.
- File upload bukti transfer masih disimpan lokal di `public/uploads`.
- Perlu desain final bila status selesai/lunas ingin disimpan sebagai enum database, bukan dihitung dari pembayaran terverifikasi.
- Perlu desain final bila sistem denda dibuat.

## Checklist Validasi Setelah Coding

- Jalankan `cmd.exe /c "cd /d d:\Users\Lenovo\Documents\koperasi-simpan-pinjam && npx tsc --noEmit"`.
- Jalankan `npx prisma generate` setelah ubah schema.
- Jalankan `npx prisma db push` setelah ubah schema.
- Tes login anggota/admin/super admin.
- Tes akun sama login dua kali harus ditolak.
- Tes logout membuka kembali akses login akun yang sama.
- Tes multi-tab role berbeda.
- Tes tambah simpanan anggota sampai muncul di Kelola Simpanan.
- Tes detail simpanan menampilkan tanggal dan bukti transfer asli.
- Tes setujui/tolak/hapus simpanan.
- Tes search/filter Kelola Akun, Kelola Simpanan, Kelola Pinjaman, dan SHU.
- Tes export Excel Kelola Akun, Laporan, Daftar Penerima SHU, Riwayat SHU, dan Riwayat Simpanan.
- Tes export Excel Pengajuan Terbaru di Kelola Pinjaman.
- Tes aksi SHU `Kirim` hanya aktif jika estimasi lebih dari `Rp 0`.
- Tes aksi SHU `Kirim` tidak bisa dilakukan dua kali untuk anggota yang sama.
- Tes simulasi SHU menghasilkan nilai konsisten dengan rumus SHU aktual.
- Tes pembayaran pinjaman `MENUNGGU` tidak mengubah Tagihan Saat Ini.
- Tes detail akun anggota status `MENUNGGU`/`DITOLAK` tidak menampilkan riwayat transaksi.
- Tes detail akun anggota status `NONAKTIF` tetap menampilkan riwayat transaksi dan bisa diaktifkan kembali.
- Tes tombol Cetak Laporan anggota menghasilkan PDF dengan data anggota, simpanan, pinjaman, transaksi, SHU, dan waktu cetak.
