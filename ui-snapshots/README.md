# UI Snapshots KSP Tarunajaya

Folder ini berisi arsip tampilan UI yang sudah dibuat, disimpan agar bisa dibuka, dibandingkan, atau dipindahkan tanpa mengganggu kode aplikasi utama.

## Cara Pakai

- File gambar snapshot berada di `images/`.
- Semua gambar disimpan sebagai `.png`.
- File snapshot berada di `components-ui/`.
- Semua file komponen disimpan sebagai `.tsx.txt`, bukan `.tsx`, supaya tidak ikut dibaca TypeScript/Next.js sebagai kode aktif.
- Jika ingin melihat sumber tampilan, buka file `.tsx.txt` yang sesuai.
- Jika ingin mengembalikan atau membandingkan UI, salin bagian yang dibutuhkan secara manual ke file aktif di `src/components/ui/`.

## Route Anggota

- `/anggota` -> `MemberDashboardView.tsx.txt`
- Gambar: `images/member-dashboard.png`
- Beranda anggota terbaru tidak lagi memakai kotak Statistik Dana; tombol `Riwayat` berada di kanan bawah kartu Total Saldo Aktif.
- `/anggota/riwayat` -> `MemberTransactionHistoryView.tsx.txt`
- Gambar: `images/member-transaction-history.png`
- `/anggota/aktivitas` -> riwayat aktivitas koperasi anggota/admin sesuai komponen aktif bila sudah disnapshot.
- `/anggota/profil` -> `MemberProfileView.tsx.txt`
- Gambar: `images/member-profile.png`
- `/simpanan` -> `MemberSavingsView.tsx.txt`
- Gambar: `images/member-savings.png`
- `/simpanan/tambah` -> `MemberAddSavingsView.tsx.txt`
- Gambar: `images/member-add-savings.png`
- Simpanan Wajib terbaru harus tepat `Rp 300.000` dan terkunci jika bulan berjalan sudah terverifikasi.
- `/pinjaman` -> `MemberLoanView.tsx.txt`
- Gambar: `images/member-loan.png`
- Halaman pinjaman terbaru tidak lagi memakai kotak Distribusi Pinjaman; Aktivitas Terkini berada di posisi kanan.
- `/pinjaman/baru` -> `MemberNewLoanView.tsx.txt`
- Gambar: `images/member-new-loan.png`
- `/shu` -> `MemberShuView.tsx.txt`
- Gambar: `images/member-shu.png`
- `/shu/simulasi` -> `MemberShuSimulationView.tsx.txt`
- Gambar: `images/member-shu-simulation.png`
- `/simulasi-pinjaman` -> `MemberLoanSimulationView.tsx.txt`
- Gambar: `images/member-loan-simulation.png`

## Route Admin

- `/dashboard` -> `AdminDashboardView.tsx.txt`
- Gambar: `images/admin-dashboard.png`
- `/dashboard/akun` -> `AdminAccountsView.tsx.txt`
- Gambar: `images/admin-accounts.png`
- `/dashboard/akun/anggota/[id]` -> `AdminMemberDetailView.tsx.txt`
- Gambar: `images/admin-member-detail.png`
- `/dashboard/akun/admin/[id]` -> `AdminProfileView.tsx.txt` mode detail bila sudah disnapshot.
- `/dashboard/profil` -> `AdminProfileView.tsx.txt`
- Profil admin/super admin terbaru memiliki kotak `Aktivitas Terkini`.
- `/dashboard/simpanan` -> `AdminSavingsView.tsx.txt`
- Gambar: `images/admin-savings.png`
- `/dashboard/simpanan/[id]` -> `AdminSavingsDetailView.tsx.txt`
- Gambar: `images/admin-savings-detail.png`
- `/dashboard/pinjaman` -> `AdminLoansView.tsx.txt`
- Gambar: `images/admin-loans.png`
- `/dashboard/pinjaman/pembayaran` -> `AdminLoanPaymentsView.tsx.txt`
- `/dashboard/pinjaman/pembayaran/[id]` -> detail pembayaran anggota.
- `/dashboard/laporan` -> `AdminReportsView.tsx.txt`
- Gambar: `images/admin-reports.png`
- `/dashboard/shu` -> `AdminShuView.tsx.txt`
- Gambar: `images/admin-shu.png`
- `/dashboard/shu/hitung-pembagian` sudah tidak dipakai.

## Route Umum

- `/login` -> `LoginView.tsx.txt`
- Gambar: `images/login.png`
- `/register` -> `RegisterView.tsx.txt`
- Gambar: `images/register.png`

## Catatan

- Folder ini hanya arsip, bukan bagian dari aplikasi.
- Mengubah file di folder ini tidak akan mengubah UI aplikasi yang berjalan.
- Untuk memperbarui arsip, salin ulang file dari `src/components/ui/`.
- Catatan konteks terakhir: 26 Juni 2026.
