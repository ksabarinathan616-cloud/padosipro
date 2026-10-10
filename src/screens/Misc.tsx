import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Bell, BellOff, CheckCircle2, ChevronRight, ClipboardList, Code2, Contact, Eye, HeartHandshake, HeadphonesIcon, Info, LogOut, MapPin, RotateCcw, Settings, ShieldCheck, Users } from 'lucide-react'
import { FAQS, ISSUE_TYPES } from '../data/mock'
import { Empty, Field, Logo, ProtoBanner, Screen, Sheet, TopBar, initials } from '../components/ui'
import { useStore } from '../state/store'
import { CATEGORIES } from '../data/categories'

/* ---------- Notifications ---------- */
export function Notifications() {
  const nav = useNavigate(); const { notices, markRead, markAllRead, clearNotices } = useStore()
  return (
    <>
      <TopBar title="Alerts" back={false} right={notices.some(n => !n.read) ? <button className="btn btn-text" onClick={markAllRead}>Mark all read</button> : undefined} />
      <Screen nav>
        <ProtoBanner>Alerts are simulated. No email, SMS or push messages are sent.</ProtoBanner>
        {notices.length === 0 ? <Empty icon={<BellOff />} title="You’re all caught up" text="Updates about your requests will show up here." /> : (
          <>
            {notices.map(n => (
              <button key={n.id} className={'card' + (n.read ? '' : ' unread')} onClick={() => { markRead(n.id); if (n.bookingId) nav('/bookings/' + n.bookingId) }}>
                <div className="row between"><b>{n.title}</b>{!n.read && <span className="badge dark">New</span>}</div>
                <p className="small" style={{ margin: '4px 0' }}>{n.body}</p><span className="tiny muted">{n.at}</span>
              </button>))}
            <button className="btn btn-text" style={{ alignSelf: 'center' }} onClick={clearNotices}>Clear all</button>
          </>)}
      </Screen>
    </>
  )
}

/* ---------- Profile ---------- */
function Item({ icon: I, label, to, hint }: { icon: typeof Bell; label: string; to: string; hint?: string }) {
  const nav = useNavigate()
  return <button className="card row" onClick={() => nav(to)}><span className="icobox"><I size={20} /></span><div className="grow"><b>{label}</b>{hint && <div className="small muted">{hint}</div>}</div><ChevronRight size={20} className="muted" /></button>
}
export function Profile() {
  const nav = useNavigate(); const { user, signOut, family, addresses, bookings, isAdmin } = useStore(); const [ask, setAsk] = useState(false)
  const profileName = user?.name?.trim() || 'My Profile'
  const profileContact = user?.contact?.trim() || 'Not signed in'

  return (
    <>
      <TopBar title="Profile" back={false} />
      <Screen nav>
        <div className="row"><div className="avatar" style={{ width: 60, height: 60, fontSize: 20 }}>{initials(profileName)}</div><div><h2>{profileName}</h2><span className="muted small">{profileContact}</span></div></div>
        <div className="stack">
          <Item icon={Users} label="Family details" to="/family" hint={`${family.length} people`} />
          <Item icon={MapPin} label="Saved addresses" to="/addresses" hint={`${addresses.length} saved`} />
          <Item icon={ClipboardList} label="Request history" to="/bookings" hint={`${bookings.length} requests (sample and new)`} />
          {isAdmin && <Item icon={Settings} label="Vendor catalog admin" to="/vendor-admin" hint="Edit provider names and demo listings" />}
          <Item icon={Settings} label="Preferences" to="/preferences" />
          <Item icon={ShieldCheck} label="Privacy information" to="/privacy" />
          <Item icon={HeadphonesIcon} label="Help and support" to="/support" />
          <Item icon={Info} label="About PadosiPro" to="/about" />
        </div>
        <button className="btn btn-ghost" onClick={() => setAsk(true)}><LogOut size={18} />Sign out</button>
      </Screen>
      {ask && <Sheet title="Sign out?" onClose={() => setAsk(false)}>
        <p className="muted">Your sample data stays on this device.</p>
        <button className="btn btn-dark" onClick={() => { signOut(); nav('/welcome', { replace: true }) }}>Sign out</button>
        <button className="btn btn-ghost" onClick={() => setAsk(false)}>Stay signed in</button></Sheet>}
    </>
  )
}

