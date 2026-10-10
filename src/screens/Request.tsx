import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, CheckCircle2, CreditCard, Landmark, Plus, Smartphone, X } from 'lucide-react'
import { vendorById } from '../data/vendors'
import { STATUS_LABEL } from '../data/mock'
import { Empty, Field, ProtoBanner, Radio, Screen, TopBar, initials } from '../components/ui'
import { useStore } from '../state/store'

const STEPS = ['Contact', 'Where', 'Need', 'When', 'Review']
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Flexible']
const todayStr = () => new Date().toISOString().slice(0, 10)

export function RequestFlow() {
  const nav = useNavigate()
  const { draft, setDraft, family, addresses, addBooking, user } = useStore()
  const [step, setStep] = useState(0); const [tried, setTried] = useState(false); const [busy, setBusy] = useState(false)
  const v = draft ? vendorById(draft.vendorId) : undefined
  useEffect(() => { if (!draft || !v) nav('/services', { replace: true }) }, [draft, v, nav])
  useEffect(() => {
    if (!draft) return
    const nextDraft = { ...draft }
    if (!draft.customerName && user?.name) nextDraft.customerName = user.name
    if (!draft.customerPhone && user?.contact) nextDraft.customerPhone = user.contact
    if (nextDraft.customerName !== draft.customerName || nextDraft.customerPhone !== draft.customerPhone) setDraft(nextDraft)
  }, [draft, user, setDraft])
  if (!draft || !v) return null
  const d = draft; const set = (p: Partial<typeof d>) => setDraft({ ...d, ...p })
  const dateNeeded = v.kind !== 'order'
  const member = family.find(m => m.id === d.memberId); const addr = addresses.find(a => a.id === d.addressId)

  const errors: Record<number, Record<string, string>> = {
    0: {
      ...(!d.customerName?.trim() ? { name: 'Enter the full name' } : {}),
      ...(!d.customerPhone || d.customerPhone.replace(/\D/g, '').length < 10 ? { phone: 'Enter a valid phone number with at least 10 digits' } : {})
    },
    1: !d.memberId ? { member: 'Choose who this is for' } : {},
    2: !d.addressId ? { addr: 'Choose or add an address' } : {},
    3: { ...(!d.need ? { need: 'Choose what you need' } : {}), ...((d.description ?? '').trim().length < 10 ? { description: 'Describe the need in at least 10 characters' } : {}) },
    4: dateNeeded ? { ...(!d.date ? { date: 'Choose a preferred date' } : d.date < todayStr() ? { date: 'Choose today or a later date' } : {}), ...(!d.time ? { time: 'Choose a time of day' } : {}) } : {},
    5: {},
  }
  const err = errors[step]
  const next = () => { setTried(true); if (Object.keys(err).length) return; setTried(false); setStep(step + 1) }
  const back = () => (step === 0 ? nav(-1) : setStep(step - 1))
  const submit = () => {
    setBusy(true)
    window.setTimeout(() => {
      const b = addBooking({ vendorId: v.id, vendorName: v.name, categoryId: v.categories[0], need: d.need!, description: d.description!, notes: d.notes ?? '', memberId: d.memberId!, addressId: d.addressId!, date: d.date ?? '', time: d.time ?? '' })
      setDraft(null); nav('/request/done/' + b.id, { replace: true })
    }, 900)
  }
  const onPhoto = (f?: File) => { if (!f) return; if (!f.type.startsWith('image/')) return; const r = new FileReader(); r.onload = () => set({ photo: String(r.result) }); r.readAsDataURL(f) }

  return (
    <>
      <TopBar title={`Request: ${v.name}`} back={false} right={<button className="iconbtn" aria-label="Cancel request" onClick={() => { setDraft(null); nav(-1) }}><X /></button>} />
      <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of 5: ${STEPS[step]}`}>{STEPS.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
      <Screen>
        <span className="small muted">Step {step + 1} of {STEPS.length}</span>

        {step === 0 && <>
          <h1>Contact details</h1>
          <Field id="customerName" label="Full name" error={tried ? err.name : ''}>
            <input id="customerName" className={'input' + (tried && err.name ? ' err' : '')} placeholder="Enter the person’s name" value={d.customerName ?? ''} onChange={e => set({ customerName: e.target.value })} />
          </Field>
          <Field id="customerPhone" label="Phone number" error={tried ? err.phone : ''}>
            <input id="customerPhone" type="tel" className={'input' + (tried && err.phone ? ' err' : '')} placeholder="+91 98765 43210" value={d.customerPhone ?? ''} onChange={e => set({ customerPhone: e.target.value })} />
          </Field>
        </>}

        {step === 1 && <>
          <h1>Who is this for?</h1>
          <div className="stack">{family.map(m => (
            <button key={m.id} className={'opt' + (d.memberId === m.id ? ' on' : '')} onClick={() => set({ memberId: m.id })}>
              <div className="avatar sm">{initials(m.name)}</div><div className="grow"><b>{m.name}</b><div className="small muted">{m.relation} · {m.city}</div></div><Radio on={d.memberId === m.id} />
            </button>))}
            <button className="btn btn-ghost" onClick={() => nav('/family/new')}><Plus size={18} />Add family member</button>
            {tried && err.member && <span className="errtxt" role="alert">{err.member}</span>}
          </div>
        </>}

        {step === 2 && <>
          <h1>Where should the service happen?</h1>
          <div className="stack">{addresses.map(a => (
            <button key={a.id} className={'opt' + (d.addressId === a.id ? ' on' : '')} onClick={() => set({ addressId: a.id })}>
              <div className="grow"><b>{a.label}</b><div className="small muted">{a.line}, {a.city} {a.pin}</div></div><Radio on={d.addressId === a.id} />
            </button>))}
            <button className="btn btn-ghost" onClick={() => nav('/addresses/new')}><Plus size={18} />Add address</button>
            {tried && err.addr && <span className="errtxt" role="alert">{err.addr}</span>}
          </div>
          {v.areas.length > 0 && <p className="small muted">{v.name} is listed in {v.areas.join(', ')}. Coverage for your address is to be confirmed.</p>}
        </>}

        {step === 3 && <>
          <h1>What do you need?</h1>
          <Field id="need" label="Type of help" error={tried ? err.need : ''}>
            <select id="need" className={'select' + (tried && err.need ? ' err' : '')} value={d.need ?? ''} onChange={e => set({ need: e.target.value })}>
              <option value="">Choose one</option>{v.needs.map(n => <option key={n}>{n}</option>)}
            </select>
          </Field>
          <Field id="desc" label="Describe what you need" error={tried ? err.description : ''} hint="What, how often, and anything the provider should know.">
            <textarea id="desc" className={'textarea' + (tried && err.description ? ' err' : '')} value={d.description ?? ''} onChange={e => set({ description: e.target.value })} />
          </Field>
          <Field id="notes" label="Extra notes (optional)" hint="For example: language spoken, gate code contact, health or access needs."><textarea id="notes" className="textarea" style={{ minHeight: 72 }} value={d.notes ?? ''} onChange={e => set({ notes: e.target.value })} /></Field>
          {v.kind === 'home' && (
            <div className="stack"><b style={{ fontSize: 14 }}>Photo (optional)</b>
              {d.photo ? <div className="row"><img src={d.photo} alt="Attached" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 12 }} /><button className="btn btn-ghost btn-sm" onClick={() => set({ photo: undefined })}>Remove</button></div>
                : <label className="btn btn-ghost" style={{ cursor: 'pointer' }}><Camera size={18} />Add a photo<input type="file" accept="image/*" hidden onChange={e => onPhoto(e.target.files?.[0])} /></label>}
              <span className="hint">Prototype: the photo stays on your device and is not uploaded.</span></div>
          )}
        </>}

        {step === 4 && <>
          <h1>{dateNeeded ? 'When would you like it?' : 'Any preferred timing?'}</h1>
          <Field id="date" label={dateNeeded ? 'Preferred date' : 'Preferred date (optional)'} error={tried ? err.date : ''}>
            <input id="date" type="date" className={'input' + (tried && err.date ? ' err' : '')} min={todayStr()} value={d.date ?? ''} onChange={e => set({ date: e.target.value })} />
          </Field>
          <div className="stack"><b style={{ fontSize: 14 }}>Time of day{dateNeeded ? '' : ' (optional)'}</b>
            <div className="chips" style={{ flexWrap: 'wrap', overflow: 'visible', margin: 0, padding: 0 }}>{TIMES.map(t => <button key={t} className={'chip' + (d.time === t ? ' on' : '')} onClick={() => set({ time: t })} aria-pressed={d.time === t}>{t}</button>)}</div>
            {tried && err.time && <span className="errtxt" role="alert">{err.time}</span>}
          </div>
          <p className="small muted">This is a preference. The provider confirms the actual slot. Availability is to be confirmed.</p>
        </>}

        {step === 5 && <>
          <h1>Check your request</h1>
          <div className="card stack">
            <dl className="kv" style={{ margin: 0 }}>
              <dt>Contact</dt><dd>{d.customerName} · {d.customerPhone}</dd>
              <dt>Provider</dt><dd>{v.name}</dd>
              <dt>Service</dt><dd>{d.need}</dd>
              <dt>For</dt><dd>{member?.name} ({member?.relation})</dd>
              <dt>Address</dt><dd>{addr?.label}: {addr?.line}, {addr?.city} {addr?.pin}</dd>
              <dt>Details</dt><dd style={{ fontWeight: 400 }}>{d.description}</dd>
              {d.notes && <><dt>Notes</dt><dd style={{ fontWeight: 400 }}>{d.notes}</dd></>}
              {d.photo && <><dt>Photo</dt><dd><img src={d.photo} alt="Attached" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10 }} /></dd></>}
              <dt>Preferred</dt><dd>{d.date || d.time ? [d.date, d.time].filter(Boolean).join(', ') : 'No preference'}</dd>
            </dl>
          </div>
          <div className="card tint stack" style={{ gap: 6 }}>
            <b>Price: price on request</b>
            <p className="small">{v.name} has not published a price we can verify. The provider may need to inspect or send a quotation first. No total is shown and nothing is charged.</p>
          </div>
          <ProtoBanner>Submitting creates a simulated request on this device only. {v.name} will not receive it.</ProtoBanner>
        </>}

        <div className="row" style={{ marginTop: 'auto' }}>
          {step > 0 && <button className="btn btn-ghost" style={{ flex: 1 }} onClick={back}>Back</button>}
          {step < 5 ? <button className="btn btn-primary" style={{ flex: 2 }} onClick={next}>Continue</button>
            : <button className="btn btn-primary" style={{ flex: 2 }} onClick={submit} disabled={busy}>{busy ? 'Submitting…' : 'Submit request (simulated)'}</button>}
        </div>
      </Screen>
    </>
  )
}

export function Confirmation() {
  const { id } = useParams(); const nav = useNavigate(); const { bookings } = useStore(); const b = bookings.find(x => x.id === id)
  if (!b) return <Screen><Empty title="Request not found" text="Go back to your requests." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/bookings')}>Your requests</button>} /></Screen>
  return (
    <Screen>
      <div className="empty" style={{ paddingTop: 48 }}>
        <div className="icobox" style={{ background: 'var(--green)', color: 'var(--ink)' }}><CheckCircle2 size={32} /></div>
        <h1>Request saved</h1>
        <p className="muted">Reference <b>{b.ref}</b></p>
        <p style={{ maxWidth: 300 }}>This is a prototype confirmation. {b.vendorName} has <b>not</b> received anything and no payment was taken.</p>
      </div>
      <ProtoBanner>In the real product the provider would respond with a quote or a confirmed time.</ProtoBanner>
      <div className="stack" style={{ marginTop: 'auto' }}>
        <button className="btn btn-primary" onClick={() => nav('/bookings/' + b.id, { replace: true })}>View request</button>
        <button className="btn btn-ghost" onClick={() => nav('/home', { replace: true })}>Back to home</button>
      </div>
    </Screen>
  )
}

/** Simulated payment: reachable from a request that is "Quotation required" or later. */
export function PaymentPreview() {
  const { id } = useParams(); const nav = useNavigate(); const { bookings, say } = useStore(); const b = bookings.find(x => x.id === id)
  const [method, setMethod] = useState('upi'); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false)
  if (!b) return <Screen><Empty title="Request not found" text="Go back to your requests." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/bookings')}>Your requests</button>} /></Screen>
  const opts = [['upi', 'UPI', Smartphone], ['card', 'Card', CreditCard], ['bank', 'Net banking', Landmark]] as const
  if (done) return (
    <Screen><div className="empty" style={{ paddingTop: 48 }}><div className="icobox"><CheckCircle2 /></div><h1>Payment preview complete</h1>
      <p style={{ maxWidth: 300 }}>No money moved. This screen only shows how paying would look once a provider’s quote is accepted.</p></div>
      <button className="btn btn-primary" onClick={() => { say('Back to your request'); nav('/bookings/' + b.id, { replace: true }) }}>Back to request</button></Screen>
  )
  return (
    <>
      <TopBar title="Pay (preview)" />
      <Screen>
        <ProtoBanner><b>Simulated payment screen.</b> Do not enter real card or bank details. Nothing is collected or charged.</ProtoBanner>
        <div className="card stack" style={{ gap: 4 }}><b>{b.vendorName}</b><span className="small muted">{b.need} · {b.ref}</span>
          <div className="row between" style={{ marginTop: 8 }}><span>Amount</span><b>Quote not available</b></div>
          <span className="tiny muted">In the real flow the provider’s quote appears here. This prototype never invents an amount.</span></div>
        <div className="stack"><h3>Pay with (example options)</h3>
          {opts.map(([k, l, I]) => <button key={k} className={'opt' + (method === k ? ' on' : '')} onClick={() => setMethod(k)}><I size={20} /><b className="grow">{l}</b><Radio on={method === k} /></button>)}</div>
        <button className="btn btn-dark" style={{ marginTop: 'auto' }} disabled={busy} onClick={() => { setBusy(true); window.setTimeout(() => { setBusy(false); setDone(true) }, 900) }}>{busy ? 'Working…' : 'Continue preview (no payment)'}</button>
      </Screen>
    </>
  )
}
