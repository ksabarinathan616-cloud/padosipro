import { HashRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { BottomNav, Logo, Toast } from './components/ui'
import { useStore } from './state/store'
import { Onboarding, Splash, Welcome } from './screens/Onboarding'
import { Forgot, Otp, SignIn, SignUp } from './screens/Auth'
import { CategoryScreen, Compare, HomeScreen, SearchScreen, Services, VendorDetail } from './screens/Browse'
import { Confirmation, PaymentPreview, RequestFlow } from './screens/Request'
import { AddressForm, AddressList, BookingDetail, Bookings, FamilyForm, FamilyList, VendorManagement } from './screens/Manage'
import { About, ContactSupport, Notifications, Preferences, Privacy, Profile, Support } from './screens/Misc'

const TABS = ['/home', '/services', '/bookings', '/notifications', '/support/contact', '/profile']

function Guard({ children }: { children: ReactNode }) {
  const { user } = useStore()
  return user ? <>{children}</> : <Navigate to="/welcome" replace />
}

function AdminGuard({ children }: { children: ReactNode }) {
  const { user } = useStore()
  if (!user) return <Navigate to="/welcome" replace />
  if (user.role !== 'admin') return <Navigate to="/profile" replace />
  return <>{children}</>
}
const P = (el: ReactNode) => <Guard>{el}</Guard>
const A = (el: ReactNode) => <AdminGuard>{el}</AdminGuard>

function Shell() {
  const { pathname } = useLocation()
  const { user } = useStore()
  const showNav = TABS.some(t => pathname === t || (t === '/services' && /^\/services\/?$/.test(pathname)) || (t === '/bookings' && pathname === '/bookings'))
  return (
    <div className="app">
      <header className="global-header">
        <Logo size={24} color="#5db18c" cut="#0e4e44" text="#0e4e44" />
        {user && <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/bookings">Requests</NavLink>
          <NavLink to="/support">Support</NavLink>
          <NavLink to="/support/contact">Contact</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>}
      </header>
      <div className="protobar">Design prototype · simulated data · nothing is sent or charged</div>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/home" element={P(<HomeScreen />)} />
        <Route path="/services" element={P(<Services />)} />
        <Route path="/services/:id" element={P(<CategoryScreen />)} />
        <Route path="/search" element={P(<SearchScreen />)} />
        <Route path="/compare" element={P(<Compare />)} />
        <Route path="/vendor/:id" element={P(<VendorDetail />)} />
        <Route path="/request" element={P(<RequestFlow />)} />
        <Route path="/request/done/:id" element={P(<Confirmation />)} />
        <Route path="/bookings" element={P(<Bookings />)} />
        <Route path="/bookings/:id" element={P(<BookingDetail />)} />
        <Route path="/bookings/:id/payment" element={P(<PaymentPreview />)} />
        <Route path="/family" element={P(<FamilyList />)} />
        <Route path="/family/new" element={P(<FamilyForm />)} />
        <Route path="/family/:id" element={P(<FamilyForm />)} />
        <Route path="/addresses" element={P(<AddressList />)} />
        <Route path="/addresses/new" element={P(<AddressForm />)} />
        <Route path="/addresses/:id" element={P(<AddressForm />)} />
        <Route path="/notifications" element={P(<Notifications />)} />
        <Route path="/profile" element={P(<Profile />)} />
        <Route path="/vendor-admin" element={A(<VendorManagement />)} />
        <Route path="/preferences" element={P(<Preferences />)} />
        <Route path="/privacy" element={P(<Privacy />)} />
        <Route path="/about" element={P(<About />)} />
        <Route path="/support" element={P(<Support />)} />
        <Route path="/support/contact" element={P(<ContactSupport />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="site-footer">
        <span>Developed by PadosiPro <span aria-hidden="true">·</span> © 2026</span>
        <a href="mailto:padosipro@gmail.com">padosipro@gmail.com</a>
      </footer>
      {showNav && <BottomNav />}
      <Toast />
    </div>
  )
}
export default function App() { return <HashRouter><Shell /></HashRouter> }
