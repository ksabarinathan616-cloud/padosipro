// Service catalogue. The 17 categories come from the project brief.
// Groups are a UI choice so the catalogue is not one long flat list.
export type CategoryId =
  | 'elder-care' | 'home-maintenance' | 'home-healthcare' | 'pharmacy' | 'maids-cooks'
  | 'grocery' | 'food' | 'cleaning-pest' | 'painting' | 'property' | 'moving-storage'
  | 'transport' | 'puja' | 'travel' | 'safety' | 'education' | 'legal'

export type Category = { id: CategoryId; name: string; blurb: string; icon: string; group: string; image: string }

export const CATEGORIES: Category[] = [
  { id: 'elder-care', name: 'Elder Care', blurb: 'Senior care, companionship and errands', icon: 'heart-handshake', group: 'Care for parents', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80' },
  { id: 'home-healthcare', name: 'Home Healthcare', blurb: 'Care and health services at home', icon: 'stethoscope', group: 'Care for parents', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80' },
  { id: 'pharmacy', name: 'Medicines & Pharmacy', blurb: 'Medicines, refills and doctor access', icon: 'pill', group: 'Care for parents', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80' },
  { id: 'home-maintenance', name: 'Home Maintenance', blurb: 'Repairs and upkeep', icon: 'wrench', group: 'Home & household', image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80' },
  { id: 'maids-cooks', name: 'Maids & Cooks', blurb: 'Domestic help and cooks', icon: 'chef-hat', group: 'Home & household', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80' },
  { id: 'cleaning-pest', name: 'Cleaning & Pest Control', blurb: 'Deep cleaning and pest services', icon: 'spray-can', group: 'Home & household', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
  { id: 'painting', name: 'Painting & Interiors', blurb: 'Painting and home interiors', icon: 'paintbrush', group: 'Home & household', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
  { id: 'property', name: 'Property Management', blurb: 'Property and society management', icon: 'building-2', group: 'Home & household', image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80' },
  { id: 'grocery', name: 'Grocery & Essentials', blurb: 'Restocking and shopping', icon: 'shopping-basket', group: 'Daily essentials', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80' },
  { id: 'food', name: 'Food Delivery', blurb: 'Meal packages and food ordering', icon: 'utensils', group: 'Daily essentials', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80' },
  { id: 'transport', name: 'Transport & Delivery', blurb: 'Couriers and goods transport', icon: 'truck', group: 'Daily essentials', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80' },
  { id: 'moving-storage', name: 'Moving & Storage', blurb: 'Relocation, storage, accommodation', icon: 'package', group: 'Life & occasions', image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80' },
  { id: 'puja', name: 'Puja & Rituals', blurb: 'Puja, flowers, photography, rentals', icon: 'flower-2', group: 'Life & occasions', image: 'https://images.unsplash.com/photo-1602700130310-7d64c69b6f65?auto=format&fit=crop&w=900&q=80' },
  { id: 'travel', name: 'Travel & Accommodation', blurb: 'Hotels, flights, trains, tours, eSIM', icon: 'plane', group: 'Life & occasions', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80' },
  { id: 'safety', name: 'Safety & Security', blurb: 'Personal safety and staff verification', icon: 'shield-check', group: 'Life & occasions', image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=900&q=80' },
  { id: 'education', name: 'Education', blurb: 'Online learning and tutoring', icon: 'graduation-cap', group: 'Learn & advise', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80' },
  { id: 'legal', name: 'Legal, Insurance & Loans', blurb: 'Legal, dispute resolution, insurance', icon: 'scale', group: 'Learn & advise', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80' },
]
export const GROUPS = Array.from(new Set(CATEGORIES.map(c => c.group)))
export const catById = (id: string) => CATEGORIES.find(c => c.id === id)!
