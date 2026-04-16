# Serumo — Sewa Ruangan Moklet

Sistem penyewaan ruangan SMK Telkom Malang dengan virtual tour, booking real-time, dan dashboard admin.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + Radix UI
- **Backend**: Supabase (Auth + PostgreSQL + Storage)

## Setup

### 1. Supabase Project

1. Buat project baru di [supabase.com](https://supabase.com)
2. Jalankan SQL di `supabase/schema.sql` melalui **SQL Editor**
3. Buat Storage bucket bernama `payment-proofs` (set ke **Public**)

### 2. Environment Variables

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Ambil dari: Supabase Dashboard → Settings → API

### 3. Buat Admin User

1. Daftar akun biasa via `/auth/register`
2. Di Supabase SQL Editor, jalankan:

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'admin@email.com';
```

### 4. Jalankan Dev Server

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Struktur Halaman

| Route | Deskripsi |
|-------|-----------|
| `/` | Homepage |
| `/rooms` | Katalog ruangan |
| `/rooms/[id]` | Detail ruangan + virtual tour |
| `/booking/[roomId]` | Form booking |
| `/booking/success/[id]` | Invoice + upload bukti bayar |
| `/dashboard` | Dashboard user |
| `/admin` | Dashboard admin |
| `/admin/bookings` | Kelola booking + verifikasi |
| `/admin/rooms` | Kelola ruangan |
| `/admin/facilities` | Kelola fasilitas tambahan |
| `/auth/login` | Login |
| `/auth/register` | Registrasi |

## Fitur

- ✅ Katalog ruangan dengan foto & info lengkap
- ✅ Virtual tour embed (iframe)
- ✅ Booking dengan validasi double booking
- ✅ Pilih fasilitas tambahan + kalkulasi harga otomatis
- ✅ Upload bukti pembayaran (JPG/PNG/PDF, max 2MB)
- ✅ Status booking: pending → verified/rejected
- ✅ Dashboard user (riwayat booking)
- ✅ Dashboard admin (approve/reject, export Excel)
- ✅ Role-based access (admin/user)
- ✅ Responsive mobile-friendly
