@PRD.md

# Outlet Opening Tracker — Frontend

## Stack
- React 19 (with React Compiler via babel-plugin-react-compiler)
- Vite 8, TypeScript 5.9
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- PocketBase JS SDK v0.26.8 (installed)
- Zustand v5.0.12 — state management global
- shadcn/ui (preset Nova — Lucide icons + Geist font) — component library
- Path alias `@/` → `src/`
- Backend: PocketBase server — folder `../server/` (satu level di atas client)
- Deployment: VPS + Coolify

## Struktur Folder
```
src/
├── components/
│   └── ui/          # Komponen reusable (Button, Input, Card, Badge, dll)
├── pages/           # Halaman utama (Dashboard, ProjectDetail, Login, dll)
├── hooks/           # Custom hooks untuk data fetching PocketBase
├── stores/          # Zustand stores (useAuthStore, useNotifStore)
├── lib/             # Utilities — wajib ada cn() untuk conditional Tailwind
├── types/           # TypeScript interfaces & types
└── index.css        # Global styles + Tailwind import
```

## Konvensi Kode
- Komponen pakai **named export**, bukan default export
- Gunakan komponen shadcn/ui sebelum buat komponen UI dari nol
- Import komponen shadcn dari `@/components/ui/`
- Semua props pakai TypeScript interface eksplisit
- Gunakan `cn()` dari `src/lib/utils.ts` untuk conditional Tailwind class
- Gunakan Tailwind utility class — hindari CSS custom kecuali di `src/index.css`
- Semua komponen harus support **dark mode**
- Custom hooks ditulis di `src/hooks/` untuk logic yang reusable

## TypeScript Patterns
```tsx
// Props dengan children
interface CardProps {
  className?: string
  children: React.ReactNode
}

// Generic component
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}
function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>
}
```

## Conditional Classes
```tsx
import { cn } from '@/lib/utils'

<button className={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  disabled && 'opacity-50 cursor-not-allowed'
)} />
```

## Accessibility
- Gunakan semantic HTML (`<button>`, `<nav>`, `<main>`, `<section>`)
- Semua elemen interaktif harus focusable via keyboard
- Tambah `aria-label` untuk icon-only buttons
- Gunakan `focus-visible:ring-2` untuk focus indicator

## Prinsip Desain Komponen (SOLID)

**S — Single Responsibility**
Satu komponen, satu tujuan. Kalau komponen sudah handle fetch data + validasi + render sekaligus, pecah jadi:
- Container (orkestrasi)
- Presentational (render saja)
- Custom hook (logic/data fetching)

**O — Open/Closed**
Komponen diperluas lewat props & composition, bukan dimodifikasi. Contoh: `<Badge status="open" />` bukan `if (open) ... else if (closed)` di dalam komponen.

**L — Liskov Substitution**
Variasi komponen harus punya interface yang kompatibel. Misal semua input (text, date, select) pakai props yang sama: `value`, `onChange`, `disabled`, `error`.

**I — Interface Segregation**
Jangan buat komponen dengan 15+ props wajib. Pecah jadi composable pieces. Fitur seperti sorting/filtering taruh di custom hook terpisah.

**D — Dependency Inversion**
Komponen tidak boleh import API/PocketBase langsung — selalu lewat custom hook:
```tsx
// Salah
import pb from '@/lib/pb'
const data = await pb.collection('projects').getList()

// Benar
const { projects } = useProjects()
```

> **Catatan**: Jangan over-engineer. Terapkan SOLID hanya kalau kompleksitas memang butuh struktur itu. "Rule of three": abstraksi setelah ketemu pola serupa 3x, bukan sebelumnya.

## State Management (Zustand)

- **Global state** (auth session, notifikasi) → Zustand store di `src/stores/`
- **Server/async state** (data dari PocketBase) → custom hook di `src/hooks/`
- **Local UI state** (modal open, form input) → `useState` biasa di komponen

Contoh store:
```tsx
// src/stores/useAuthStore.ts
import { create } from 'zustand'

interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

**Aturan wajib (sesuai DIP):**
- Store hanya boleh pegang **state + setter** — tidak ada logic async, tidak ada akses PocketBase langsung
- Semua logic async (fetch, auth, mutation) tetap di custom hook di `src/hooks/`
- Hook yang memanggil store, bukan sebaliknya

```tsx
// Salah ❌ — store tahu tentang PocketBase
login: async () => { await pb.collection('users').authWithPassword(...) }

// Benar ✅ — hook yang handle logic, store hanya simpan hasil
const useAuth = () => {
  const setUser = useAuthStore((s) => s.setUser)
  const login = async (email: string, password: string) => {
    const result = await pb.collection('users').authWithPassword(email, password)
    setUser(result.record)
  }
  return { login }
}
```

## Aturan Penting
- Jangan tambah dependency baru tanpa diskusi dulu
- Selalu ikuti role & akses sesuai PRD (Superadmin vs User Divisi)
- Status warna: hijau = On Track, kuning = At Risk (<7 hari), merah = Overdue
