export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export type Metric = {
  label: string
  value: string
  delta: string
  tone: StatusTone
  icon: string
}

export type ListingRow = {
  title: string
  category: string
  city: string
  owner: string
  status: string
  tone: StatusTone
  updatedAt: string
}

export type ContentRow = {
  title: string
  type: string
  status: string
  tone: StatusTone
  author: string
  updatedAt: string
}

export const metrics: Metric[] = [
  { label: 'Published Listings', value: '1,284', delta: '+12.5%', tone: 'success', icon: 'pi pi-building' },
  { label: 'Pending Reviews', value: '42', delta: '8 urgent', tone: 'warning', icon: 'pi pi-clock' },
  { label: 'CMS Posts', value: '318', delta: '+24 this month', tone: 'info', icon: 'pi pi-file-edit' },
  { label: 'Revenue', value: '$18.6k', delta: '+9.2%', tone: 'success', icon: 'pi pi-credit-card' },
]

export const listingRows: ListingRow[] = [
  {
    title: 'Bursa Modern Art Museum',
    category: 'Arts and Culture',
    city: 'Vlore, AL',
    owner: 'Super Admin',
    status: 'Published',
    tone: 'success',
    updatedAt: 'Today',
  },
  {
    title: 'The Gourmet Haven Restaurant',
    category: 'Dining and Restaurants',
    city: 'Tirana, AL',
    owner: 'Client Account',
    status: 'Pending Review',
    tone: 'warning',
    updatedAt: 'Yesterday',
  },
  {
    title: 'Verona Sunny Spa and Beauty',
    category: 'Decorations & Catering',
    city: 'Berlin, DE',
    owner: 'Staff Editor',
    status: 'Draft',
    tone: 'neutral',
    updatedAt: 'May 12',
  },
  {
    title: 'Sunset Grill & Bar Restaurant',
    category: 'Car Rental',
    city: 'Luzern, CH',
    owner: 'Client Account',
    status: 'Rejected',
    tone: 'danger',
    updatedAt: 'May 10',
  },
]

export const contentRows: ContentRow[] = [
  {
    title: 'Diverse Communities: Celebrating the Tapestry of City Life',
    type: 'Blog Post',
    status: 'Published',
    tone: 'success',
    author: 'Super Admin',
    updatedAt: 'Today',
  },
  {
    title: 'About Kukaqka',
    type: 'Page',
    status: 'Published',
    tone: 'success',
    author: 'Staff Editor',
    updatedAt: 'May 12',
  },
  {
    title: 'Business Promotion',
    type: 'Service',
    status: 'Draft',
    tone: 'neutral',
    author: 'Staff Editor',
    updatedAt: 'May 11',
  },
]

export const activityItems = [
  'Super Admin approved Bursa Modern Art Museum',
  'Client Account submitted The Gourmet Haven Restaurant',
  'Staff Editor updated Pricing page SEO',
  'Payment marked paid for Premium plan',
]
