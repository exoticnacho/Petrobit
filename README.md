# 👾 Petrobit: Cosmic Pixel Pet (Soroban Stellar Blockchain Game)

[![Petrobit Logo Placeholder](https://img.shields.io/badge/Petrobit-Cosmic%20Pixel%20Pet-blueviolet?style=for-the-badge&logo=react&logoColor=cyan)](https://www.stellar.org/soroban)

## 🌌 Deskripsi Proyek

**Petrobit** adalah game peliharaan digital yang sepenuhnya *on-chain* dan *hybrid*, dibangun di atas platform *smart contract* **Soroban (Stellar)**. Petrobit membawa konsep klasik Tamagotchi ke Web3 dengan menggabungkan *state* pet yang diatur oleh kontrak Rust (XP, Level, Species ID) dengan *gameplay frontend* yang kaya, interaktif, dan berisiko/berhadiah.

Aplikasi ini menggunakan tema visual **"Cosmic Pixel Pet"** baru dengan palet warna angkasa gelap, Neon Green, Bright Cyan, dan aksen Crypto Gold yang dramatis.

---

## 🚀 Fitur Utama

### I. Fitur Inti Blockchain (Smart Contract Soroban)

Semua fitur ini dikelola oleh kontrak Rust dan memerlukan interaksi *on-chain* melalui Stellar SDK.

* **Sistem Leveling dan XP:** Pet mendapatkan *Experience Points* (XP) dari setiap aksi dan naik Level (`L1 → L10`). Level membuka hadiah NFT dan fitur baru.
* **Variasi Pet (Species ID):** Setiap Pet dibuat dengan ID spesies unik (`species_id: u8`) secara *pseudo-random* yang memengaruhi visual pet.
* **Aksi Baru `exercise()`:** Fungsi tambahan untuk mengelola stat `energy` sambil memberikan *happy* dan XP.
* **Aksesori NFT:** Pet dapat membuka dan "mengenakan" aset unik yang status kepemilikannya dilacak oleh *bitmask* di kontrak.
* **Manajemen Koin Fleksibel:** Kontrak menyertakan fungsi `update_coins` untuk mencatat koin Mint (Profit) atau Burn (Loss) yang dihitung di *frontend*.

### II. Fitur Gameplay Hybrid & Frontend

Fitur-fitur ini sepenuhnya dikelola oleh *logic* React/TypeScript, menggunakan data dari kontrak untuk menentukan efek:

| Fitur | Kategori | Deskripsi |
| :--- | :--- | :--- |
| **Sistem Investasi Pet** | **Hybrid** | Pemain dapat mengunci koin untuk periode waktu tertentu. *Frontend* menghitung hasil acak (Profit/Loss/Break Even), dan hasil bersih dicatat ke kontrak Soroban. |
| **Quick-Time Event (QTE)** | **Gameplay Unik** | Aksi `play()` didahului oleh mini-game QTE. Transaksi *on-chain* hanya dikirim jika pemain berhasil. |
| **Sistem Pet Mood Harian** | **Gameplay Unik** | Pet memiliki Mood acak (Energetic/Grumpy/Neutral) yang memberikan *boost* atau *penalty* pada efisiensi aksi. |
| **Visualisasi Status** | **Estetika/UX** | UI menggunakan palet **Cosmic Pixel** (Neon Green, Bright Cyan, Crypto Gold) dengan efek *glow* dan *pixel shadow*. |

---

## 🛠️ Tech Stack & Solusi Bug Kritis

* **Blockchain:** Soroban (Stellar)
* **Frontend:** React, TypeScript, Tailwind CSS
* **Solusi Bundling (Vite):** Konfigurasi `optimizeDeps.exclude` yang kritis di `vite.config.ts` untuk memperbaiki *bug* *interoperability* Stellar SDK.
* **Solusi Transaksi (Stuck Loading):** Perbaikan *promise chain* di `use-stellar.ts` dan `use-submit-transaction.ts` yang memastikan *loading state* dimatikan meskipun transaksi gagal, mencegah *hang* yang disebabkan oleh *timeout* RPC.

---

## ⚙️ Setup dan Instalasi

### Prasyarat

* Rust (dengan target `wasm32-unknown-unknown`)
* Soroban CLI
* Node.js (v18+) & npm/yarn

### 1. Kloning Repositori & Deploy Kontrak

Pastikan Anda telah *deploy* kontrak Soroban yang menyertakan fungsi `update_coins` dan *bindings* TypeScript Anda telah diperbarui.

### 2. Instalasi Frontend & Running

```bash
# Pindah ke direktori frontend (misalnya, tamagochi)
npm install

# Hapus cache lama untuk memastikan fix Vite dimuat dengan benar
rm -rf node_modules/.vite

# Jalankan server pengembangan
npm run dev
