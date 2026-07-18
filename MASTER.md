# MASTER PRODUCT BLUEPRINT — FLAMESTREAK

## 1. PROJECT BRIEF

**Problem Statement**
Banyak orang ingin membangun kebiasaan harian (belajar, olahraga, journaling, dll) tapi kehilangan motivasi karena tidak ada representasi visual dari konsistensi mereka. Fitur "streak" seperti di TikTok/Duolingo terbukti secara psikologis mendorong retensi harian melalui *loss aversion* (takut kehilangan progres).

**Goals**
- User bisa login cepat via akun Google (tanpa perlu bikin password baru).
- User bisa menandai "check-in" satu kali per hari.
- Streak bertambah otomatis jika check-in dilakukan berturut-turut, dan reset ke 0 jika terlewat satu hari.
- Ada animasi api yang memuaskan secara visual saat streak aktif.
- Riwayat streak terpanjang (longest streak) tersimpan permanen sebagai pencapaian.

**Non-Goals (Out of Scope untuk MVP)**
- Tidak ada fitur social/leaderboard antar user.
- Tidak ada fitur "streak freeze" (pembekuan streak) — bisa jadi fase 2.
- Tidak ada multi-habit tracking (hanya 1 streak global per user).
- Tidak ada notifikasi push di MVP awal.

**Target User**
Individu yang ingin membangun habit pribadi; juga berfungsi sebagai portfolio project yang menunjukkan kemampuan full-stack (auth, state management realtime, animasi, database design yang benar).

**Definisi Sukses**
- User bisa check-in tanpa bug (tidak bisa double check-in, tidak salah reset).
- Streak logic akurat 100% bahkan saat user pindah timezone.
- Tidak ada celah keamanan pada endpoint check-in.

---

## 2. PRODUCT REQUIREMENT DOCUMENT (PRD)

### 2.1 User Stories (Prioritas P0 = wajib MVP)

| ID | User Story | Prioritas |
|---|---|---|
| US-01 | Sebagai user, saya bisa login menggunakan akun Google saya | P0 |
| US-02 | Sebagai user, saya bisa menekan tombol "check-in" satu kali sehari | P0 |
| US-03 | Sebagai user, saya melihat animasi api menyala saat streak aktif | P0 |
| US-04 | Sebagai user, streak saya otomatis reset ke 0 jika saya melewatkan satu hari penuh | P0 |
| US-05 | Sebagai user, saya bisa melihat streak terpanjang (longest streak) yang pernah saya capai | P0 |
| US-06 | Sebagai user, saya tidak bisa menekan tombol check-in dua kali di hari yang sama | P0 |
| US-07 | Sebagai user, saya bisa logout | P0 |
| US-08 | Sebagai user, saya melihat riwayat kalender check-in saya (opsional, P1) | P1 |
| US-09 | Sebagai user, saya mendapat notifikasi visual "milestone" di kelipatan tertentu (7, 30, 100 hari) | P1 |

### 2.2 Functional Requirements — Aturan Bisnis Streak (PALING KRITIS)

Karena berbasis timezone lokal, logikanya harus presisi:

1. Setiap user punya `timezone` (IANA string, contoh: `Asia/Jakarta`) yang diambil otomatis dari browser saat pertama kali login (`Intl.DateTimeFormat().resolvedOptions().timeZone`).
2. "Hari" didefinisikan sebagai tanggal kalender di timezone user tersebut, **bukan** UTC.
3. Saat user menekan check-in:
   - Hitung `today` = tanggal hari ini di timezone user (format `YYYY-MM-DD`).
   - Bandingkan dengan `lastCheckinDate` tersimpan:
     - Jika `today == lastCheckinDate` → tolak (sudah check-in hari ini), tidak ada perubahan.
     - Jika selisih tepat 1 hari → `currentStreak += 1`.
     - Jika selisih > 1 hari (atau belum pernah check-in) → `currentStreak = 1` (mulai baru).
   - `longestStreak = max(longestStreak, currentStreak)`.
