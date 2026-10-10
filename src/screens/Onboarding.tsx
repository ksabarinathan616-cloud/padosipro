import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Home, ShieldCheck, Users } from 'lucide-react'
import { Logo, LogoMark, ProtoBanner } from '../components/ui'
import { useStore } from '../state/store'

export function Splash() {
  const nav = useNavigate(); const { user, seenOnboarding } = useStore()
  useEffect(() => {
    const t = window.setTimeout(() => nav(user ? '/home' : seenOnboarding ? '/welcome' : '/onboarding', { replace: true }), 1600)
    return () => window.clearTimeout(t)
  }, [nav, user, seenOnboarding])
  return (
    <div className="screen" style={{ background: 'var(--teal)' }}>
      <div className="hero" aria-live="polite">
        <Logo size={56} />
        <p style={{ color: 'var(--green-30)' }}>Trusted professional help for everyday life</p>
      </div>
    </div>
  )
}

const SLIDES = [
  { icon: Users, title: 'Look after family from anywhere', text: 'Arrange help for your parents and relatives in India while you are away.' },
  { icon: Home, title: 'One place for home and daily needs', text: 'From elder care and repairs to groceries and puja. Pick a service and tell us what you need.' },
  { icon: ShieldCheck, title: 'Clear about who does the work', text: 'PadosiPro connects you with independent providers. Each service shows who the provider is and what is not yet confirmed.' },
]

export function Onboarding() {
  const nav = useNavigate(); const { finishOnboarding } = useStore(); const [i, setI] = useState(0)
  const s = SLIDES[i]; const last = i === SLIDES.length - 1
  const done = () => { finishOnboarding(); nav('/welcome', { replace: true }) }
  return (
    <div className="screen">
      <div className="row between" style={{ padding: '14px 20px' }}>
        <LogoMark size={32} color="#42b267" />
        <button className="btn btn-text" onClick={done}>Skip</button>
      </div>
      <div className="body" style={{ justifyContent: 'center', gap: 28 }}>
        <div className="icobox lg" style={{ width: 88, height: 88, borderRadius: 28, background: 'var(--teal)', color: 'var(--green)' }}><s.icon size={40} /></div>
        <div className="stack" style={{ gap: 12 }}>
          <h1>{s.title}</h1>
          <p className="muted" style={{ fontSize: 18 }}>{s.text}</p>
        </div>
      </div>
      <div className="body" style={{ flex: 'none', gap: 20 }}>
        <div className="dots" aria-label={`Step ${i + 1} of ${SLIDES.length}`}>{SLIDES.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
        <button className="btn btn-primary" onClick={() => (last ? done() : setI(i + 1))}>{last ? 'Get started' : 'Continue'}<ArrowRight size={18} /></button>
        {i > 0 && <button className="btn btn-text" style={{ alignSelf: 'center' }} onClick={() => setI(i - 1)}>Back</button>}
      </div>
    </div>
  )
}

export function Welcome() {
  const nav = useNavigate(); const { signIn } = useStore()
  return (
    <div className="screen">
      <div className="hero" style={{ flex: 1.2 }}>
        <Logo size={52} />
        <span className="welcome-eyebrow">A more thoughtful way to care</span>
        <h1 style={{ color: '#fff', marginTop: 8 }}>Helping you reclaim your time</h1>
        <p style={{ color: 'var(--green-30)', maxWidth: 420 }}>Arrange trusted help for your parents, family and home in India.</p>
      </div>
      <div className="body welcome-actions" style={{ flex: 'none', gap: 12 }}>
        <button className="btn btn-primary" onClick={() => nav('/signup')}>Create account</button>
        <button className="btn btn-ghost" onClick={() => nav('/signin')}>Sign in</button>
        <button className="btn btn-text" style={{ alignSelf: 'center' }} onClick={() => { signIn({ name: 'My Profile', contact: 'Guest account', role: 'customer' }); nav('/home') }}>Explore the prototype without an account</button>
        <ProtoBanner>Sign-in is simulated. No account is created.</ProtoBanner>
      </div>
    </div>
  )
}
