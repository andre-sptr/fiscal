# 💰 Fiscal - AI-Powered Personal Finance Tracker

Fiscal adalah aplikasi web modern cerdas yang dirancang untuk membantu Anda melacak, mengelola, dan merencanakan keuangan pribadi Anda dengan mudah. Dilengkapi dengan asisten AI terintegrasi, mencatat transaksi kini semudah melakukan *chatting*.

## ✨ Fitur Utama

- **🤖 AI Financial Assistant**: Catat transaksi atau tanyakan kondisi keuangan Anda langsung melalui antarmuka obrolan pintar (didukung oleh Sumopod AI).
- **📊 Dashboard Interaktif**: Pantau saldo, target anggaran, dan peringatan pengeluaran (*spending alerts*) dalam satu tampilan yang bersih.
- **💸 Manajemen Transaksi**: Tambahkan, edit, dan kategorikan pemasukan serta pengeluaran Anda.
- **🔄 Transaksi Berulang**: Atur dan kelola tagihan atau langganan bulanan secara otomatis.
- **🎯 Target Anggaran (Budget Goals)**: Buat dan pantau target pengeluaran bulanan Anda agar keuangan tetap sehat.
- **🔐 Autentikasi Aman**: Login dan sinkronisasi data dengan aman menggunakan layanan autentikasi dari Supabase.

## 💻 Teknologi yang Digunakan

**Frontend:**
- [React.js](https://react.dev/) dengan [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) untuk komponen antarmuka yang elegan

**Backend, Database, & AI:**
- [Supabase](https://supabase.com/) (PostgreSQL, Auth, & Edge Functions)
- Integrasi Deno Edge Functions untuk memproses tagihan berulang dan parsing transaksi
- Custom AI Service (Sumopod AI)

## 🚀 Cara Menjalankan Project Secara Lokal

Ikuti langkah-langkah berikut untuk menjalankan aplikasi ini di komputer Anda:

### Prasyarat
- Node.js terinstal di komputer Anda.
- Akun Supabase (untuk Database dan Auth).
- Bun atau npm sebagai package manager (project ini sepertinya menggunakan `bun` terlihat dari `bun.lockb`).

### 1. Clone Repository
```bash
git clone https://github.com/andre-sptr/fiscal.git