4. **Tidak ada cron job global** yang "mematikan" streak di tengah malam. Status streak (aktif/mati) dihitung secara **lazy** setiap kali data diambil (GET), dengan membandingkan `lastCheckinDate` terhadap tanggal hari ini di timezone user saat request masuk. Ini menghindari kompleksitas menjalankan cron per-timezone dan tetap akurat.
5. Jika timezone user berubah (misal traveling), sistem re-sync timezone di setiap request, namun **tidak boleh** mengubah `lastCheckinDate` yang sudah tersimpan secara retroaktif.

### 2.3 Non-Functional Requirements
- **Performance:** Response check-in < 500ms (perceived instant via optimistic UI).
- **Reliability:** Tidak boleh ada race condition yang membuat streak ganda dalam satu hari.
- **Maintainability:** Logic streak harus berupa pure function yang terisolasi dan 100% unit-testable, terpisah dari layer HTTP/DB.
- **Accessibility:** Kontras warna cukup, animasi punya alternatif teks untuk screen reader.

---

## 3. DESIGN BRIEF

### 3.1 Konsep Visual
- **Tema warna:** Gradient oranye-merah-kuning untuk api aktif; abu-abu/biru pudar untuk state "mati".
- **State animasi api:**
  1. **Idle/Belum pernah check-in:** Ikon api abu-abu, statis.
  2. **Aktif (streak 1–6 hari):** Api menyala kecil, animasi flicker halus (loop).
  3. **Aktif kuat (streak 7+ hari):** Api lebih besar, partikel bergerak, mungkin ada efek glow/bloom.
  4. **Milestone (7, 30, 100, dst.):** Micro-animation khusus (burst/confetti singkat) sekali saat dicapai, lalu kembali ke state normal.
  5. **Reset/Mati:** Transisi singkat api meredup ke abu-abu, dengan pesan empatik (bukan menghukum), misal "Streak dimulai lagi — yuk lanjut!".

### 3.2 Rekomendasi Teknis Animasi
- Gunakan **CSS/SVG animation atau Framer Motion** untuk state ringan (idle/aktif) — ringan dan performant.
- Gunakan **Lottie** hanya untuk animasi kompleks seperti milestone burst, karena file JSON Lottie lebih berat — lazy-load hanya saat dibutuhkan.
- Hindari GIF (berat, tidak scalable, tidak bisa di-theming).

### 3.3 Komponen UI Utama
- Tombol check-in besar, jelas, dengan state "sudah check-in hari ini" yang berbeda visual (misal disabled + centang).
- Counter angka streak besar & jelas (contoh: "🔥 12 Hari").
- Badge "Streak Terpanjang: X hari".
- Empty state untuk user baru ("Mulai streak pertamamu hari ini!").
- Loading skeleton saat data streak sedang diambil (hindari layout shift).

### 3.4 Micro-interaction
- Optimistic update: begitu tombol ditekan, UI langsung update (angka naik, api menyala) sebelum response server datang, lalu rollback jika ternyata gagal.
- Haptic-like feedback via animasi scale/bounce singkat pada tombol.

---

## 4. TECH STACK & ARCHITECTURE GUIDELINE

### 4.1 Stack Rekomendasi

| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend Framework | **Next.js 14+ (App Router) + TypeScript** | Full-stack dalam satu repo, SSR/CSR fleksibel, ekosistem besar |
| Styling | **Tailwind CSS** | Cepat, konsisten, mudah maintain |
| Animasi | **Framer Motion** (+ Lottie untuk milestone) | Ringan untuk state umum, powerful untuk animasi kompleks |
| Autentikasi | **Auth.js (NextAuth v5) — Google Provider** | Standar industri untuk OAuth di Next.js, aman secara default |
| Database | **PostgreSQL** (hosting: Neon atau Supabase — free tier cukup untuk personal project) | Relational, mendukung constraint unik & transaksi ACID (krusial untuk anti-duplikasi check-in) |
| ORM | **Prisma** | Type-safe query, migrasi terstruktur, mudah dibaca AI saat vibe coding |
| Validasi | **Zod** | Validasi schema request/response, terintegrasi baik dengan TypeScript |
| State/Data Fetching | **TanStack Query (React Query)** | Caching otomatis, optimistic update, retry logic |
| Hosting | **Vercel** | Serverless auto-scaling, terintegrasi native dengan Next.js |
| Testing | **Vitest + React Testing Library** | Cepat, kompatibel dengan Vite/Next.js modern |

