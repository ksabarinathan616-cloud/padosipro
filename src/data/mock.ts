// ALL DATA IN THIS FILE IS FICTIONAL PROTOTYPE DATA. Replace with real data when a backend exists.

export type FamilyMember = { id: string; name: string; relation: string; phone: string; city: string; notes: string }
export type Address = { id: string; label: string; line: string; city: string; pin: string }
export type BookingStatus = 'submitted' | 'awaiting' | 'quotation' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
export type Booking = {
  id: string; ref: string; vendorId: string; vendorName: string; categoryId: string
  need: string; description: string; notes: string
  memberId: string; addressId: string; date: string; time: string
  status: BookingStatus; createdAt: string; sample: boolean
}
export type Notice = { id: string; title: string; body: string; at: string; read: boolean; bookingId?: string }

export const STATUS_FLOW: BookingStatus[] = ['submitted', 'awaiting', 'quotation', 'scheduled', 'in_progress', 'completed']
export const STATUS_LABEL: Record<BookingStatus, string> = {
  submitted: 'Request submitted',
  awaiting: 'Awaiting payment',
  quotation: 'Payment pending verification',
  scheduled: 'Awaiting provider confirmation',
  in_progress: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const SEED_FAMILY: FamilyMember[] = [
  { id: 'm1', name: 'Sample Parent One', relation: 'Mother', phone: '+91 90000 00001', city: 'Hyderabad', notes: 'Sample record' },
  { id: 'm2', name: 'Sample Parent Two', relation: 'Father', phone: '+91 90000 00002', city: 'Hyderabad', notes: 'Sample record' },
  { id: 'm3', name: 'Sample Relative', relation: 'Aunt', phone: '+91 90000 00003', city: 'Mumbai', notes: 'Sample record' },
]
export const SEED_ADDRESSES: Address[] = [
  { id: 'a1', label: "Parents' Home", line: 'Flat 101, Sample Apartments, Sample Road', city: 'Hyderabad', pin: '500001' },
  { id: 'a2', label: 'Aunt’s Home', line: 'Sample Society, Sample Lane', city: 'Mumbai', pin: '400001' },
]
const base = { notes: '', createdAt: '2026-10-01', sample: true }
export const SEED_BOOKINGS: Booking[] = [
  { ...base, id: 's1', ref: 'SAMPLE-1001', vendorId: 'sahaayak', vendorName: 'Sahaayak', categoryId: 'elder-care', need: 'Companionship visit', description: 'Weekly visit to keep company and check in.', memberId: 'm1', addressId: 'a1', date: '2026-10-14', time: 'Morning', status: 'scheduled' },
  { ...base, id: 's2', ref: 'SAMPLE-1002', vendorId: 'hometriangle', vendorName: 'HomeTriangle', categoryId: 'home-maintenance', need: 'Plumbing', description: 'Kitchen tap leaking.', memberId: 'm2', addressId: 'a1', date: '2026-10-16', time: 'Afternoon', status: 'quotation' },
  { ...base, id: 's3', ref: 'SAMPLE-1003', vendorId: 'mediworld-pharmacy', vendorName: 'MediWorld Pharmacy', categoryId: 'pharmacy', need: 'Monthly refill', description: 'Monthly refill of regular medicines.', memberId: 'm1', addressId: 'a1', date: '2026-09-28', time: 'Morning', status: 'completed' },
  { ...base, id: 's4', ref: 'SAMPLE-1004', vendorId: 'hicare-rentokil-pci', vendorName: 'HiCare / Rentokil PCI', categoryId: 'cleaning-pest', need: 'General pest control', description: 'Annual pest control.', memberId: 'm3', addressId: 'a2', date: '2026-09-20', time: 'Morning', status: 'cancelled' },
]
export const SEED_NOTICES: Notice[] = [
  { id: 'n1', title: 'Sample: quotation needed', body: 'HomeTriangle needs to inspect before sharing a quote. (Simulated update)', at: 'Today', read: false, bookingId: 's2' },
  { id: 'n2', title: 'Sample: visit scheduled', body: 'Your Sahaayak visit is set for 14 Oct, morning. (Simulated update)', at: 'Yesterday', read: false, bookingId: 's1' },
  { id: 'n3', title: 'Sample reminder', body: 'Monthly medicine refill is due around 28 Oct. (Simulated reminder)', at: '2 days ago', read: true },
]

export const FAQS = [
  { q: 'Who actually does the work?', a: 'PadosiPro connects you with third-party service providers. The provider you choose carries out the service. PadosiPro does not operate every service itself.' },
  { q: 'Do I pay a price shown in the app?', a: 'In this prototype demo prices are shown only when explicitly configured. Otherwise the app shows “Price to be confirmed by provider.”' },
  { q: 'What does “Affiliate link” mean?', a: 'It opens the provider’s own website. You book and pay there. Tracking is not implemented in this prototype.' },
  { q: 'Is this a real booking?', a: 'No. This is a prototype. Requests, payments and updates are simulated on your device only.' },
  { q: 'Is a provider available in my parents’ city?', a: 'Availability is to be confirmed. The cities shown come from project information and are not verified with the provider.' },
]
export const ISSUE_TYPES = ['A request I made', 'A provider', 'Payment question', 'My family or address details', 'Something else']
