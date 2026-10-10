import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { Field, Logo, ProtoBanner, Screen, TopBar } from '../components/ui'
import { DEMO_ADMIN_EMAIL, inferUserRole, useStore } from '../state/store'

const DEMO_ADMIN_PASSWORD = 'Pado@321'
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const phoneOk = (v: string) => /^\+?[0-9 ()-]{8,18}$/.test(v) && v.replace(/\D/g, '').length >= 8
export const contactError = (v: string) => (!v.trim() ? 'Enter your email or phone number' : emailOk(v.trim()) || phoneOk(v.trim()) ? '' : 'Enter a valid email or phone number (include country code if outside India)')
export const DEMO_OTP = '123456'

function Pass({ id, value, onChange, error }: { id: string; value: string; onChange: (v: string) => void; error?: string }) {
  const [show, setShow] = useState(false)
  return (
    <Field id={id} label="Password" error={error}>
      <div style={{ position: 'relative' }}>
        <input id={id} className={'input' + (error ? ' err' : '')} type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} autoComplete="current-password" />
        <button type="button" className="iconbtn" style={{ position: 'absolute', right: 2, top: 3 }} aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff size={20} /> : <Eye size={20} />}</button>
      </div>
    </Field>
  )
}

export function SignIn() {
  const nav = useNavigate()
  const [contact, setContact] = useState(''); const [pw, setPw] = useState(''); const [tried, setTried] = useState(false)
  const [authError, setAuthError] = useState('')
  const ce = tried ? contactError(contact) : ''; const pe = tried && pw.length < 6 ? 'Password must be at least 6 characters' : ''
  const go = () => {
    setTried(true); setAuthError('')
    if (contactError(contact) || pw.length < 6) return
    const normalizedContact = contact.trim().toLowerCase()
    if (normalizedContact === DEMO_ADMIN_EMAIL && pw !== DEMO_ADMIN_PASSWORD) {
      setAuthError('The demo administrator password is incorrect.')
      return
    }
    nav('/otp', { state: { contact: contact.trim(), name: '', mode: 'signin', adminDemo: normalizedContact === DEMO_ADMIN_EMAIL } })
  }
  return (
    <>
      <TopBar title="Sign in" back="/welcome" />
      <Screen>
        <div className="auth-panel">
          <div className="auth-brand"><Logo size={40} color="#5db18c" cut="#0e4e44" text="#0e4e44" /></div>
          <div className="stack auth-heading"><h1>Welcome back</h1><p className="muted">Sign in to manage your family’s services.</p></div>
          <Field id="contact" label="Email or phone number" error={ce}>
            <input id="contact" className={'input' + (ce ? ' err' : '')} value={contact} onChange={e => setContact(e.target.value)} inputMode="email" autoComplete="username" />
          </Field>
          <Pass id="pw" value={pw} onChange={setPw} error={pe} />
          <button className="btn btn-text" style={{ alignSelf: 'flex-end' }} onClick={() => nav('/forgot')}>Forgot password?</button>
          {authError && <span className="errtxt" role="alert">{authError}</span>}
          <button className="btn btn-primary auth-submit" onClick={go}>Continue</button>
          <button className="btn btn-text" style={{ alignSelf: 'center' }} onClick={() => nav('/signup')}>New here? Create an account</button>
          <ProtoBanner>Any valid email or phone and a 6+ character password works. No real sign-in happens.</ProtoBanner>
        </div>
      </Screen>
    </>
  )
}

export function SignUp() {
  const nav = useNavigate()
  const [name, setName] = useState(''); const [contact, setContact] = useState(''); const [pw, setPw] = useState(''); const [ok, setOk] = useState(false); const [tried, setTried] = useState(false)
  const ne = tried && name.trim().length < 2 ? 'Enter your name' : ''; const ce = tried ? contactError(contact) : ''
  const pe = tried && pw.length < 6 ? 'Password must be at least 6 characters' : ''; const te = tried && !ok ? 'Please accept to continue' : ''
  const reservedId = tried && contact.trim().toLowerCase() === DEMO_ADMIN_EMAIL
  const go = () => { setTried(true); if (name.trim().length < 2 || contactError(contact) || pw.length < 6 || !ok || contact.trim().toLowerCase() === DEMO_ADMIN_EMAIL) return; nav('/otp', { state: { contact: contact.trim(), name: name.trim(), mode: 'signup' } }) }
  return (
    <>
      <TopBar title="Create account" back="/welcome" />
      <Screen>
        <div className="stack"><h1>Let’s get you set up</h1><p className="muted">It takes a minute.</p></div>
        <Field id="name" label="Your name" error={ne}><input id="name" className={'input' + (ne ? ' err' : '')} value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></Field>
        <Field id="contact" label="Email or phone number" error={ce}><input id="contact" className={'input' + (ce ? ' err' : '')} value={contact} onChange={e => setContact(e.target.value)} autoComplete="username" /></Field>
        {reservedId && <span className="errtxt" role="alert">This demo administrator ID is reserved and cannot be used to create a customer account.</span>}
        <Pass id="pw" value={pw} onChange={setPw} error={pe} />
        <div className="stack" style={{ gap: 6 }}>
          <label className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
            <input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)} style={{ width: 22, height: 22, accentColor: '#0e4e44', marginTop: 2 }} />
            <span className="small">I understand PadosiPro connects me with independent service providers who carry out the work.</span>
          </label>
          {te && <span className="errtxt" role="alert">{te}</span>}
        </div>
        <button className="btn btn-primary" onClick={go}>Create account</button>
        <ProtoBanner>No account is created. Details stay on this device.</ProtoBanner>
      </Screen>
    </>
  )
}