### 4.2 Arsitektur (High-Level)

```
[Browser] 
   │  (Google OAuth login)
   ▼
[Next.js App Router — Client Components]
   │  fetch via React Query
   ▼
[Next.js Route Handlers /api/*]  ← Auth.js session validation di setiap request
   │  Zod validation → Prisma
   ▼
[PostgreSQL Database]
```

Prinsip: **client tidak pernah dipercaya**. Semua perhitungan streak (tanggal "hari ini", validasi timezone, logic increment/reset) dilakukan di server, bukan di client — client hanya mengirim timezone string, server yang menghitung tanggalnya sendiri berdasarkan waktu server yang di-convert ke timezone tersebut. Ini mencegah manipulasi client (misal user mengubah jam device untuk curang).

### 4.3 Struktur Folder yang Disarankan

```
/app
  /api
    /streak
      /route.ts          → GET (ambil status streak)
      /checkin/route.ts  → POST (lakukan check-in)
      /history/route.ts  → GET (riwayat)
    /auth/[...nextauth]/route.ts
  /(dashboard)/page.tsx
/lib
  /streak-logic.ts        → PURE FUNCTION, tanpa dependency DB/HTTP (mudah di-unit-test)
  /prisma.ts
  /auth.ts
  /validations.ts         → Zod schemas
/prisma
  /schema.prisma
/components
  /StreakFlame.tsx
  /CheckinButton.tsx
/tests
  /streak-logic.test.ts
```

### 4.4 Environment Variables (Contoh, JANGAN hardcode di kode)
```
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---

## 5. API CONTRACT / MOCK DATA

### 5.1 Standar Format Response
```json
// Success
{ "status": "success", "data": { } }

// Error
{ "status": "error", "code": "ERROR_CODE", "message": "Deskripsi human-readable" }
```

### 5.2 `GET /api/streak`
Ambil status streak user saat ini (session-based, tanpa userId di URL demi keamanan).

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "currentStreak": 5,
    "longestStreak": 12,
    "lastCheckinDate": "2026-07-16",
    "checkedInToday": false,
    "timezone": "Asia/Jakarta"
  }
}
```

### 5.3 `POST /api/streak/checkin`
**Request Body:**
```json
{ "timezone": "Asia/Jakarta" }
```

**Response 200 (berhasil, streak bertambah):**
```json
{
  "status": "success",
  "data": {
    "currentStreak": 6,
    "longestStreak": 12,
    "lastCheckinDate": "2026-07-17",
    "isNewLongest": false,
    "isMilestone": false
  }
}
```

**Response 409 (sudah check-in hari ini):**
```json
{ "status": "error", "code": "ALREADY_CHECKED_IN", "message": "Kamu sudah check-in hari ini." }
```

**Response 401 (tidak login/session invalid):**
```json
{ "status": "error", "code": "UNAUTHORIZED", "message": "Sesi tidak valid, silakan login ulang." }
```

### 5.4 `GET /api/streak/history?limit=30`
```json
{
  "status": "success",
  "data": {
    "longestStreak": 12,
    "history": [
      { "date": "2026-07-17", "checkedIn": true },
      { "date": "2026-07-16", "checkedIn": true },
      { "date": "2026-07-15", "checkedIn": false }
    ]
  }
}
```

### 5.5 Kode Error Standar
| Code | HTTP Status | Arti |
|---|---|---|
| `UNAUTHORIZED` | 401 | Session tidak valid |
| `ALREADY_CHECKED_IN` | 409 | Duplikasi check-in di hari sama |
| `INVALID_TIMEZONE` | 400 | String timezone tidak valid IANA |
| `RATE_LIMITED` | 429 | Terlalu banyak request dalam waktu singkat |
| `INTERNAL_ERROR` | 500 | Kegagalan server/DB |

