import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Bell, ChevronRight, ExternalLink, GitCompare, HeadphonesIcon, History, MapPin, Plus, Search as SearchIcon, SlidersHorizontal, Users, X } from 'lucide-react'
import { CATEGORIES, GROUPS, catById } from '../data/categories'
import { CITIES, getVendors, vendorById, type Vendor } from '../data/vendors'
import { STATUS_LABEL } from '../data/mock'
import { CatIcon, Empty, Radio, Screen, Sheet, TopBar, ProtoBanner, initials } from '../components/ui'
import { useStore } from '../state/store'

/* ---------- shared bits ---------- */
export function RelBadge({ v }: { v: Vendor }) {
  return v.relationship === 'affiliate'
    ? <span className="badge line">Affiliate / external</span>
    : <span className="badge">{v.founderStatus === 'Agreed' ? 'Partner: agreed' : 'Partner: collaborating'}</span>
}
const areaText = (v: Vendor) => (v.areas.length ? v.areas.join(', ') : 'Areas not listed')

export function VendorCard({ v, compare }: { v: Vendor; compare?: boolean }) {
  const nav = useNavigate(); const { compare: cmp, toggleCompare } = useStore(); const on = cmp.includes(v.id)
  const priceText = v.demoPrice || 'Price to be confirmed by provider.'
  const listingText = v.listingType || (v.relationship === 'affiliate' ? 'Affiliate / external' : 'Demo listing')
  return (
    <div className="card stack" style={{ gap: 12 }}>
      <button className="row" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', alignItems: 'flex-start' }} onClick={() => nav('/vendor/' + v.id)}>
        <div className="avatar" style={{ borderRadius: 14, background: 'var(--green-15)', color: 'var(--teal)' }} aria-hidden>{initials(v.name)}</div>
        <div className="grow stack" style={{ gap: 4 }}>
          <h3>{v.name}</h3>
          <span className="small muted">{v.service}</span>
          <div className="badges"><RelBadge v={v} />{listingText && <span className="badge line">{listingText}</span>}</div>
        </div>
        <ChevronRight size={20} className="muted" aria-hidden />
      </button>
      <div className="small muted row" style={{ gap: 6 }}><MapPin size={14} aria-hidden />{v.relationship === 'affiliate' ? 'Online listing. Coverage is shown on the provider site.' : areaText(v)}</div>
      <div className="row between" style={{ alignItems: 'center', gap: 8 }}>
        <span className="small"><b>{priceText}</b></span>
        {compare && v.relationship === 'collaboration' && (
          <button className={'chip' + (on ? ' on' : '')} style={{ minHeight: 36 }} onClick={() => toggleCompare(v.id)} aria-pressed={on}>{on ? 'Added' : 'Compare'}</button>
        )}
      </div>
    </div>
  )
}

