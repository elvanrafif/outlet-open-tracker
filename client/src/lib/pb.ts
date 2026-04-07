import PocketBase from 'pocketbase';

// Sesuaikan URL jika PocketBase berjalan di port/host berbeda
const pb = new PocketBase(import.meta.env.VITE_PB_URL ?? 'http://127.0.0.1:8090');

export { pb };
