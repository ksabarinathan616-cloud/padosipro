import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronRight, HeadphonesIcon, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { STATUS_FLOW, STATUS_LABEL, type Address, type FamilyMember } from '../data/mock'
import { Empty, Field, ProtoBanner, Screen, Sheet, TopBar, initials } from '../components/ui'
import { CATEGORIES, type CategoryId } from '../data/categories'
import { BASE_VENDOR_CATALOG, readVendorCatalog, type VendorCatalogEntry, writeVendorCatalog } from '../data/vendors'
import { useStore } from '../state/store'

/* ---------- Bookings ---------- */
const OPEN = ['submitted', 'awaiting', 'quotation', 'scheduled', 'in_progress']
export function Bookings() {
  const nav = useNavigate(); const { bookings } = useStore(); const [tab, setTab] = useState<'open' | 'past'>('open')
  const list = bookings.filter(b => (tab === 'open') === OPEN.includes(b.status))
  return (
    <>
      <TopBar title="Your requests" back={false} />
      <Screen nav>
        <div className="chips" role="tablist">
          {(['open', 'past'] as const).map(t => <button key={t} role="tab" aria-selected={tab === t} className={'chip' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t === 'open' ? 'Open' : 'Past'}</button>)}
        </div>
        <ProtoBanner>Sample requests and statuses are simulated.</ProtoBanner>
        {list.length === 0
          ? <Empty title={tab === 'open' ? 'No open requests' : 'Nothing in the past yet'} text="Pick a service to make your first request." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/services')}>Browse services</button>} />
          : list.map(b => (
            <button key={b.id} className="card stack" style={{ gap: 6 }} onClick={() => nav('/bookings/' + b.id)}>
              <div className="row between"><b>{b.vendorName}</b><ChevronRight size={18} className="muted" /></div>
              <span className="small muted">{b.need} · {b.ref}{b.sample ? ' (sample)' : ''}</span>
              <div className="badges"><span className={'badge' + (b.status === 'cancelled' ? ' warn' : '')}>{STATUS_LABEL[b.status]} — simulated</span></div>
            </button>))}
      </Screen>
    </>
  )
}

