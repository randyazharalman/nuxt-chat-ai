# Chatbot App Nuxt

## Deskripsi Proyek
Proyek ini adalah aplikasi chatbot yang dibangun dengan Nuxt.js, dirancang untuk berinteraksi dengan pengguna dan menyediakan berbagai alat berbasis AI, seperti informasi cuaca dan pengubahan tema. Aplikasi ini mendukung otentikasi pengguna dan persistensi data melalui database.

## Tumpukan Teknologi
*   **Framework Frontend**: Nuxt.js (Vue 3)
*   **Styling**: Tailwind CSS
*   **Database ORM**: Prisma
*   **Database**: PostgreSQL
*   **Otentikasi**: Logto, Nuxt Auth Utils
*   **Backend as a Service (BaaS)**: Supabase (untuk database dan mungkin otentikasi/storage)
*   **AI Integration**: AI SDK (untuk integrasi model AI dan alat)
*   **Icons**: Lucide Vue Next

## Cara Menjalankan Proyek Secara Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di lingkungan pengembangan lokal Anda.

### 1. Instal Dependensi

Navigasi ke direktori proyek `chatbot-app-nuxt` dan instal semua dependensi yang diperlukan menggunakan npm:

```bash
cd chatbot-app-nuxt
npm install
```

### 2. Konfigurasi Variabel Lingkungan

Buat file `.env` di root direktori `chatbot-app-nuxt` dan isi dengan variabel lingkungan yang diperlukan. Anda dapat menggunakan `env.example` sebagai referensi:

```bash
cp .env.example .env
```

Kemudian, edit file `.env` dan ganti placeholder dengan nilai yang sesuai:

```
# Supabase Configuration
SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

# Logto Configuration
LOGTO_ENDPOINT="YOUR_LOGTO_ENDPOINT"
LOGTO_APP_ID="YOUR_LOGTO_APP_ID"
LOGTO_APP_SECRET="YOUR_LOGTO_APP_SECRET"
LOGTO_COOKIE_ENCRYPTION_KEY="YOUR_LOGTO_COOKIE_ENCRYPTION_KEY"

# Database Configuration (Prisma with PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"
```

Pastikan Anda memiliki instance PostgreSQL yang berjalan dan kredensial yang benar untuk `DATABASE_URL`. Untuk Supabase dan Logto, Anda perlu membuat akun dan mengkonfigurasi proyek Anda untuk mendapatkan URL dan kunci yang diperlukan.

### 3. Jalankan Migrasi Database

Setelah mengkonfigurasi `DATABASE_URL` di file `.env`, jalankan migrasi Prisma untuk membuat skema database Anda:

```bash
npx prisma migrate dev --name init
```
Ganti `init` dengan nama migrasi yang sesuai jika Anda memiliki migrasi yang sudah ada.

### 4. Jalankan Aplikasi

Setelah semua dependensi terinstal dan database dimigrasi, Anda dapat menjalankan aplikasi dalam mode pengembangan:

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000` (atau port lain yang dikonfigurasi).