function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return <div className="row between"><span>{label}</span><button className={'toggle' + (on ? ' on' : '')} role="switch" aria-checked={on} aria-label={label} onClick={() => set(!on)} /></div>
}
export function Preferences() {
  const { resetDemo, say } = useStore(); const [a, setA] = useState(true); const [b, setB] = useState(true); const [c, setC] = useState(false)
  return (
    <>
      <TopBar title="Preferences" />
      <Screen>
        <ProtoBanner>These switches are for show. No notifications are ever sent.</ProtoBanner>
        <div className="card stack" style={{ gap: 18 }}><Toggle on={a} set={setA} label="Request updates" /><Toggle on={b} set={setB} label="Reminders" /><Toggle on={c} set={setC} label="Tips and offers" /></div>
        <div className="stack"><h3>Demo data</h3><p className="small muted">Put sample family, addresses, requests and alerts back to how they started.</p>
          <button className="btn btn-ghost" onClick={() => { resetDemo(); say('Demo data reset') }}><RotateCcw size={18} />Reset demo data</button></div>
      </Screen>
    </>
  )
}
export function Privacy() {
  return (
    <>
      <TopBar title="Privacy information" />
      <Screen>
        <p>This prototype has no server. Anything you type stays in this browser on this device.</p>
        <p>In a live product we would explain exactly what is shared with a service provider when you submit a request, and why. That wording needs to be written with the founder and a lawyer before launch.</p>
        <ProtoBanner>This screen is a placeholder, not a privacy policy.</ProtoBanner>
      </Screen>
    </>
  )
}
export function About() {
  const nav = useNavigate()
  const jumpToHow = () => document.getElementById('about-how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const audience = [
    'People coordinating support for family in India from another country.',
    'Families living in different cities and sharing care responsibilities.',
    'People supporting ageing parents and relatives.',
    'Busy professionals organizing household and everyday services.',
    'Anyone looking for a more organized way to explore local services.',
  ]
  const principles = [
    { title: 'Clarity', text: 'Service details, demo prices, and request statuses are presented with their limitations clearly identified.', icon: Eye },
    { title: 'Convenience', text: 'Explore multiple family, home, and everyday service categories in one interface.', icon: HeartHandshake },
    { title: 'Transparency', text: 'Prices are illustrative only when marked as demo prices; other prices need provider confirmation.', icon: Info },
    { title: 'Privacy awareness', text: 'This prototype stores entered information in the browser on this device and has no connected backend.', icon: ShieldCheck },
    { title: 'Accountability', text: 'Use the contact form to prepare a demo message, or reach the configured contact email.', icon: Contact },
  ]
  const steps = [
    { title: 'Discover', text: 'Browse service categories and review provider information, demo prices, and listing notes.' },
    { title: 'Choose', text: 'Select a relevant provider or service based on the information currently shown.' },
    { title: 'Submit a request', text: 'Enter contact, family, address, and service details. The request is saved locally as prototype data.' },
    { title: 'Track your request', text: 'View the latest demo status in request history. No live provider updates are connected.' },
  ]
  const faqs = [
    { question: 'What is PadosiPro?', answer: 'PadosiPro is a frontend prototype for discovering family support, household, and lifestyle services in one place.' },
    { question: 'Who can use PadosiPro?', answer: 'It is designed for people coordinating everyday services for themselves or family members, including relatives living in different cities or countries.' },
    { question: 'What types of services can I explore?', answer: `The current prototype includes ${CATEGORIES.length} categories, from elder care and home healthcare to groceries, travel, education, and legal-related listings.` },
    { question: 'How can I submit a service request?', answer: 'Choose a provider, complete the request form, and submit it. The request is stored in this browser as simulated demo data; nothing is sent to a provider.' },
    { question: 'How can I check my request status?', answer: 'Open Requests from the navigation or your profile. Statuses are shown as simulated prototype information and are not live provider updates.' },
    { question: 'Are all listed providers available in every city?', answer: 'No. Availability and service coverage are not verified by this prototype. Confirm current details with the provider before relying on a listing.' },
    { question: 'How can I contact the platform?', answer: 'Use the Contact section to fill in a message form. Form submission is simulated; you can also email padosipro@gmail.com.' },
    { question: 'Is PadosiPro currently live?', answer: 'This project is a frontend prototype. It has no connected production backend, payment gateway, or live provider integrations.' },
  ]
  const technologies = [
    { name: 'React', role: 'Builds the interface from reusable components and renders interactive pages.' },
    { name: 'TypeScript', role: 'Adds static types to application code to help catch mistakes during development.' },
    { name: 'Vite', role: 'Runs the local development server and builds the frontend for deployment.' },
    { name: 'CSS', role: 'Provides the responsive layout, visual styling, and existing brand design system.' },
    { name: 'React Router', role: 'Handles navigation between the application’s screens and service routes.' },
    { name: 'Browser localStorage', role: 'Keeps prototype demo data on the current device; it is not a server database.' },
  ]
  return (
    <>
      <TopBar title="About PadosiPro" />
      <Screen>
        <div className="about-page">
          <section className="about-hero">
            <div className="about-hero-copy">
              <span className="about-kicker">Family support, thoughtfully organized</span>
              <h1>Care for Your Family.<br />Peace of Mind for You.</h1>
              <p>PadosiPro is designed to help people coordinate everyday services and family support in India, especially when distance makes it difficult to manage everything personally.</p>
              <p>Explore service categories, submit a request, and follow its demo status in one convenient experience.</p>
              <div className="about-actions">
                <button className="btn btn-primary" onClick={() => nav('/services')}>Explore Services <ArrowRight size={18} /></button>
                <button className="btn btn-ghost" onClick={jumpToHow}>How It Works</button>
              </div>
              <span className="about-hero-note">Frontend prototype · Requests and updates are simulated</span>
            </div>
            <div className="about-hero-image">
              <img src={CATEGORIES.find(category => category.id === 'elder-care')?.image} alt="Care and companionship for an older family member" fetchPriority="high" />
              <div className="about-image-note"><HeartHandshake size={20} /><span>Support for family, home, and everyday life</span></div>
            </div>
          </section>

          <section className="about-section about-story">
            <div className="about-section-heading"><span className="about-kicker">Why we are building this</span><h2>Support should feel easier to coordinate.</h2></div>
            <div className="about-story-copy">
              <p>Managing a home, supporting ageing parents, arranging essential services, and handling everyday responsibilities can become challenging when family members live in different cities or countries. Finding assistance and coordinating multiple services can take time and effort.</p>
              <p>PadosiPro aims to simplify that experience by bringing service categories together in one organized platform. The goal is to help people discover relevant services, submit requests, and keep track of the demo service journey.</p>
            </div>
          </section>

          <section className="about-purpose-grid" aria-label="Mission and vision">
            <article className="about-purpose-card mission">
              <span className="about-kicker">Our mission</span>
              <h2>Make everyday support simpler.</h2>
              <p>To make family support and service coordination simpler, more accessible, and more convenient through a thoughtfully designed digital platform.</p>
            </article>
            <article className="about-purpose-card vision">
              <span className="about-kicker">Our vision</span>
              <h2>A more connected way to coordinate care.</h2>
              <p>To build a digital ecosystem where people can discover useful services and coordinate essential household and family needs with greater confidence, wherever they live.</p>
            </article>
          </section>

          <section className="about-section">
            <div className="about-section-heading">
              <span className="about-kicker">Explore the platform</span>
              <h2>Services for everyday life</h2>
              <p>Browse the categories currently represented in the prototype. Listings and coverage are not confirmation of provider availability.</p>
            </div>
            <div className="about-category-grid">
              {CATEGORIES.map(category => (
                <button className="about-category-card" key={category.id} onClick={() => nav('/services/' + category.id)} aria-label={`Explore ${category.name}`}>
                  <img src={category.image} alt="" loading="lazy" />
                  <span className="about-category-icon"><span className="cat-glyph">{category.icon.replace(/-/g, ' ')}</span></span>
                  <span className="about-category-copy"><b>{category.name}</b><small>{category.blurb}</small><span className="about-explore">Explore <ArrowRight size={14} /></span></span>
                </button>
              ))}
            </div>
          </section>

          <section className="about-section" id="about-how-it-works">
            <div className="about-section-heading">
              <span className="about-kicker">A simple demo journey</span>
              <h2>How it works</h2>
              <p>The steps below describe the current frontend prototype. Provider contact, payment, and service delivery are not connected.</p>
            </div>
            <ol className="about-steps">
              {steps.map((step, index) => <li key={step.title}><span className="about-step-number">0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}
            </ol>
          </section>

          <section className="about-audience">
            <div className="about-section-heading"><span className="about-kicker">Who it is for</span><h2>Built around real coordination needs.</h2><p>Different families have different routines. PadosiPro is intended to help organize discovery and requests without promising outcomes.</p></div>
            <ul className="about-audience-list">{audience.map(person => <li key={person}><span aria-hidden="true">✓</span>{person}</li>)}</ul>
          </section>

          <section className="about-section">
            <div className="about-section-heading"><span className="about-kicker">Our principles</span><h2>Trust starts with honest information.</h2></div>
            <div className="about-principles-grid">
              {principles.map(({ title, text, icon: Icon }) => <article className="about-principle-card" key={title}><span className="icobox"><Icon size={21} /></span><h3>{title}</h3><p>{text}</p></article>)}
            </div>
          </section>

          <section className="about-tech">
            <div className="about-section-heading"><span className="about-kicker">Built with familiar tools</span><h2>Technology behind PadosiPro</h2><p>The current project is a frontend prototype. No server, payment gateway, or live provider API is configured.</p></div>
            <div className="about-tech-grid">
              {technologies.map(technology => <article className="about-tech-card" key={technology.name}><span className="icobox"><Code2 size={20} /></span><div><h3>{technology.name}</h3><p>{technology.role}</p></div></article>)}
            </div>
          </section>

          <section className="about-project">
            <div className="about-project-heading"><Logo size={34} color="#5db18c" cut="#0e4e44" text="#fff" /><span className="about-kicker">Project & developer information</span><h2>A prototype with a clear purpose.</h2></div>
            <dl className="about-project-facts">
              <div><dt>Project name</dt><dd>PadosiPro</dd></div>
              <div><dt>Project type</dt><dd>Family Support and Lifestyle Service Coordination Platform</dd></div>
              <div><dt>Development focus</dt><dd>UI/UX design, frontend development, service discovery, and request management</dd></div>
              <div><dt>Project status</dt><dd><span className="badge">Frontend prototype · demo workflow</span></dd></div>
              <div><dt>Developer details</dt><dd>Developer name and role are not configured in this project.</dd></div>
              <div><dt>Contact</dt><dd><a href="mailto:padosipro@gmail.com">padosipro@gmail.com</a></dd></div>
            </dl>
          </section>

          <section className="about-section">
            <div className="about-section-heading"><span className="about-kicker">Current status</span><h2>Prototype today. More to build.</h2><p>Provider availability, payment processing, and request updates are not live integrations. Future work could include a backend, provider onboarding, clearer notifications, expanded verified coverage, and production payment integration.</p></div>
          </section>

          <section className="about-section">
            <div className="about-section-heading"><span className="about-kicker">Questions</span><h2>Frequently asked</h2></div>
            <div className="about-faq">{faqs.map(item => <details key={item.question}><summary>{item.question}<ChevronRight size={18} /></summary><p>{item.answer}</p></details>)}</div>
          </section>

          <section className="about-cta">
            <span className="about-kicker">PadosiPro</span>
            <h2>Making Family Support Simpler, One Step at a Time.</h2>
            <p>Explore the services available in the prototype and discover a more organized way to coordinate everyday family and household needs.</p>
            <div className="about-actions">
              <button className="btn btn-primary" onClick={() => nav('/services')}>Explore Services <ArrowRight size={18} /></button>
              <button className="btn btn-ghost" onClick={() => nav('/support/contact')}>Contact Us</button>
            </div>
          </section>
          <div className="about-links" aria-label="About page links">
            <button onClick={() => nav('/services')}>Services</button>
            <button onClick={() => nav('/support/contact')}>Contact</button>
            <button onClick={() => nav('/privacy')}>Privacy information</button>
          </div>
          <ProtoBanner>Prototype only: availability, requests, payment steps, and status updates are not connected to live provider or payment systems.</ProtoBanner>
        </div>
      </Screen>
    </>
  )
}

/* ---------- Support ---------- */
export function Support() {
  const nav = useNavigate(); const { bookings } = useStore()
  return (
    <>
      <TopBar title="Help and support" />
      <Screen>
        <section className="stack"><h2>Common questions</h2>
          {FAQS.map(f => <details key={f.q} className="faq"><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>
        <button className="btn btn-primary" onClick={() => nav('/support/contact')}><Contact size={18} />Contact support</button>
        {bookings.length > 0 && <span className="tiny muted" style={{ textAlign: 'center' }}>Have a request reference ready if it is about a request.</span>}
      </Screen>
    </>
  )
}

export function ContactSupport() {
  const nav = useNavigate(); const loc = useLocation(); const { bookings, user } = useStore()
  const pre = (loc.state as { ref?: string } | null)?.ref ?? ''
  const [name, setName] = useState(user?.name === 'My Profile' ? '' : user?.name ?? '')
  const [contact, setContact] = useState(user?.contact === 'Guest account' ? '' : user?.contact ?? '')
  const [issue, setIssue] = useState(''); const [ref, setRef] = useState(pre); const [msg, setMsg] = useState('')
  const [tried, setTried] = useState(false); const [busy, setBusy] = useState(false); const [res, setRes] = useState<'' | 'ok' | 'fail'>('')
  const refKnown = !ref.trim() || bookings.some(b => b.ref.toLowerCase() === ref.trim().toLowerCase())
  const e = {
    name: name.trim().length >= 2 ? '' : 'Enter your name',
    contact: contactErrorForSupport(contact),
    issue: issue ? '' : 'Choose what this is about',
    msg: msg.trim().length < 10 ? 'Tell us a little more (10+ characters)' : '',
    ref: refKnown ? '' : 'We could not find that reference. Check it or leave it blank.',
  }
  const send = () => {
    setTried(true); if (Object.values(e).some(Boolean)) return
    setBusy(true); window.setTimeout(() => { setBusy(false); setRes(msg.toLowerCase().includes('fail') ? 'fail' : 'ok') }, 900)
  }
  if (res === 'ok') return (
    <Screen><div className="empty" style={{ paddingTop: 48 }}><div className="icobox"><CheckCircle2 /></div><h1>Message saved</h1>
      <p style={{ maxWidth: 300 }}>This is a prototype. Nobody received your message.</p></div>
      <button className="btn btn-primary" onClick={() => nav('/support', { replace: true })}>Done</button></Screen>)
  return (
    <>
      <TopBar title="Contact support" />
      <Screen>
        <ProtoBanner>Demo contact form: sending is simulated. For follow-up, email <a href="mailto:padosipro@gmail.com">padosipro@gmail.com</a>.</ProtoBanner>
        {res === 'fail' && <div className="card" style={{ borderColor: 'var(--danger)' }} role="alert"><b style={{ color: 'var(--danger-ink)' }}>Message did not send</b><p className="small">This is the demo error state. Press Send message to try again.</p></div>}
        <Field id="contactName" label="Your name" error={tried ? e.name : ''}><input id="contactName" className={'input' + (tried && e.name ? ' err' : '')} value={name} onChange={x => setName(x.target.value)} autoComplete="name" /></Field>
        <Field id="contactAddress" label="Email or phone number" error={tried ? e.contact : ''}><input id="contactAddress" className={'input' + (tried && e.contact ? ' err' : '')} value={contact} onChange={x => setContact(x.target.value)} autoComplete="email" /></Field>
        <Field id="issue" label="What is this about?" error={tried ? e.issue : ''}><select id="issue" className={'select' + (tried && e.issue ? ' err' : '')} value={issue} onChange={x => setIssue(x.target.value)}><option value="">Choose one</option>{ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
        <Field id="ref" label="Request reference (optional)" error={tried ? e.ref : ''} hint="For example PROTO-2001 or SAMPLE-1001"><input id="ref" className={'input' + (tried && e.ref ? ' err' : '')} value={ref} onChange={x => setRef(x.target.value)} /></Field>
        <Field id="msg" label="Your message" error={tried ? e.msg : ''}><textarea id="msg" className={'textarea' + (tried && e.msg ? ' err' : '')} value={msg} onChange={x => { setMsg(x.target.value); setRes('') }} /></Field>
        <button className="btn btn-primary" style={{ marginTop: 'auto' }} onClick={send} disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
      </Screen>
    </>
  )
}

function contactErrorForSupport(value: string) {
  const normalized = value.trim()
  return normalized && (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || (/^\+?[0-9 ()-]{8,18}$/.test(normalized) && normalized.replace(/\D/g, '').length >= 8))
    ? ''
    : 'Enter a valid email address or phone number'
}