export function BookingDetail() {
  const { id } = useParams(); const nav = useNavigate(); const { bookings, family, addresses, advance, cancel, say, user } = useStore()
  const [ask, setAsk] = useState(false); const b = bookings.find(x => x.id === id)
  if (!b) return <><TopBar title="Request" /><Screen><Empty title="Request not found" text="It may have been removed." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/bookings')}>Your requests</button>} /></Screen></>
  const m = family.find(x => x.id === b.memberId); const a = addresses.find(x => x.id === b.addressId)
  const idx = STATUS_FLOW.indexOf(b.status); const cancelled = b.status === 'cancelled'; const open = OPEN.includes(b.status)
  const canManageStatus = Boolean(user && (user.role === 'admin' || user.role === 'vendor'))
  return (
    <>
      <TopBar title="Request details" back="/bookings" />
      <Screen>
        <div className="stack" style={{ gap: 6 }}><h1 style={{ fontSize: 24 }}>{b.vendorName}</h1><span className="muted">{b.need} · {b.ref}{b.sample ? ' (sample)' : ''}</span>
          <div className="badges"><span className={'badge' + (cancelled ? ' warn' : '')}>{STATUS_LABEL[b.status]} — simulated</span></div></div>
        <section className="stack"><h3>Progress</h3>
          {cancelled ? <p className="muted">This request was cancelled.</p> : (
            <ol className="tl">{STATUS_FLOW.map((s, i) => (
              <li key={s} className={i <= idx ? '' : 'todo'}><span className="pt">{i <= idx && <Check size={14} />}</span><div><b style={{ fontWeight: i === idx ? 700 : 500 }}>{STATUS_LABEL[s]}</b>{i === idx && <div className="tiny muted">Current simulated status</div>}</div></li>))}</ol>)}
          {canManageStatus && open && idx < STATUS_FLOW.length - 1 && <button className="btn btn-ghost btn-sm" onClick={() => advance(b.id)}>Admin: move to next demo status</button>}
          {!canManageStatus && <p className="small muted">Status updates are managed by the assigned provider or an admin in the demo workflow.</p>}
        </section>
        <section className="stack"><h3>Request</h3>
          <dl className="kv" style={{ margin: 0 }}>
            <dt>For</dt><dd>{m ? `${m.name} (${m.relation})` : 'Removed member'}</dd>
            <dt>Address</dt><dd>{a ? `${a.label}: ${a.line}, ${a.city}` : 'Removed address'}</dd>
            <dt>Details</dt><dd style={{ fontWeight: 400 }}>{b.description}</dd>
            {b.notes && <><dt>Notes</dt><dd style={{ fontWeight: 400 }}>{b.notes}</dd></>}
            <dt>Preferred</dt><dd>{[b.date, b.time].filter(Boolean).join(', ') || 'No preference'}</dd>
            <dt>Price</dt><dd>Price to be confirmed by provider.</dd>
          </dl>
        </section>
        <div className="stack" style={{ marginTop: 'auto' }}>
          {(b.status === 'quotation' || b.status === 'scheduled' || b.status === 'in_progress') && <button className="btn btn-dark" onClick={() => nav('/bookings/' + b.id + '/payment')}>Preview payment step</button>}
          <button className="btn btn-ghost" onClick={() => nav('/support', { state: { ref: b.ref } })}><HeadphonesIcon size={18} />Get help with this request</button>
          {canManageStatus && open && <button className="btn btn-danger" onClick={() => setAsk(true)}>Cancel request</button>}
        </div>
      </Screen>
      {ask && <Sheet title="Cancel this request?" onClose={() => setAsk(false)}>
        <p className="muted">This only changes the simulated request on this device.</p>
        <button className="btn btn-danger" onClick={() => { cancel(b.id); setAsk(false); say('Request cancelled (simulated)') }}>Yes, cancel request</button>
        <button className="btn btn-ghost" onClick={() => setAsk(false)}>Keep request</button>
      </Sheet>}
    </>
  )
}

