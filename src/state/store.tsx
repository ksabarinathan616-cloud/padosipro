import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  SEED_ADDRESSES, SEED_BOOKINGS, SEED_FAMILY, SEED_NOTICES, STATUS_FLOW, STATUS_LABEL,
  type Address, type Booking, type BookingStatus, type FamilyMember, type Notice,
} from '../data/mock'

// Frontend-only state. Persisted in localStorage purely so the demo survives a refresh.
type UserRole = 'customer' | 'vendor' | 'admin'
type User = { name: string; contact: string; role: UserRole } | null
type Draft = {
  vendorId: string; memberId?: string; addressId?: string; need?: string; description?: string; notes?: string;
  date?: string; time?: string; photo?: string; customerName?: string; customerPhone?: string
}

export const DEMO_ADMIN_EMAIL = 'padosipro@admin.com'
export const inferUserRole = (contact: string): UserRole => {
  const normalized = contact.trim().toLowerCase()
  if (normalized === DEMO_ADMIN_EMAIL) return 'admin'
  if (normalized.includes('@vendor.') || normalized.includes('vendor@') || normalized.includes('vendor')) return 'vendor'
  return 'customer'
}

type Store = {
  user: User; signIn: (u: NonNullable<User>) => void; signOut: () => void; isAdmin: boolean; isAdminOrVendor: boolean
  seenOnboarding: boolean; finishOnboarding: () => void
  family: FamilyMember[]; saveMember: (m: FamilyMember) => void; removeMember: (id: string) => void
  addresses: Address[]; saveAddress: (a: Address) => void; removeAddress: (id: string) => void
  selectedMember: string; setSelectedMember: (id: string) => void
  bookings: Booking[]; addBooking: (b: Omit<Booking, 'id' | 'ref' | 'createdAt' | 'sample' | 'status'>) => Booking
  advance: (id: string) => void; cancel: (id: string) => void
  notices: Notice[]; markRead: (id: string) => void; markAllRead: () => void; clearNotices: () => void
  recent: string[]; addRecent: (q: string) => void; clearRecent: () => void
  compare: string[]; toggleCompare: (id: string) => void; clearCompare: () => void
  draft: Draft | null; setDraft: (d: Draft | null) => void
  toast: string; say: (t: string) => void
  resetDemo: () => void
}

const KEY = 'padosipro-proto-v1'
const Ctx = createContext<Store>(null as unknown as Store)
export const useStore = () => useContext(Ctx)

function load<T>(k: string, fallback: T): T {
  try { const raw = localStorage.getItem(KEY + ':' + k); return raw ? (JSON.parse(raw) as T) : fallback } catch { return fallback }
}
function usePersist<T>(k: string, init: T) {
  const [v, set] = useState<T>(() => load(k, init))
  useEffect(() => { try { localStorage.setItem(KEY + ':' + k, JSON.stringify(v)) } catch { /* storage unavailable */ } }, [k, v])
  return [v, set] as const
}
const upsert = <T extends { id: string }>(list: T[], item: T) => list.some(x => x.id === item.id) ? list.map(x => x.id === item.id ? item : x) : [...list, item]