/* ---------- Home ---------- */
export function HomeScreen() {
  const nav = useNavigate(); const { family, selectedMember, setSelectedMember, bookings, notices } = useStore()
  const [pick, setPick] = useState(false)
  const member = family.find(m => m.id === selectedMember)
  const upcoming = bookings.filter(b => ['submitted', 'awaiting', 'quotation', 'scheduled', 'in_progress'].includes(b.status)).slice(0, 2)
  const unread = notices.filter(n => !n.read).length
  const t = { arranging: 'Arranging help for', change: 'Change', search: 'What do you need help with?', services: 'Services', all: 'See all', requests: 'Your requests', noOpen: 'No open requests', noOpenText: 'When you request a service it shows up here.', manage: 'Manage', family: 'Family', addresses: 'Addresses', needHand: 'Need a hand?', support: 'Help and support', addFamily: 'Add family member' }
  return (
    <Screen nav>
      <div className="row between home-welcome">
        <div className="stack" style={{ gap: 6 }}>
          <span className="welcome-eyebrow home-eyebrow">Your family, thoughtfully cared for</span>
          <h1>Welcome to PadosiPro</h1>
          <p className="muted">Premium support for your family, home and everyday needs.</p>
        </div>
        <button className="iconbtn" aria-label={unread ? `Alerts, ${unread} unread` : 'Alerts'} onClick={() => nav('/notifications')}><Bell />{unread > 0 && <span className="dot" />}</button>
      </div>
      <button className="card tint row" onClick={() => setPick(true)} aria-label="Change who you are arranging help for">
        <div className="avatar">{member ? initials(member.name) : '?'}</div>
        <div className="grow"><div className="small muted">{t.arranging}</div><b>{member ? `${member.name} (${member.relation})` : 'Add a family member'}</b></div>
        <span className="small" style={{ color: 'var(--teal)', fontWeight: 600 }}>{t.change}</span>
      </button>
      <button className="searchbox" onClick={() => nav('/search')} aria-label="Search services and providers"><SearchIcon size={20} className="muted" /><span className="muted">{t.search}</span></button>
      <section className="stack">
        <div className="row between"><h2>{t.services}</h2><button className="btn btn-text" onClick={() => nav('/services')}>{t.all}</button></div>
        <div className="category-grid">
          {CATEGORIES.map(c => { const id = c.id; return <button key={id} className="category-card" onClick={() => nav('/services/' + id)}>
            <img src={c.image} alt={c.name} />
            <div className="category-card__content">
              <span>{c.name}</span>
              <small>{c.blurb}</small>
            </div>
          </button> })}
        </div>
      </section>
      <section className="stack">
        <h2>{t.requests}</h2>
        {upcoming.length === 0 ? <Empty title={t.noOpen} text={t.noOpenText} /> : upcoming.map(b => (
          <button key={b.id} className="card row" onClick={() => nav('/bookings/' + b.id)}>
            <div className="grow"><b>{b.vendorName}</b><div className="small muted">{b.need}</div></div>
            <span className="badge">{STATUS_LABEL[b.status]}</span>
          </button>
        ))}
        <span className="tiny muted">Statuses are simulated for the prototype.</span>
      </section>
      <section className="stack">
        <h2>{t.manage}</h2>
        <div className="grid3" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <button className="card row" onClick={() => nav('/family')}><Users size={20} /><b>{t.family}</b></button>
          <button className="card row" onClick={() => nav('/addresses')}><MapPin size={20} /><b>{t.addresses}</b></button>
        </div>
        <button className="card dark row" onClick={() => nav('/support')}><HeadphonesIcon /><div className="grow"><b>{t.needHand}</b><div className="small" style={{ color: 'var(--green-30)' }}>{t.support}</div></div><ChevronRight /></button>
      </section>
      {pick && (
        <Sheet title="Who is this for?" onClose={() => setPick(false)}>
          {family.map(m => (
            <button key={m.id} className={'opt' + (m.id === selectedMember ? ' on' : '')} onClick={() => { setSelectedMember(m.id); setPick(false) }}>
              <div className="avatar sm">{initials(m.name)}</div><div className="grow"><b>{m.name}</b><div className="small muted">{m.relation} · {m.city}</div></div><Radio on={m.id === selectedMember} />
            </button>
          ))}
          <button className="btn btn-ghost" onClick={() => nav('/family/new')}><Plus size={18} />{t.addFamily}</button>
        </Sheet>
      )}
    </Screen>
  )
}

/* ---------- Services catalogue ---------- */
function CategoryGalleryCard({ category, onClick }: { category: typeof CATEGORIES[number]; onClick: () => void }) {
  return (
    <button className="service-card" onClick={onClick} aria-label={`Open ${category.name}`}>
      <img src={category.image} alt={category.name} loading="lazy" />
      <div className="service-card__overlay" />
      <div className="service-card__content">
        <span className="service-card__heading">{category.name}</span>
        <span className="service-card__meta">From ₹499 · Demo price</span>
      </div>
    </button>
  )
}