export function VendorManagement() {
  const [catalog, setCatalog] = useState<VendorCatalogEntry[]>(() => readVendorCatalog())
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | CategoryId>('all')
  const [draft, setDraft] = useState<VendorCatalogEntry | null>(null)

  const applyCatalog = (next: VendorCatalogEntry[]) => {
    setCatalog(next)
    writeVendorCatalog(next)
  }

  const filtered = catalog.filter(v => {
    const matchesQuery = !query || `${v.displayName} ${v.serviceName} ${v.originalCompanyName}`.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter
    return matchesQuery && matchesCategory
  })

  const beginEdit = (item: VendorCatalogEntry) => setDraft({ ...item })

  const saveDraft = () => {
    if (!draft) return
    const next = catalog.map(item => item.id === draft.id ? { ...draft } : item)
    applyCatalog(next)
    setDraft(null)
  }

  const toggleActive = (id: string) => {
    const next = catalog.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item)
    applyCatalog(next)
  }

  const addVendor = () => {
    const item: VendorCatalogEntry = {
      id: 'vendor-' + Date.now(),
      originalCompanyName: 'New vendor',
      displayName: 'New vendor',
      serviceName: 'New service',
      category: 'grocery',
      description: 'Add a short description for this vendor listing.',
      supportedLocations: ['India'],
      priceLabel: 'Price to be confirmed by provider.',
      listingType: 'Demo listing',
      externalUrl: 'https://example.com',
      integrationStatus: 'Integration not connected',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
      isActive: true,
    }
    const next = [item, ...catalog]
    applyCatalog(next)
    setDraft(item)
  }

  return (
    <>
      <TopBar title="Vendor catalog" back="/profile" />
      <Screen nav>
        <div className="row" style={{ gap: 8 }}>
          <label className="searchbox grow" style={{ minHeight: 42 }}>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search vendors or services" aria-label="Search vendors" />
          </label>
          <button className="btn btn-primary btn-sm" onClick={addVendor}>Add</button>
        </div>
        <label className="field">
          <span>Category</span>
          <select className="select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as 'all' | CategoryId)}>
            <option value="all">All categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        {draft && (
          <div className="card stack" style={{ gap: 12 }}>
            <div className="row between"><h3>Edit vendor</h3><button className="btn btn-text" onClick={() => setDraft(null)}>Close</button></div>
            <Field id="origName" label="Original company name"><input id="origName" className="input" value={draft.originalCompanyName} readOnly /></Field>
            <Field id="displayName" label="Display name"><input id="displayName" className="input" value={draft.displayName} onChange={e => setDraft({ ...draft, displayName: e.target.value })} /></Field>
            <Field id="serviceName" label="Service name"><input id="serviceName" className="input" value={draft.serviceName} onChange={e => setDraft({ ...draft, serviceName: e.target.value })} /></Field>
            <Field id="desc" label="Description"><textarea id="desc" className="textarea" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></Field>
            <Field id="locations" label="Supported locations"><input id="locations" className="input" value={draft.supportedLocations.join(', ')} onChange={e => setDraft({ ...draft, supportedLocations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></Field>
            <Field id="demoPrice" label="Demo price"><input id="demoPrice" className="input" value={draft.demoPrice ?? ''} onChange={e => setDraft({ ...draft, demoPrice: e.target.value || undefined, priceLabel: e.target.value ? 'Demo price' : 'Price to be confirmed by provider.' })} /></Field>
            <Field id="url" label="Official URL"><input id="url" className="input" value={draft.externalUrl ?? ''} onChange={e => setDraft({ ...draft, externalUrl: e.target.value || undefined })} /></Field>
            <Field id="category" label="Category">
              <select id="category" className="select" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value as CategoryId })}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <div className="row between">
              <label className="row" style={{ gap: 8 }}><input type="checkbox" checked={draft.isActive} onChange={e => setDraft({ ...draft, isActive: e.target.checked })} /> Active</label>
              <button className="btn btn-primary" onClick={saveDraft}>Save</button>
            </div>
          </div>
        )}

        <div className="stack">
          {filtered.length === 0 ? <Empty title="No vendors match" text="Try another search or category." /> : filtered.map(v => (
            <div key={v.id} className="card stack" style={{ gap: 10 }}>
              <div className="row between"><div><b>{v.displayName}</b><div className="small muted">{v.originalCompanyName !== v.displayName ? `Original: ${v.originalCompanyName}` : v.serviceName}</div></div><span className={'badge' + (v.isActive ? '' : ' warn')}>{v.isActive ? 'Active' : 'Inactive'}</span></div>
              <div className="small muted">{v.serviceName}</div>
              <div className="badges"><span className="badge line">{v.category}</span><span className="badge line">{v.listingType}</span>{v.integrationStatus && <span className="badge line">{v.integrationStatus}</span>}</div>
              <div className="small muted">{v.description}</div>
              <div className="row between">
                <button className="btn btn-ghost btn-sm" onClick={() => beginEdit(v)}>Edit</button>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(v.id)}>{v.isActive ? 'Deactivate' : 'Activate'}</button>
              </div>
            </div>
          ))}
        </div>
      </Screen>
    </>
  )
}

/* ---------- Family ---------- */
const RELATIONS = ['Mother', 'Father', 'Spouse', 'Sibling', 'Grandparent', 'Aunt or uncle', 'Other']
export function FamilyList() {
  const nav = useNavigate(); const { family, selectedMember, setSelectedMember, say } = useStore()
  return (
    <>
      <TopBar title="Family" right={<button className="iconbtn" aria-label="Add family member" onClick={() => nav('/family/new')}><Plus /></button>} />
      <Screen>
        <p className="muted">Choose who you are arranging help for. Sample people only.</p>
        {family.length === 0 ? <Empty title="No family members yet" text="Add the people you arrange help for." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/family/new')}>Add family member</button>} /> :
          family.map(m => (
            <div key={m.id} className="card row">
              <div className="avatar">{initials(m.name)}</div>
              <div className="grow"><b>{m.name}</b><div className="small muted">{m.relation} · {m.city}</div>{selectedMember === m.id && <span className="badge dark" style={{ marginTop: 4 }}>Selected for requests</span>}</div>
              <button className="iconbtn" aria-label={`Edit ${m.name}`} onClick={() => nav('/family/' + m.id)}><Pencil size={20} /></button>
              {selectedMember !== m.id && <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedMember(m.id); say(m.name + ' selected') }}>Select</button>}
            </div>))}
      </Screen>
    </>
  )
}

