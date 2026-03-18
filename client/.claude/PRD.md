# PRD — Outlet Opening Tracker
**Versi 1.0 | Draft | Maret 2026**

---

## 1. Latar Belakang

Sistem digital untuk menggantikan kertas manual "Pengajuan Deadline Opening Lokasi Baru & Renovasi". Proses pembukaan outlet sering molor karena:
- Tracking progress masih manual, tidak real-time
- Tidak ada visibilitas antar divisi
- Tidak ada alert otomatis untuk task yang telat atau mendekati deadline

---

## 2. Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS v4 |
| Backend + DB + Auth | PocketBase |
| Deployment | VPS + Coolify |

---

## 3. Role & Akses

| Role | Akses |
|---|---|
| **Superadmin** | Full access — manage user & project, isi checklist (toggle on/off), export PDF/Excel, reset password user, buka kembali project terkunci |
| **User Divisi** | Lihat semua project (read-only), edit hanya task divisi sendiri, ganti password sendiri |

- Bisa ada beberapa akun Superadmin
- Aplikasi dapat diakses dari mana saja (public deployment)

---

## 4. Fitur Full Scope

### 🔐 Auth
- Login & Logout
- Ganti password sendiri (semua user)
- Reset password by Superadmin — default password: `123456`
- Tidak memerlukan SMTP / email

### 👥 User Management (Superadmin only)
- Tambah, edit, delete / nonaktifkan user
- Assign user ke divisi
- Reset password user

### 🏠 Dashboard
- Tabel list semua project yang sedang berjalan
- Kolom: nama outlet, lokasi, target opening, progress bar, status
- Status indikator:
  - 🟢 **On Track**
  - 🟡 **At Risk** — deadline < 7 hari
  - 🔴 **Overdue**

### 📋 Project
- Buat project baru (Superadmin)
- Info: nama outlet, alamat, tipe (Mall / Stand Alone), brand, tanggal opening
- Edit info project (Superadmin)
- Tandai project "Selesai" → seluruh project terkunci
- Buka kembali project terkunci (Superadmin only)
- Arsip project selesai
- Skala: maks ~10 project berjalan bersamaan

### ✅ Task / Checklist
- 33 task default sebagai template, sama untuk semua project
- Superadmin dapat tambah / edit / delete task per project
- Kolom per task: Start Date, Deadline, PIC, Checkbox Progress, Detail (free text), Log otomatis (siapa & kapan)
- Semua divisi tampil collapsible di 1 halaman detail project
- User hanya bisa edit task divisi sendiri — divisi lain read-only
- Superadmin dapat isi checklist (fitur dapat di-toggle on/off)

### 🔔 Notifikasi In-App
- Ikon lonceng di navbar
- Muncul hanya saat aplikasi dibuka (tidak ada push notification / email)
- Tampil sebagai list simple task yang perlu perhatian
- Kriteria: (1) Deadline < 7 hari & belum selesai, (2) Task overdue
- Notif hanya menampilkan task relevan sesuai divisi user yang login

### 📤 Export
- Tombol export di halaman detail project
- Superadmin only
- Format: PDF & Excel (tampilan mirip kertas asli tapi lebih rapi)
- Scope: per project

### ⚙️ Infrastruktur
- VPS + Coolify
- PocketBase (backend + DB + auth + realtime)
- Domain & SSL
- Public deployment

---

## 5. Divisi & 33 Task Default

| Divisi | Task | Jumlah |
|---|---|---|
| Business Development | Fasilitasi & CAD, LOI, PSM | 3 |
| Legal | LOI, PSM | 2 |
| Perizinan | NIB / Izin Usaha, PBG, INRIT / ANDALALIN, Listrik Kerja, Listrik Toko | 5 |
| Project | CAD Approval, Survey, Layout Approval, 3D Design, Gambar Kerja, Tender Vendor, Handover Unit, Fit Out, Opening Preparation | 9 |
| ME | Installation Electrical | 1 |
| Reklame | Pemasangan Polesign / Wallsign | 1 |
| Purchasing | PO, Pengiriman Barang | 2 |
| HRD | Recruitment | 1 |
| Finance | Payment Invoice, Pengadaan EDC | 2 |
| IT | WiFi Installation, Telp Installation, POS Setup, CCTV Installation, Speaker Installation | 5 |
| Marcomm | Google Maps Registration, E-Commerce Setup | 2 |
| **TOTAL** | | **33** |

---

## 6. Skala Sistem
- Maksimal ~10 project berjalan bersamaan
- Total estimasi ~100 user

---

## 7. Open Questions (Perlu Konfirmasi)

| No | Pertanyaan | Kenapa Penting |
|---|---|---|
| 1 | Apakah 1 user bisa pegang lebih dari 1 divisi? | Ngaruh ke struktur database & tampilan user management |
| 2 | PIC diisi free text atau pilih dari daftar user? | Ngaruh ke desain form & relasi database |