---

## 6. EDGE CASES & ERROR HANDLING LIST

| No | Skenario | Penanganan |
|---|---|---|
| 1 | User klik tombol check-in dua kali cepat (double-tap) | Disable tombol segera setelah klik pertama (client) + unique constraint DB (server) sebagai jaring pengaman final |
| 2 | User request check-in dua kali di hari sama dari device berbeda bersamaan | DB unique constraint `(userId, localDate)` menolak insert kedua → response `409` |
| 3 | User pindah timezone (traveling) di tengah streak | Timezone di-update di profil, tapi `lastCheckinDate` yang sudah tersimpan tidak diubah retroaktif; hanya mempengaruhi perhitungan "hari ini" berikutnya |
| 4 | User memanipulasi jam di device untuk curang | Tidak berpengaruh — server menghitung tanggal berdasarkan waktu server (UTC) yang di-convert ke timezone yang dikirim, bukan tanggal dari client |
| 5 | Koneksi terputus saat proses check-in (user tidak tahu berhasil atau tidak) | Optimistic UI di-rollback jika error; saat reconnect, `GET /api/streak` adalah source of truth untuk sinkronisasi ulang |
| 6 | User baru pertama kali login, belum ada data streak | `currentStreak: 0`, `longestStreak: 0`, tampilkan empty state, bukan error |
| 7 | Transisi Daylight Saving Time (DST) | Gunakan library timezone-aware (`date-fns-tz` atau `Intl`), jangan hitung manual dengan `+/- jam tetap` |
| 8 | Tahun kabisat (29 Feb) | Karena pakai native Date/IANA calendar, otomatis tertangani tanpa logic khusus |
| 9 | Google OAuth token expired/revoked user | Auth.js redirect otomatis ke halaman login ulang, session di-invalidate |
| 10 | User hapus akun Google atau cabut izin aplikasi | Sediakan endpoint/flow hapus akun sesuai kebijakan privasi (hapus data user dari DB) |
| 11 | Streak sangat panjang (misal >9999 hari) | Gunakan tipe data `Int` (cukup untuk puluhan ribu tahun), pastikan UI tidak overflow secara visual (truncate/format angka) |
| 12 | Request check-in tanpa timezone yang valid | Validasi dengan Zod + cek terhadap daftar IANA valid, tolak dengan `INVALID_TIMEZONE` jika gagal, fallback ke UTC dengan warning jika perlu |
| 13 | Server down/database unreachable | Tampilkan pesan error ramah + tombol retry, jangan silent fail |

---

## 7. SECURITY CHECKLIST