export function FamilyForm() {
  const { id } = useParams(); const nav = useNavigate(); const { family, saveMember, removeMember, say } = useStore()
  const editing = family.find(m => m.id === id)
  const [f, setF] = useState<FamilyMember>(editing ?? { id: 'm' + Date.now(), name: '', relation: '', phone: '', city: '', notes: '' })
  const [tried, setTried] = useState(false); const [ask, setAsk] = useState(false)
  const e = { name: f.name.trim().length < 2 ? 'Enter a name' : '', relation: f.relation ? '' : 'Choose a relationship', phone: /^\+?[0-9 ()-]{8,18}$/.test(f.phone.trim()) ? '' : 'Enter a valid phone number', city: f.city.trim() ? '' : 'Enter a city' }
  const bad = Object.values(e).some(Boolean); const s = (p: Partial<FamilyMember>) => setF({ ...f, ...p })
  return (
    <>
      <TopBar title={editing ? 'Edit family member' : 'Add family member'} />
      <Screen>
        <ProtoBanner>Use fictional details in this prototype.</ProtoBanner>
        <Field id="fname" label="Full name" error={tried ? e.name : ''}><input id="fname" className={'input' + (tried && e.name ? ' err' : '')} value={f.name} onChange={x => s({ name: x.target.value })} /></Field>
        <Field id="rel" label="Relationship" error={tried ? e.relation : ''}><select id="rel" className={'select' + (tried && e.relation ? ' err' : '')} value={f.relation} onChange={x => s({ relation: x.target.value })}><option value="">Choose one</option>{RELATIONS.map(r => <option key={r}>{r}</option>)}</select></Field>
        <Field id="ph" label="Phone number" error={tried ? e.phone : ''}><input id="ph" className={'input' + (tried && e.phone ? ' err' : '')} inputMode="tel" value={f.phone} onChange={x => s({ phone: x.target.value })} /></Field>
        <Field id="fc" label="City" error={tried ? e.city : ''}><input id="fc" className={'input' + (tried && e.city ? ' err' : '')} value={f.city} onChange={x => s({ city: x.target.value })} /></Field>
        <Field id="fn" label="Notes (optional)"><textarea id="fn" className="textarea" style={{ minHeight: 72 }} value={f.notes} onChange={x => s({ notes: x.target.value })} /></Field>
        <div className="stack" style={{ marginTop: 'auto' }}>
          <button className="btn btn-primary" onClick={() => { setTried(true); if (bad) return; saveMember({ ...f, name: f.name.trim() }); say('Family member saved'); nav(-1) }}>Save</button>
          {editing && <button className="btn btn-danger" onClick={() => setAsk(true)}><Trash2 size={18} />Remove</button>}
        </div>
      </Screen>
      {ask && <Sheet title={`Remove ${f.name}?`} onClose={() => setAsk(false)}>
        <p className="muted">Existing requests keep their details.</p>
        <button className="btn btn-danger" onClick={() => { removeMember(f.id); say('Removed'); nav('/family', { replace: true }) }}>Remove</button>
        <button className="btn btn-ghost" onClick={() => setAsk(false)}>Keep</button></Sheet>}
    </>
  )
}