export function Otp() {
  const nav = useNavigate(); const loc = useLocation(); const { signIn } = useStore()
  const st = (loc.state ?? { contact: 'your contact', name: '', mode: 'signin', adminDemo: false }) as { contact: string; name: string; mode: string; adminDemo?: boolean }
  const [code, setCode] = useState(''); const [err, setErr] = useState(''); const [secs, setSecs] = useState(30); const [busy, setBusy] = useState(false)
  useEffect(() => { if (secs <= 0) return; const t = window.setTimeout(() => setSecs(s => s - 1), 1000); return () => window.clearTimeout(t) }, [secs])
  const verify = () => {
    if (code.length !== 6) { setErr('Enter the 6-digit code'); return }
    setBusy(true); setErr('')
    window.setTimeout(() => {
      setBusy(false)
      if (code !== DEMO_OTP) { setErr('That code is not right. Check it and try again.'); return }
      const role = st.mode === 'signin' && st.adminDemo && st.contact.trim().toLowerCase() === DEMO_ADMIN_EMAIL ? 'admin' : inferUserRole(st.contact)
      signIn({ name: st.name?.trim() || (role === 'admin' ? 'PadosiPro Admin' : 'My Profile'), contact: st.contact, role }); nav('/home', { replace: true })
    }, 700)
  }
  return (
    <>
      <TopBar title="Verify" />
      <Screen>
        <div className="stack"><h1>Enter the code</h1><p className="muted">We would send a 6-digit code to <b>{st.contact}</b>.</p></div>
        <Field id="otp" label="6-digit code" error={err}>
          <input id="otp" className={'input' + (err ? ' err' : '')} inputMode="numeric" maxLength={6} value={code} style={{ letterSpacing: 10, fontSize: 24, textAlign: 'center' }}
            onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setErr('') }} autoComplete="one-time-code" />
        </Field>
        <button className="btn btn-primary" onClick={verify} disabled={busy}>{busy ? 'Checking…' : 'Verify'}</button>
        {secs > 0 ? <p className="muted small" style={{ textAlign: 'center' }}>Resend code in {secs}s</p> : <button className="btn btn-text" style={{ alignSelf: 'center' }} onClick={() => { setSecs(30); setErr('') }}>Resend code</button>}
        <ProtoBanner>No code is sent. Use <b>{DEMO_OTP}</b> to continue. Any other code shows the error state.</ProtoBanner>
      </Screen>
    </>
  )
}

export function Forgot() {
  const [contact, setContact] = useState(''); const [tried, setTried] = useState(false); const [sent, setSent] = useState(false)
  const nav = useNavigate(); const ce = tried ? contactError(contact) : ''
  return (
    <>
      <TopBar title="Forgot password" />
      <Screen>
        {sent ? (
          <div className="empty">
            <div className="icobox"><CheckCircle2 /></div>
            <h2>Check your inbox</h2>
            <p className="muted">If this were live, we would send reset steps to {contact}.</p>
            <button className="btn btn-primary" onClick={() => nav('/signin')}>Back to sign in</button>
            <ProtoBanner>Nothing was sent.</ProtoBanner>
          </div>
        ) : (
          <>
            <div className="stack"><h1>Reset your password</h1><p className="muted">Enter the email or phone you signed up with.</p></div>
            <Field id="contact" label="Email or phone number" error={ce}><input id="contact" className={'input' + (ce ? ' err' : '')} value={contact} onChange={e => setContact(e.target.value)} /></Field>
            <button className="btn btn-primary" onClick={() => { setTried(true); if (!contactError(contact)) setSent(true) }}>Send reset steps</button>
          </>
        )}
      </Screen>
    </>
  )
}