export function Services() {
  const nav = useNavigate()
  return (
    <>
      <TopBar title="Services" back={false} />
      <Screen nav>
        <button className="searchbox" onClick={() => nav('/search')}><SearchIcon size={20} className="muted" /><span className="muted">Search services or providers</span></button>
        {GROUPS.map(g => (
          <section key={g} className="stack">
            <h3>{g}</h3>
            <div className="service-list-grid">
              {CATEGORIES.filter(c => c.group === g).map(c => (
                <CategoryGalleryCard key={c.id} category={c} onClick={() => nav('/services/' + c.id)} />
              ))}
            </div>
          </section>
        ))}
      </Screen>
    </>
  )
}

/* ---------- Filtering / sorting (shared by category + search) ---------- */
type Filters = { rel: 'all' | 'collaboration' | 'affiliate'; city: string; sort: 'name' | 'partners'; }
const defaultFilters: Filters = { rel: 'all', city: '', sort: 'partners' }
function applyFilters(list: Vendor[], f: Filters) {
  let out = list.filter(v => (f.rel === 'all' || v.relationship === f.rel) && (!f.city || v.areas.includes(f.city)))
  out = [...out].sort((a, b) => f.sort === 'name' ? a.name.localeCompare(b.name)
    : (a.relationship === b.relationship ? a.name.localeCompare(b.name) : a.relationship === 'collaboration' ? -1 : 1))
  return out
}
function FilterSheet({ f, set, onClose }: { f: Filters; set: (f: Filters) => void; onClose: () => void }) {
  return (
    <Sheet title="Filter and sort" onClose={onClose}>
      <div className="stack"><h3>Provider type</h3>
        <div className="chips" style={{ flexWrap: 'wrap', overflow: 'visible' }}>
          {([['all', 'All'], ['collaboration', 'Partners'], ['affiliate', 'Affiliate links']] as const).map(([k, l]) => <button key={k} className={'chip' + (f.rel === k ? ' on' : '')} onClick={() => set({ ...f, rel: k, city: k === 'affiliate' ? '' : f.city })}>{l}</button>)}
        </div>
      </div>
      <div className="stack"><h3>City</h3>
        <div className="chips" style={{ flexWrap: 'wrap', overflow: 'visible' }}>
          <button className={'chip' + (!f.city ? ' on' : '')} onClick={() => set({ ...f, city: '' })}>Any</button>
          {CITIES.map(c => <button key={c} className={'chip' + (f.city === c ? ' on' : '')} onClick={() => set({ ...f, city: c, rel: f.rel === 'affiliate' ? 'all' : f.rel })}>{c}</button>)}
        </div>
        <span className="hint">Cities come from project information and are not verified with providers.</span>
      </div>
      <div className="stack"><h3>Price</h3><p className="small muted">Demo prices are shown only when explicitly configured. Otherwise the app shows “Price to be confirmed by provider.”</p></div>
      <div className="stack"><h3>Sort by</h3>
        <div className="chips" style={{ flexWrap: 'wrap', overflow: 'visible' }}>
          <button className={'chip' + (f.sort === 'partners' ? ' on' : '')} onClick={() => set({ ...f, sort: 'partners' })}>Partners first</button>
          <button className={'chip' + (f.sort === 'name' ? ' on' : '')} onClick={() => set({ ...f, sort: 'name' })}>Name A–Z</button>
        </div>
      </div>
      <div className="row"><button className="btn btn-ghost" onClick={() => set(defaultFilters)}>Reset</button><button className="btn btn-primary" onClick={onClose}>Show results</button></div>
    </Sheet>
  )
}
const activeCount = (f: Filters) => (f.rel !== 'all' ? 1 : 0) + (f.city ? 1 : 0) + (f.sort !== 'partners' ? 1 : 0)