const sanitizeUser = (u: User): User => {
  if (!u) return null
  const isDemoIdentity = u.name === 'Demo User' || /^demo@example\.com$/i.test(u.contact.trim() || '')
  const contact = u.contact && u.contact.trim() && !isDemoIdentity ? u.contact.trim() : 'Guest account'
  const name = u.name && u.name.trim() && u.name !== 'Demo User' ? u.name.trim() : 'My Profile'
  const role = contact.toLowerCase() === DEMO_ADMIN_EMAIL && u.role === 'admin' ? 'admin' : inferUserRole(contact) === 'vendor' ? 'vendor' : 'customer'
  return { ...u, name, contact, role }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = usePersist<User>('user', null)
  const hydratedUser = useMemo(() => sanitizeUser(user), [user])
  const [seenOnboarding, setSeen] = usePersist('seen', false)
  const [family, setFamily] = usePersist('family', SEED_FAMILY)
  const [addresses, setAddresses] = usePersist('addresses', SEED_ADDRESSES)
  const [selectedMember, setSelectedMember] = usePersist('member', 'm1')
  const [bookings, setBookings] = usePersist('bookings', SEED_BOOKINGS)
  const [notices, setNotices] = usePersist('notices', SEED_NOTICES)
  const [recent, setRecent] = usePersist<string[]>('recent', [])
  const [compare, setCompare] = useState<string[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [toast, setToast] = useState('')

  const say = useCallback((t: string) => { setToast(t); window.setTimeout(() => setToast(''), 2400) }, [])

  const addNotice = (title: string, body: string, bookingId?: string) =>
    setNotices(n => [{ id: 'n' + Date.now(), title, body, at: 'Just now', read: false, bookingId }, ...n])

  const isAdmin = Boolean(hydratedUser && hydratedUser.role === 'admin')
  const isAdminOrVendor = Boolean(hydratedUser && (hydratedUser.role === 'admin' || hydratedUser.role === 'vendor'))

  const value: Store = useMemo(() => ({
    user: hydratedUser ? { ...hydratedUser, role: hydratedUser.role ?? inferUserRole(hydratedUser.contact) } : null,
    signIn: u => setUser(sanitizeUser(u)),
    signOut: () => setUser(null),
    isAdmin,
    isAdminOrVendor,
    seenOnboarding, finishOnboarding: () => setSeen(true),
    family, saveMember: m => setFamily(l => upsert(l, m)),
    removeMember: id => { setFamily(l => l.filter(x => x.id !== id)); if (selectedMember === id) setSelectedMember(family.find(x => x.id !== id)?.id ?? '') },
    addresses, saveAddress: a => setAddresses(l => upsert(l, a)), removeAddress: id => setAddresses(l => l.filter(x => x.id !== id)),
    selectedMember, setSelectedMember,
    bookings,
    addBooking: b => {
      const n = bookings.filter(x => !x.sample).length + 1
      const full: Booking = { ...b, id: 'b' + Date.now(), ref: 'PROTO-' + String(2000 + n), createdAt: new Date().toISOString().slice(0, 10), sample: false, status: 'submitted' }
      setBookings(l => [full, ...l])
      addNotice('Request submitted (simulated)', `${full.vendorName}: ${full.need}. Reference ${full.ref}. Nothing was sent to the provider.`, full.id)
      return full
    },
    advance: id => {
      if (!hydratedUser || hydratedUser.role === 'customer') return
      const b = bookings.find(x => x.id === id); if (!b) return
      const i = STATUS_FLOW.indexOf(b.status); if (i < 0 || i >= STATUS_FLOW.length - 1) return
      const next = STATUS_FLOW[i + 1]
      setBookings(l => l.map(x => x.id === id ? { ...x, status: next } : x))
      addNotice(`${STATUS_LABEL[next]} (simulated)`, `${b.vendorName}: ${b.need}. Prototype status change.`, id)
    },
    cancel: id => {
      if (!hydratedUser || hydratedUser.role === 'customer') return
      const b = bookings.find(x => x.id === id); if (!b) return
      setBookings(l => l.map(x => x.id === id ? { ...x, status: 'cancelled' as BookingStatus } : x))
      addNotice('Request cancelled (simulated)', `${b.vendorName}: ${b.need}.`, id)
    },
    notices, markRead: id => setNotices(l => l.map(n => n.id === id ? { ...n, read: true } : n)),
    markAllRead: () => setNotices(l => l.map(n => ({ ...n, read: true }))), clearNotices: () => setNotices([]),
    recent, addRecent: q => { const t = q.trim(); if (t) setRecent(r => [t, ...r.filter(x => x.toLowerCase() !== t.toLowerCase())].slice(0, 6)) },
    clearRecent: () => setRecent([]),
    compare, toggleCompare: id => setCompare(c => c.includes(id) ? c.filter(x => x !== id) : c.length >= 3 ? c : [...c, id]),
    clearCompare: () => setCompare([]),
    draft, setDraft, toast, say,
    resetDemo: () => {
      setFamily(SEED_FAMILY); setAddresses(SEED_ADDRESSES); setBookings(SEED_BOOKINGS); setNotices(SEED_NOTICES)
      setRecent([]); setSelectedMember('m1')
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [hydratedUser, seenOnboarding, family, addresses, selectedMember, bookings, notices, recent, compare, draft, toast])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