/* ---------- Addresses ---------- */
export function AddressList() {
  const nav = useNavigate(); const { addresses } = useStore()
  return (
    <>
      <TopBar title="Saved addresses" right={<button className="iconbtn" aria-label="Add address" onClick={() => nav('/addresses/new')}><Plus /></button>} />
      <Screen>
        {addresses.length === 0 ? <Empty icon={<MapPin />} title="No saved addresses" text="Add your parents’ home or any place where service is needed." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/addresses/new')}>Add address</button>} /> :
          addresses.map(a => (
            <div key={a.id} className="card row"><span className="icobox"><MapPin /></span>
              <div className="grow"><b>{a.label}</b><div className="small muted">{a.line}, {a.city} {a.pin}</div></div>
              <button className="iconbtn" aria-label={`Edit ${a.label}`} onClick={() => nav('/addresses/' + a.id)}><Pencil size={20} /></button></div>))}
      </Screen>
    </>
  )
}

const LABELS = ['Home', "Parents' Home", 'Other']
export function AddressForm() {
  const { id } = useParams(); const nav = useNavigate(); const { addresses, saveAddress, removeAddress, say } = useStore()
  const editing = addresses.find(a => a.id === id)
  const [f, setF] = useState<Address>(editing ?? { id: 'a' + Date.now(), label: '', line: '', city: '', pin: '' })
  const [tried, setTried] = useState(false); const [ask, setAsk] = useState(false); const s = (p: Partial<Address>) => setF({ ...f, ...p })
  const e = { label: f.label.trim() ? '' : 'Give this address a label', line: f.line.trim().length < 5 ? 'Enter the street address' : '', city: f.city.trim() ? '' : 'Enter a city', pin: /^[1-9][0-9]{5}$/.test(f.pin) ? '' : 'Enter a 6-digit postal code' }
  const bad = Object.values(e).some(Boolean)
  return (
    <>
      <TopBar title={editing ? 'Edit address' : 'Add address'} />
      <Screen>
        <div className="stack"><b style={{ fontSize: 14 }}>Label</b>
          <div className="chips" style={{ flexWrap: 'wrap', overflow: 'visible', margin: 0, padding: 0 }}>{LABELS.map(l => <button key={l} className={'chip' + (f.label === l ? ' on' : '')} onClick={() => s({ label: l })}>{l}</button>)}</div>
          <input className={'input' + (tried && e.label ? ' err' : '')} aria-label="Custom label" placeholder="Or type your own" value={f.label} onChange={x => s({ label: x.target.value })} />
          {tried && e.label && <span className="errtxt" role="alert">{e.label}</span>}</div>
        <Field id="line" label="Street address" error={tried ? e.line : ''}><textarea id="line" className={'textarea' + (tried && e.line ? ' err' : '')} style={{ minHeight: 72 }} value={f.line} onChange={x => s({ line: x.target.value })} /></Field>
        <Field id="city" label="City" error={tried ? e.city : ''}><input id="city" className={'input' + (tried && e.city ? ' err' : '')} value={f.city} onChange={x => s({ city: x.target.value })} /></Field>
        <Field id="pin" label="Postal code" error={tried ? e.pin : ''}><input id="pin" className={'input' + (tried && e.pin ? ' err' : '')} inputMode="numeric" maxLength={6} value={f.pin} onChange={x => s({ pin: x.target.value.replace(/\D/g, '') })} /></Field>
        <div className="stack" style={{ marginTop: 'auto' }}>
          <button className="btn btn-primary" onClick={() => { setTried(true); if (bad) return; saveAddress({ ...f, label: f.label.trim() }); say('Address saved'); nav(-1) }}>Save address</button>
          {editing && <button className="btn btn-danger" onClick={() => setAsk(true)}><Trash2 size={18} />Remove</button>}
        </div>
      </Screen>
      {ask && <Sheet title="Remove this address?" onClose={() => setAsk(false)}>
        <button className="btn btn-danger" onClick={() => { removeAddress(f.id); say('Removed'); nav('/addresses', { replace: true }) }}>Remove</button>
        <button className="btn btn-ghost" onClick={() => setAsk(false)}>Keep</button></Sheet>}
    </>
  )
}