/* ---------- Category vendor list ---------- */
export function CategoryScreen() {
  const { id = '' } = useParams(); const nav = useNavigate(); const { compare } = useStore()
  const cat = CATEGORIES.find(c => c.id === id)
  const [f, setF] = useState<Filters>(defaultFilters); const [open, setOpen] = useState(false)
  const list = useMemo(() => applyFilters(getVendors().filter(v => v.categories.includes(id as never)), f), [id, f])
  if (!cat) return <><TopBar title="Not found" /><Screen><Empty title="We could not find that category" text="Go back to the service list and pick another." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/services')}>All services</button>} /></Screen></>
  return (
    <>
      <TopBar title={cat.name} back="/services" right={<button className="iconbtn" aria-label="Filter and sort" onClick={() => setOpen(true)}><SlidersHorizontal />{activeCount(f) > 0 && <span className="dot" />}</button>} />
      <Screen nav={compare.length > 0}>
        <p className="muted">{cat.blurb}</p>
        <ProtoBanner>Provider details, prices and availability are not verified yet. Partner status comes from project information.</ProtoBanner>
        {list.length === 0 ? <Empty title="No providers match" text="Try clearing the filters." action={<button className="btn btn-ghost btn-sm" onClick={() => setF(defaultFilters)}>Clear filters</button>} />
          : list.map(v => <VendorCard key={v.id} v={v} compare />)}
        {compare.length > 0 && (
          <button className="btn btn-dark" style={{ position: 'sticky', bottom: 16 }} onClick={() => nav('/compare')} disabled={compare.length < 2}>
            <GitCompare size={18} />{compare.length < 2 ? 'Pick one more to compare' : `Compare ${compare.length} providers`}
          </button>
        )}
      </Screen>
      {open && <FilterSheet f={f} set={setF} onClose={() => setOpen(false)} />}
    </>
  )
}