- [ ] **Autentikasi:** Gunakan Auth.js dengan Google OAuth resmi; jangan pernah simpan password sendiri.
- [ ] **Session:** Gunakan HttpOnly, Secure, SameSite=Lax cookies (default Auth.js sudah aman, jangan diubah manual tanpa alasan kuat).
- [ ] **Otorisasi di server:** Setiap endpoint API **wajib** memvalidasi session di server (`getServerSession`/`auth()`), **jangan pernah** mempercayai `userId` yang dikirim dari client body/query — selalu ambil dari session.
- [ ] **Validasi input:** Semua request body divalidasi dengan Zod sebelum diproses (termasuk validasi format timezone).
- [ ] **Prevent SQL Injection:** Gunakan Prisma (parameterized query by default) — jangan pernah raw query string interpolation.
- [ ] **Rate limiting:** Batasi endpoint `/api/streak/checkin` (misal maks beberapa request per menit per user) untuk cegah abuse/spam.
- [ ] **CSRF Protection:** Auth.js sudah menangani ini secara default untuk flow OAuth-nya.
- [ ] **Environment secrets:** `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `DATABASE_URL` disimpan di environment variables (Vercel dashboard), tidak pernah di-commit ke repo.
- [ ] **HTTPS Only:** Wajib di production (default di Vercel).
- [ ] **Least privilege DB:** Jika memungkinkan, gunakan role DB terbatas (bukan superuser) untuk koneksi aplikasi.
- [ ] **Dependency scanning:** Aktifkan Dependabot/`npm audit` secara berkala.
- [ ] **Logging aman:** Jangan log data sensitif (email lengkap, token) ke console/log publik.
- [ ] **CSP Header:** Set Content-Security-Policy dasar untuk cegah XSS pada Next.js config.
- [ ] **Hak hapus data:** Sediakan mekanisme user menghapus akunnya (relevan untuk kepatuhan privasi dasar).

---

## 8. OPTIMALISASI & EFISIENSI

- **Optimistic UI Update:** Saat tombol check-in ditekan, update state lokal (angka streak, animasi api) secara instan tanpa menunggu response server, lalu sinkronkan/rollback berdasarkan hasil aktual. Ini membuat aplikasi terasa instan walau ada latency jaringan.
- **Single Query per Aksi:** Operasi check-in idealnya 1 transaksi DB (baca state terakhir + tulis state baru) menggunakan `prisma.$transaction`, bukan multiple round-trip terpisah.
- **Indexing:** Buat index pada kolom yang sering di-query: `User.email` (unique, untuk lookup login) dan `Checkin(userId, localDate)` (unique index, sekaligus mencegah duplikasi).
- **Caching di client:** Gunakan React Query dengan `staleTime` yang wajar (misal 1 menit) untuk data streak agar tidak fetch berulang tanpa perlu saat user berpindah tab.
- **Animasi ringan:** Gunakan CSS transform/opacity (GPU-accelerated) untuk animasi api rutin; hindari animasi yang memicu reflow/layout thrashing.
- **Lazy load aset berat:** Lottie JSON untuk milestone hanya di-load saat momen milestone terjadi, bukan di initial page load.
- **Bundle size:** Manfaatkan code-splitting otomatis Next.js; hindari import library besar secara global jika hanya dipakai di satu komponen.

---

## 9. SKALABILITAS

Walau skala saat ini personal, arsitektur berikut membuatnya siap berkembang tanpa perlu rewrite besar:

- **Serverless-first:** Next.js API routes di Vercel auto-scale secara horizontal tanpa konfigurasi tambahan.
- **Connection pooling:** Karena serverless function bisa membuka banyak koneksi DB paralel, gunakan connection pooler (Neon/Supabase sudah menyediakan built-in pooler, atau Prisma Accelerate) agar tidak menghabiskan connection limit Postgres saat traffic naik.
- **Stateless API:** Tidak ada state disimpan di memory server — semua state di DB, sehingga instance server bisa bertambah/berkurang bebas.
- **Struktur DB siap berkembang:** Skema saat ini (1 user = 1 streak global) mudah di-extend ke multi-habit di masa depan tanpa migrasi destruktif (tinggal tambah tabel `Habit` yang relasi ke `User`).
- **Caching layer (opsional masa depan):** Jika nanti ada fitur leaderboard/social, pertimbangkan Redis untuk data yang sering dibaca tapi jarang berubah.
- **Read-heavy optimization:** Endpoint `GET /api/streak` jauh lebih sering dipanggil daripada `POST checkin` — pastikan query-nya sesederhana mungkin (single row lookup by indexed userId).

---

## 10. AUTOMATED TESTING (UNIT TEST)

### 10.1 Prinsip
Logic streak (`/lib/streak-logic.ts`) harus berupa **pure function** — tidak menyentuh database atau HTTP — agar bisa di-unit-test cepat tanpa mocking rumit.

### 10.2 Contoh Pure Function yang Ditest
```typescript
// lib/streak-logic.ts
export function calculateStreak(
  lastCheckinDate: string | null, // format YYYY-MM-DD
  today: string,                  // format YYYY-MM-DD, dihitung di timezone user
  currentStreak: number,
  longestStreak: number
): { streak: number; longest: number; status: 'new' | 'already_checked_in' | 'incremented' | 'reset' } {
  if (!lastCheckinDate) {
    return { streak: 1, longest: Math.max(1, longestStreak), status: 'new' };
  }
  const diffDays = daysBetween(lastCheckinDate, today);

  if (diffDays === 0) {
    return { streak: currentStreak, longest: longestStreak, status: 'already_checked_in' };
  }
  if (diffDays === 1) {
    const newStreak = currentStreak + 1;
    return { streak: newStreak, longest: Math.max(newStreak, longestStreak), status: 'incremented' };
  }
  return { streak: 1, longest: longestStreak, status: 'reset' };
}
```

### 10.3 Daftar Test Case Wajib
```typescript
// tests/streak-logic.test.ts
describe('calculateStreak', () => {
  it('user baru check-in pertama kali → streak = 1', () => { ... });
  it('check-in hari berikutnya berturut-turut → streak bertambah 1', () => { ... });
  it('check-in di hari yang sama dua kali → streak tidak berubah, status already_checked_in', () => { ... });
  it('melewatkan 1 hari penuh → streak reset ke 1', () => { ... });
  it('melewatkan lebih dari 1 hari → streak reset ke 1', () => { ... });
  it('longestStreak ter-update saat currentStreak melebihi rekor sebelumnya', () => { ... });
  it('longestStreak TIDAK berubah saat streak baru masih lebih kecil dari rekor lama', () => { ... });
  it('transisi Daylight Saving Time tidak mempengaruhi perhitungan hari', () => { ... });
  it('transisi 29 Februari (tahun kabisat) dihitung dengan benar', () => { ... });
  it('perbedaan tanggal dihitung berdasarkan kalender lokal, bukan selisih 24 jam mentah', () => { ... });
});
```

### 10.4 Test Layer Tambahan
- **Integration test** untuk API route `/api/streak/checkin` dengan Prisma test database (misal SQLite in-memory atau test schema Postgres terpisah) — memverifikasi unique constraint benar-benar mencegah duplikasi.
- **Target coverage:** Fokus 100% coverage khusus di `streak-logic.ts` (karena ini jantung bisnis logic), coverage menyeluruh lain bersifat opsional untuk project personal.

---

## 11. CONCURRENCY & TRANSACTION RULES

### 11.1 Masalah Utama
Race condition bisa terjadi jika user (atau bug client) mengirim dua request check-in nyaris bersamaan sebelum yang pertama selesai diproses — berisiko menghasilkan increment streak ganda dalam satu hari.

### 11.2 Aturan Wajib

1. **Database sebagai garda terakhir, bukan hanya client-side lock.** Client boleh disable tombol, tapi itu tidak cukup — server harus punya jaminan struktural.

2. **Unique Constraint di level database:**
```prisma
model Checkin {
  id          String   @id @default(cuid())
  userId      String
  localDate   String   // "YYYY-MM-DD" di timezone user saat check-in
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])

  @@unique([userId, localDate])
}
```
   Insert kedua di hari yang sama otomatis gagal di level DB (`P2002` unique constraint violation di Prisma) — ini mencegah duplikasi bahkan dalam kondisi race yang paling ekstrem, tanpa perlu locking manual yang rumit.

3. **Transaksi atomik untuk update `User`:**
```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  const result = calculateStreak(user.lastCheckinDate, today, user.currentStreak, user.longestStreak);

  if (result.status === 'already_checked_in') {
    throw new AlreadyCheckedInError();
  }

  await tx.checkin.create({ data: { userId, localDate: today } }); // akan throw jika duplikat
  await tx.user.update({
    where: { id: userId },
    data: { currentStreak: result.streak, longestStreak: result.longest, lastCheckinDate: today },
  });
});
```
   Menggabungkan pembacaan state + penulisan `Checkin` + update `User` dalam satu transaksi memastikan konsistensi — jika salah satu langkah gagal, semuanya di-rollback.

4. **Idempotency di sisi client:** Setelah request check-in dikirim, tombol langsung di-disable sampai response diterima, mencegah user membuat request duplikat secara sengaja/tidak sengaja.

5. **Isolation level default Postgres (Read Committed) sudah cukup** untuk kasus ini karena unique constraint adalah mekanisme pencegahan utama, bukan mengandalkan isolation level tinggi yang bisa mengurangi performa.
