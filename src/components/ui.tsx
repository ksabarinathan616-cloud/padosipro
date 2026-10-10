import { useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Bell, Building2, Check, ChefHat, CircleAlert, Flower2, GraduationCap, Heart, HeartHandshake,
  Home, Info, Package, Paintbrush, Pill, Plane, Scale, ShieldCheck, ShoppingBasket, SprayCan, Stethoscope,
  Truck, User, Utensils, Wrench, ClipboardList, LayoutGrid, Mail, type LucideIcon,
} from 'lucide-react'
import { useStore } from '../state/store'

const ICONS: Record<string, LucideIcon> = {
  'heart-handshake': HeartHandshake, stethoscope: Stethoscope, pill: Pill, wrench: Wrench, 'chef-hat': ChefHat,
  'spray-can': SprayCan, paintbrush: Paintbrush, 'building-2': Building2, 'shopping-basket': ShoppingBasket,
  utensils: Utensils, truck: Truck, package: Package, 'flower-2': Flower2, plane: Plane, 'shield-check': ShieldCheck,
  'graduation-cap': GraduationCap, scale: Scale, heart: Heart,
}
export function CatIcon({ name, size = 22 }: { name: string; size?: number }) {
  const I = ICONS[name] ?? Heart
  return <I size={size} aria-hidden />
}

/** Approximation of the Padosi Pro mark (roof/chevron with diamond cut-out) drawn in SVG.
 *  Replace with the official logo files from the designer when available. */
export function LogoMark({ size = 32, color = '#5db18c', cut = '#0e4e44' }: { size?: number; color?: string; cut?: string }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <path d="M32 8 53 29c3 3 3 7 0 10l-3 3c-3 3-7 3-10 0l-8-8-8 8c-3 3-7 3-10 0l-3-3c-3-3-3-7 0-10z" fill={color} />
      <path d="M32 25l8 8-8 8-8-8z" fill={cut} />
    </svg>
  )
}
export function Logo({ size = 32, color = '#5db18c', cut = '#0e4e44', text = '#fff' }: { size?: number; color?: string; cut?: string; text?: string }) {
  return (
    <span className="row brand-lockup" style={{ gap: size * 0.2 }} role="img" aria-label="padosipro">
      <LogoMark size={size} color={color} cut={cut} />
      <span className="brand-word" style={{ fontWeight: 600, fontSize: size * 0.9, color: text, letterSpacing: '-0.02em', lineHeight: 1 }}>padosipro</span>
    </span>
  )
}

export function ProtoBanner({ children }: { children?: ReactNode }) {
  return (
    <div className="proto" role="note">
      <Info size={18} aria-hidden />
      <div>{children ?? 'Prototype: nothing here is sent to a provider and no money moves.'}</div>
    </div>
  )
}

export function TopBar({ title, back = true, right }: { title?: string; back?: boolean | string; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <header className="topbar">
      {back && (
        <button className="iconbtn" aria-label="Go back" onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}>
          <ArrowLeft size={22} />
        </button>
      )}
      <h2>{title}</h2>
      {right}
    </header>
  )
}

export function Screen({ children, nav = false }: { children: ReactNode; nav?: boolean }) {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return <div className="screen"><div className={'body' + (nav ? ' nav' : '')} style={{ paddingTop: 8 }}>{children}</div></div>
}

export function BottomNav() {
  const nav = useNavigate(); const { pathname } = useLocation(); const { notices } = useStore()
  const unread = notices.some(n => !n.read)
  const tabs: [string, string, LucideIcon][] = [
    ['/home', 'Home', Home], ['/services', 'Services', LayoutGrid], ['/bookings', 'Requests', ClipboardList],
    ['/notifications', 'Alerts', Bell], ['/support/contact', 'Contact', Mail], ['/profile', 'Profile', User],
  ]
  return (
    <nav className="bottomnav" aria-label="Main">
      {tabs.map(([to, label, I]) => (
        <button key={to} className={pathname.startsWith(to) ? 'on' : ''} onClick={() => nav(to)} aria-current={pathname.startsWith(to) ? 'page' : undefined}>
          <I size={22} aria-hidden />{label}
          {to === '/notifications' && unread && <span className="dot" aria-label="Unread alerts" />}
        </button>
      ))}
    </nav>
  )
}

export function Field({ label, error, hint, children, id }: { label: string; error?: string; hint?: string; children: ReactNode; id: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="errtxt" role="alert"><CircleAlert size={16} aria-hidden />{error}</span>}
    </div>
  )
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [onClose])
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <div className="grab" />
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function Empty({ icon, title, text, action }: { icon?: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="icobox">{icon ?? <Info />}</div>
      <h3>{title}</h3>
      <p className="muted" style={{ maxWidth: 280 }}>{text}</p>
      {action}
    </div>
  )
}

export function Radio({ on }: { on: boolean }) { return <span className="radio">{on && <Check size={14} />}</span> }
export function Toast() { const { toast } = useStore(); return toast ? <div className="toast" role="status">{toast}</div> : null }
export function initials(n: string) { return n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() }