/* ---------- Compare ---------- */
export function Compare() {
  const nav = useNavigate(); const { compare, clearCompare, toggleCompare } = useStore()
  const list = compare.map(vendorById).filter(Boolean) as Vendor[]
  return (
    <>
      <TopBar title="Compare" right={list.length > 0 ? <button className="btn btn-text" onClick={() => { clearCompare(); nav(-1) }}>Clear</button> : undefined} />
      <Screen>
        {list.length < 2 ? <Empty title="Pick two or three providers" text="Open a service and tap Compare on the providers you like." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/services')}>Browse services</button>} /> : (
          <>
            <div style={{ overflowX: 'auto', margin: '0 -20px', padding: '0 20px' }}>
              <table style={{ borderCollapse: 'collapse', minWidth: 330, width: '100%', fontSize: 14 }}>
                <thead><tr><th style={{ width: 90 }} />{list.map(v => <th key={v.id} style={{ textAlign: 'left', padding: '0 8px 10px', color: 'var(--teal)', verticalAlign: 'top' }}>{v.name}<br /><button className="btn btn-text" style={{ minHeight: 28, padding: 0, fontSize: 12 }} onClick={() => toggleCompare(v.id)}>Remove</button></th>)}</tr></thead>
                <tbody>
                  {([
                    ['Service', (v: Vendor) => v.service], ['Type', (v: Vendor) => v.founderStatus === 'Agreed' ? 'Partner: agreed' : 'Partner: collaborating'],
                    ['Areas', areaText], ['Price', () => 'Price to be confirmed by provider.'], ['Availability', () => 'To be confirmed'], ['Website', (v: Vendor) => v.website ? 'Listed' : 'To be added'],
                  ] as [string, (v: Vendor) => string][]).map(([k, fn]) => (
                    <tr key={k} style={{ borderTop: '1px solid var(--line)' }}><td className="muted" style={{ padding: '10px 0', verticalAlign: 'top' }}>{k}</td>{list.map(v => <td key={v.id} style={{ padding: '10px 8px', verticalAlign: 'top' }}>{fn(v)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted">Comparison is limited to what is known. Nothing here is a verified price, rating or review.</p>
          </>
        )}
      </Screen>
    </>
  )
}

/* ---------- Search ---------- */
const SUGGEST = ['Elder care', 'Medicine refill', 'Plumbing', 'Maid', 'Puja', 'Groceries', 'Storage']
export function SearchScreen() {
  const nav = useNavigate(); const { recent, addRecent, clearRecent } = useStore()
  const [params, setParams] = useSearchParams(); const q = params.get('q') ?? ''
  const [text, setText] = useState(q); const [f, setF] = useState<Filters>(defaultFilters); const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'done'>('idle')
  useEffect(() => {
    if (!q) { setState('idle'); return }
    setState('loading'); const t = window.setTimeout(() => setState(q.toLowerCase() === 'error' ? 'error' : 'done'), 350); return () => window.clearTimeout(t)
  }, [q])
  const run = (s: string) => { const t = s.trim(); setText(t); setParams(t ? { q: t } : {}); if (t) addRecent(t) }
  const results = useMemo(() => {
    const t = q.toLowerCase(); if (!t) return { cats: [], vendors: [] }
    const cats = CATEGORIES.filter(c => (c.name + ' ' + c.blurb).toLowerCase().includes(t))
    const vs = getVendors().filter(v => (v.name + ' ' + v.service + ' ' + v.categories.map(c => catById(c).name).join(' ')).toLowerCase().includes(t) || v.categories.some(c => cats.some(cc => cc.id === c)))
    return { cats, vendors: applyFilters(vs, f) }
  }, [q, f])
  return (
    <>
      <TopBar title="Search" back="/home" />
      <Screen>
        <form className="row" onSubmit={e => { e.preventDefault(); run(text) }}>
          <label className="searchbox grow"><SearchIcon size={20} className="muted" /><input autoFocus value={text} onChange={e => setText(e.target.value)} placeholder="What do you need help with?" aria-label="Search" enterKeyHint="search" />{text && <button type="button" className="iconbtn" style={{ width: 32, height: 32 }} aria-label="Clear" onClick={() => run('')}><X size={18} /></button>}</label>
          <button type="button" className="iconbtn" aria-label="Filter and sort" onClick={() => setOpen(true)}><SlidersHorizontal />{activeCount(f) > 0 && <span className="dot" />}</button>
        </form>
        {!q && (
          <>
            {recent.length > 0 && <section className="stack"><div className="row between"><h3>Recent</h3><button className="btn btn-text" onClick={clearRecent}>Clear</button></div>
              {recent.map(r => <button key={r} className="row" style={{ background: 'none', border: 0, padding: '6px 0', cursor: 'pointer', fontSize: 16 }} onClick={() => run(r)}><History size={18} className="muted" />{r}</button>)}</section>}
            <section className="stack"><h3>Try searching for</h3><div className="badges">{SUGGEST.map(s => <button key={s} className="chip" onClick={() => run(s)}>{s}</button>)}</div></section>
          </>
        )}
        {state === 'loading' && <div className="stack"><div className="skel" /><div className="skel" /></div>}
        {state === 'error' && <Empty title="Search did not load" text="This is a demo of the error state. Try another search." action={<button className="btn btn-primary btn-sm" onClick={() => run('care')}>Try “care”</button>} />}
        {state === 'done' && (results.cats.length + results.vendors.length === 0
          ? <Empty icon={<SearchIcon />} title={`No results for “${q}”`} text="Check the spelling or try a broader word like “care” or “home”." action={<button className="btn btn-ghost btn-sm" onClick={() => nav('/services')}>Browse all services</button>} />
          : <>
            {results.cats.length > 0 && <section className="stack"><h3>Categories</h3>{results.cats.map(c => <button key={c.id} className="card row" onClick={() => nav('/services/' + c.id)}><span className="icobox"><CatIcon name={c.icon} /></span><b className="grow">{c.name}</b><ChevronRight size={20} className="muted" /></button>)}</section>}
            {results.vendors.length > 0 && <section className="stack"><h3>Providers ({results.vendors.length})</h3>{results.vendors.map(v => <VendorCard key={v.id} v={v} />)}</section>}
          </>)}
      </Screen>
      {open && <FilterSheet f={f} set={setF} onClose={() => setOpen(false)} />}
    </>
  )
}

/* ---------- Vendor details ---------- */
export function VendorDetail() {
  const { id = '' } = useParams(); const nav = useNavigate(); const { setDraft, selectedMember, user } = useStore()
  const v = vendorById(id)
  if (!v) return <><TopBar title="Not found" /><Screen><Empty title="Provider not found" text="It may have been removed." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/services')}>All services</button>} /></Screen></>
  const affiliate = v.relationship === 'affiliate'
  const start = () => { setDraft({ vendorId: v.id, memberId: selectedMember, customerName: user?.name ?? '', customerPhone: user?.contact ?? '' }); nav('/request') }
  const Row = ({ k, children, ok }: { k: string; children: React.ReactNode; ok?: boolean }) => (<><dt>{k}</dt><dd>{children}{ok === false && <span className="badge line" style={{ marginLeft: 6 }}>Unverified</span>}</dd></>)
  const priceText = v.demoPrice || 'Price to be confirmed by provider.'
  const listingText = v.listingType || (affiliate ? 'Affiliate / external' : 'Demo listing')
  const integrationText = v.integrationStatus || 'Integration not connected'
  return (
    <>
      <TopBar title={v.name} />
      <Screen>
        <div className="row"><div className="avatar" style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--green-15)', color: 'var(--teal)', fontSize: 20 }}>{initials(v.name)}</div>
          <div className="stack" style={{ gap: 6 }}><h1 style={{ fontSize: 24 }}>{v.name}</h1><div className="badges"><RelBadge v={v} /><span className="badge line">{listingText}</span>{v.categories.map(c => <span key={c} className="badge line">{catById(c).name}</span>)}</div></div></div>
        <p>{v.description || v.service}.</p>
        <div className="proto"><span /><div>{affiliate
          ? <>This is an <b>affiliate or external listing</b>. The provider is not connected to the app and no live booking or payment integration is in place.</>
          : <>This listing is a <b>{listingText}</b> and is not confirmed by the provider. No agreement or API connection is claimed.</>}</div></div>
        <section className="stack"><h2>Details</h2>
          <dl className="kv" style={{ margin: 0 }}>
            <Row k="Service">{v.service}</Row>
            <Row k="Coverage" ok={false}>{v.areas.length ? v.areas.join(', ') : 'Coverage to be confirmed'}</Row>
            <Row k="Price" ok={false}>{priceText}</Row>
            <Row k="Listing type">{listingText}</Row>
            <Row k="Integration">{integrationText}</Row>
            <Row k="Availability" ok={false}>Availability not confirmed by the provider</Row>
            <Row k="Website">{v.website ? <a href={v.website} target="_blank" rel="noreferrer">{v.website.replace(/^https?:\/\/(www\.)?/, '')}</a> : 'Official website to be added'}</Row>
          </dl>
          <span className="tiny muted">This prototype uses sample data only. Nothing here is a verified booking, contract or API status.</span>
        </section>
        <div className="stack" style={{ marginTop: 'auto' }}>
          {affiliate
            ? <a className="btn btn-primary" href={v.website} target="_blank" rel="noreferrer"><ExternalLink size={18} />Open provider listing</a>
            : <button className="btn btn-primary" onClick={start}>Request this service</button>}
          {!affiliate && v.website && <a className="btn btn-ghost" href={v.website} target="_blank" rel="noreferrer"><ExternalLink size={18} />Official website</a>}
        </div>
      </Screen>
    </>
  )
}
