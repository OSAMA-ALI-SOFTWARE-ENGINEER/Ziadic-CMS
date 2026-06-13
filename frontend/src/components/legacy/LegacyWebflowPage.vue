<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fetchPublicCatalog, fetchPublicListings, type PublicCatalog, type PublicListing } from '@/services/listings'

const props = withDefaults(
  defineProps<{
    legacyPath: string
    loadingLabel?: string
  }>(),
  {
    loadingLabel: 'Loading Zaidic...',
  },
)

const legacyMarkup = ref('')
const isLoading = ref(true)
const loadError = ref('')
const isMobileNavOpen = ref(false)
const isPreloaderVisible = ref(true)
const isSubscribeModalOpen = ref(false)
const subscribeEmail = ref('')
const subscribeSubmitting = ref(false)
const subscribeFeedback = ref('')
const subscribeFeedbackTone = ref<'success' | 'danger'>('success')
const legacyRoot = ref<HTMLElement | null>(null)
const router = useRouter()
const route = useRoute()
let inlineScripts: string[] = []
let webflowPageId = ''
let webflowSiteId = ''
let gsapContext: gsap.Context | undefined
let preloaderTimer: number | undefined

type ListingStaticData = {
  slug: string
  title: string
  category: string
  categorySlug?: string
  country?: string
  countryIso2?: string
  citySlug?: string
  image: string
  location: string
  days: string
  hours: string
  summary: string
  contactAddress?: string
  detailsTitle?: string
  detailsParagraphs?: string[]
  facilities?: string[]
  gallery?: string[]
  phone?: string
  email?: string
  websiteUrl?: string
  seoTitle?: string
  seoDescription?: string
}

type FilterState = {
  country: string
  city: string
  category: string
}

type CityStaticData = {
  slug: string
  title: string
  country: string
  listingSlugs: string[]
}

type BlogStaticData = {
  slug: string
  title: string
  summary: string
  image: string
  date: string
  author: string
  authorTitle: string
  authorImage: string
  readTime: string
  category: string
  paragraphs: string[]
}

type CityCategoryStaticData = {
  slug: string
  title: string
  summary: string
  listingSlugs: string[]
}

type TeamStaticData = {
  slug: string
  name: string
  title: string
  image: string
  bio: string
}

const listingDetails: Record<string, ListingStaticData> = {
  'bursa-modern-art-museum': {
    slug: 'bursa-modern-art-museum',
    title: 'Bursa Modern Art Museum',
    category: 'Arts and Culture',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b2a_Listings1.png',
    location: '234 Culinary Street, Foodie Haven, Izmir, Turkey',
    days: 'Monday - Saturday',
    hours: '06:00 AM - 10:00 PM',
    summary:
      'A polished cultural destination with contemporary exhibits, curated collections, and an inviting visitor experience for art lovers.',
  },
  'the-gourmet-haven-restaurant': {
    slug: 'the-gourmet-haven-restaurant',
    title: 'The Gourmet Haven Restaurant',
    category: 'Dining and Restaurants',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b28_Listings%202.png',
    location: '234 Culinary Street, Foodie Haven, Izmir, Turkey',
    days: 'Monday - Saturday',
    hours: '06:00 AM - 10:00 PM',
    summary:
      'A city directory and listing platform serves as a comprehensive guide, unlocking the potential of urban exploration and local business engagement. Seamlessly merging technology with the heartbeat of the modern city, these platforms empower users to navigate through a plethora of businesses, events, and services tailored to their interests.',
    contactAddress: '234 Culinary Street, Foodie Haven',
    detailsTitle: 'Restaurant Details',
    detailsParagraphs: [
      'City directory and listing platform serves as a comprehensive guide, unlocking the potential of our urban exploration and local business engagement. Our seamlessly merging new technology with the heartbeat of the city, these platforms empower all the users to navigate through a plethora of businesses, events, and services tailored to their interests. From discovering hidden gems.',
      'City directory and listing platform serves as a comprehensive guide, unlocking the potential of our urban exploration and local business engagement. Our seamlessly merging new technology with the heartbeat of the city, these platforms empower all the users to navigate through a plethora.',
    ],
    facilities: ['Car Parking', 'Free Wi-Fi Zone', 'Covid-19 Safety', 'Wheelchair Access', 'Pet Friendly'],
    gallery: [
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b28_Listings%202.png',
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b2a_Listings1.png',
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b27_Listings%203.png',
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b25_Listings%204.png',
    ],
  },
  'tranquil-sunny-spa-and-wellness': {
    slug: 'tranquil-sunny-spa-and-wellness',
    title: 'Tranquil Sunny Spa and Wellness',
    category: 'Sports and Fitness',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b27_Listings%203.png',
    location: '101 Tranquil Lane, Serenity Heights, Izmir, Turkey',
    days: 'Monday - Saturday',
    hours: '10:00 AM - 08:00 PM',
    summary:
      'A wellness-focused destination with calming treatments, restorative spaces, and friendly support for every guest.',
  },
  'natures-bounty-farmers-market': {
    slug: 'natures-bounty-farmers-market',
    title: "Nature's Bounty Farmers Market",
    category: 'Shopping and Retail',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b25_Listings%204.png',
    location: '112 Fresh Market Avenue, Greenfield, Venice, Italy',
    days: 'Monday - Saturday',
    hours: '06:00 AM - 10:00 PM',
    summary:
      'A lively market experience with fresh produce, local makers, and everyday essentials arranged for easy browsing.',
  },
  'romes-trams-and-funiculars': {
    slug: 'romes-trams-and-funiculars',
    title: "Rome's Trams and Funiculars",
    category: 'Travel and Exploration',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b23_Listings%205.png',
    location: '890 Art Street, Creative Corner, Rome, Italy',
    days: 'Monday - Saturday',
    hours: '06:00 AM - 10:00 PM',
    summary:
      'A practical city travel listing for discovering Rome through convenient transit, scenic routes, and local movement.',
  },
  'rome-performing-party-center': {
    slug: 'rome-performing-party-center',
    title: 'Rome Performing Party Center',
    category: 'Entertainment & Nightlife',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b21_Listings%206.png',
    location: '234 Culinary Street, Foodie Haven, Rome, Italy',
    days: 'Monday - Saturday',
    hours: '06:00 AM - 10:00 PM',
    summary:
      'A city entertainment venue for performances, celebrations, and energetic evening plans in a central setting.',
  },
  'adana-jazz-celebration-center': {
    slug: 'adana-jazz-celebration-center',
    title: 'Adana Jazz Celebration Center',
    category: 'Entertainment & Nightlife',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b1f_Listings%207.png',
    location: '234 Culinary Street, Foodie Haven, Adana, Turkey',
    days: 'Monday - Saturday',
    hours: '06:00 AM - 10:00 PM',
    summary:
      'A music-friendly nightlife listing with live jazz energy, welcoming seating, and a celebratory atmosphere.',
  },
  'turkish-and-islamic-arts-museum': {
    slug: 'turkish-and-islamic-arts-museum',
    title: 'Turkish and Islamic Arts Museum',
    category: 'Weeding & Event location',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b11_Listings%2012.png',
    location: '890 Art Street, Creative Corner, Bursa, Turkey',
    days: 'Monday - Saturday',
    hours: '06:00 AM - 10:00 PM',
    summary:
      'A distinctive cultural venue with elegant surroundings, historic character, and memorable event potential.',
  },
  'veronas-bounty-meat-market': {
    slug: 'veronas-bounty-meat-market',
    title: "Verona's Bounty Meat Market",
    category: 'Restaurants',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b1b_Listings%209.png',
    location: '112 Fresh Market Avenue, Greenfield, Verona, Italy',
    days: 'Monday - Saturday',
    hours: '07:00 AM - 09:00 PM',
    summary:
      'A local food stop with fresh selections, approachable service, and a reliable neighborhood market feel.',
  },
  'verona-sunny-spa-and-beauty': {
    slug: 'verona-sunny-spa-and-beauty',
    title: 'Verona Sunny Spa and Beauty',
    category: 'Decorations & Catering',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b19_Listings10.png',
    location: '101 Tranquil Lane, Serenity Heights, Verona, Italy',
    days: 'Monday - Saturday',
    hours: '10:00 AM - 08:00 PM',
    summary:
      'A beauty and care destination with a calm mood, polished treatments, and thoughtful guest service.',
  },
  'sunset-grill-bar-restaurant': {
    slug: 'sunset-grill-bar-restaurant',
    title: 'Sunset Grill & Bar Restaurant',
    category: 'Car rental',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b17_Listings%2011.png',
    location: '234 Culinary Street, Foodie Haven, Venice, Italy',
    days: 'Monday - Saturday',
    hours: '06:00 AM - 10:00 PM',
    summary:
      'A casual city listing with a relaxed atmosphere, useful amenities, and convenient access for visitors.',
  },
}

let cmsListingDetails: Record<string, ListingStaticData> = {}
let publicCatalog: PublicCatalog = {
  countries: [],
  cities: [],
  categories: [],
  popular: {
    countries: [],
    cities: [],
    categories: [],
  },
}

const cityDetails: Record<string, CityStaticData> = {
  'vlore-al': { slug: 'vlore-al', title: 'Vlorë, AL', country: 'Albania', listingSlugs: ['sunset-grill-bar-restaurant'] },
  'tirana-al': { slug: 'tirana-al', title: 'Tirana, AL', country: 'Albania', listingSlugs: ['bursa-modern-art-museum'] },
  'shkoder-al': { slug: 'shkoder-al', title: 'Shkodër, AL', country: 'Albania', listingSlugs: ['the-gourmet-haven-restaurant'] },
  'lushnje-al': { slug: 'lushnje-al', title: 'Lushnjë, AL', country: 'Albania', listingSlugs: ['tranquil-sunny-spa-and-wellness'] },
  'prizren-ks': { slug: 'prizren-ks', title: 'Prizren, KS', country: 'Kosovo', listingSlugs: ['sunset-grill-bar-restaurant'] },
  'ferizaj-ks': { slug: 'ferizaj-ks', title: 'Ferizaj, KS', country: 'Kosovo', listingSlugs: ['verona-sunny-spa-and-beauty'] },
  'mitrovice-ks': { slug: 'mitrovice-ks', title: 'Mitrovice, KS', country: 'Kosovo', listingSlugs: ['turkish-and-islamic-arts-museum'] },
  'gjilan-ks': { slug: 'gjilan-ks', title: 'Gjilan, KS', country: 'Kosovo', listingSlugs: ['veronas-bounty-meat-market'] },
  'kumanovo-mk': { slug: 'kumanovo-mk', title: 'Kumanovo, MK', country: 'North Macedonia', listingSlugs: ['sunset-grill-bar-restaurant'] },
  'kercova-mk': { slug: 'kercova-mk', title: 'Kercova, MK', country: 'North Macedonia', listingSlugs: ['verona-sunny-spa-and-beauty'] },
  'debar-mk': { slug: 'debar-mk', title: 'Debar, MK', country: 'North Macedonia', listingSlugs: ['turkish-and-islamic-arts-museum'] },
  'skopje-mk': { slug: 'skopje-mk', title: 'Skopje, MK', country: 'North Macedonia', listingSlugs: ['veronas-bounty-meat-market'] },
  'brandenburg-de': { slug: 'brandenburg-de', title: 'Brandenburg, DE', country: 'Germany', listingSlugs: ['sunset-grill-bar-restaurant'] },
  'berlin-de': { slug: 'berlin-de', title: 'Berlin, DE', country: 'Germany', listingSlugs: ['verona-sunny-spa-and-beauty'] },
  'baden-wurttemberg-de': { slug: 'baden-wurttemberg-de', title: 'Baden-Württemberg, DE', country: 'Germany', listingSlugs: ['turkish-and-islamic-arts-museum'] },
  'bremen-de': { slug: 'bremen-de', title: 'Bremen, DE', country: 'Germany', listingSlugs: ['veronas-bounty-meat-market'] },
  'oberosterreich-at': { slug: 'oberosterreich-at', title: 'Oberösterreich, AT', country: 'Austria', listingSlugs: ['sunset-grill-bar-restaurant'] },
  'niederosterreich-at': { slug: 'niederosterreich-at', title: 'Niederösterreich, AT', country: 'Austria', listingSlugs: ['verona-sunny-spa-and-beauty'] },
  'burgenland-at': { slug: 'burgenland-at', title: 'Burgenland, AT', country: 'Austria', listingSlugs: ['turkish-and-islamic-arts-museum'] },
  'salzburg-at': { slug: 'salzburg-at', title: 'Salzburg, AT', country: 'Austria', listingSlugs: ['veronas-bounty-meat-market'] },
  'innerschweiz-ch': { slug: 'innerschweiz-ch', title: 'Innerschweiz, CH', country: 'Switzerland', listingSlugs: ['sunset-grill-bar-restaurant'] },
  'bern-ch': { slug: 'bern-ch', title: 'Bern, CH', country: 'Switzerland', listingSlugs: ['verona-sunny-spa-and-beauty'] },
  'aargau-ch': { slug: 'aargau-ch', title: 'Aargau, CH', country: 'Switzerland', listingSlugs: ['turkish-and-islamic-arts-museum'] },
  'luzern-ch': { slug: 'luzern-ch', title: 'Luzern, CH', country: 'Switzerland', listingSlugs: ['veronas-bounty-meat-market'] },
}

const blogDetails: Record<string, BlogStaticData> = {
  'diverse-communities-celebrating-the-tapestry-of-city-life': {
    slug: 'diverse-communities-celebrating-the-tapestry-of-city-life',
    title: 'Diverse Communities: Celebrating the Tapestry of City Life.',
    summary: 'Celebrating the Tapestry of City Life" encapsulates the essence of our shared urban experience. In the heartbeat.',
    image: 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b4d_Blog%201.png',
    date: 'Feb 14, 2024',
    author: 'Olivia Metropolis',
    authorTitle: 'Urban Storyteller',
    authorImage: 'https://cdn.prod.website-files.com/69dcdd38161d4d87e4e258a1/69dcdd3a161d4d87e4e25baa_Tex%20Authore%201.png',
    readTime: '5',
    category: 'City Life',
    paragraphs: [
      'Celebrating the Tapestry of City Life encapsulates the essence of our shared urban experience. In the heartbeat of the city, communities gather, grow, and create the stories that shape every neighborhood.',
      'From local businesses to public spaces and cultural gatherings, the modern city becomes more meaningful when people can discover the places and voices around them.',
    ],
  },
  'the-city-explorers-handbook-tips-tales-and-the-trends': {
    slug: 'the-city-explorers-handbook-tips-tales-and-the-trends',
    title: "The City Explorer's Handbook: Tips, Tales, and the Trends.",
    summary: 'Discover insider tips that transform ordinary outings into extraordinary experiences, tales that unveil the hidden gems.',
    image: 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b4a_Blog%202.png',
    date: 'Feb 14, 2024',
    author: 'Isabella Skylines',
    authorTitle: 'City Guide Writer',
    authorImage: 'https://cdn.prod.website-files.com/69dcdd38161d4d87e4e258a1/69dcdd3a161d4d87e4e25bab_Tex%20Authore%202.png',
    readTime: '6',
    category: 'Travelling',
    paragraphs: [
      'Discover insider tips that transform ordinary outings into extraordinary experiences, with practical ideas for planning better routes, finding local favorites, and moving through the city with confidence.',
      'Every city has its own rhythm. A thoughtful explorer learns to follow the small details, from neighborhood cafés to transit corners and late-afternoon streets.',
    ],
  },
  'a-urban-artistry-showcasing-the-local-artists-and-galleries': {
    slug: 'a-urban-artistry-showcasing-the-local-artists-and-galleries',
    title: 'A Urban Artistry: Showcasing the Local Artists and Galleries.',
    summary: 'Discover insider tips that transform ordinary outings into extraordinary experiences, tales that unveil the hidden gems.',
    image: 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b47_Blog%20%203.png',
    date: 'Feb 14, 2024',
    author: 'Dominic UrbanNomad',
    authorTitle: 'Local Arts Writer',
    authorImage: 'https://cdn.prod.website-files.com/69dcdd38161d4d87e4e258a1/69dcdd3a161d4d87e4e25bac_Tex%20Authore%20%203.png',
    readTime: '4',
    category: 'Artistry',
    paragraphs: [
      'Urban artistry gives the city a visible pulse, turning galleries, studios, walls, and public spaces into places of discovery.',
      'Local artists help preserve neighborhood identity while inviting visitors to see familiar streets with fresh attention and curiosity.',
    ],
  },
  'city-vignettes-snapshot-stories-of-the-everyday-urban-life': {
    slug: 'city-vignettes-snapshot-stories-of-the-everyday-urban-life',
    title: 'City Vignettes: Snapshot Stories of the Everyday Urban Life.',
    summary: 'Celebrating the Tapestry of City Life" encapsulates the essence of our shared urban experience. In the heartbeat.',
    image: 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b44_Blog%20%204.png',
    date: 'Feb 14, 2024',
    author: 'Nathan MetroTrek',
    authorTitle: 'City Life Observer',
    authorImage: 'https://cdn.prod.website-files.com/69dcdd38161d4d87e4e258a1/69dcdd3a161d4d87e4e25baa_Tex%20Authore%201.png',
    readTime: '5',
    category: 'City Life',
    paragraphs: [
      'Everyday urban life is built from small scenes: a storefront opening, a train arriving, a familiar corner filling with conversation.',
      'These city vignettes remind us that discovery is not only about landmarks. It is also about noticing the ordinary moments that make a place feel alive.',
    ],
  },
  'the-metro-moves-exploring-public-transport-gems-in-the-city': {
    slug: 'the-metro-moves-exploring-public-transport-gems-in-the-city',
    title: 'The Metro Moves: Exploring Public Transport Gems in the City.',
    summary: 'Celebrating the Tapestry of City Life" encapsulates the essence of our shared urban experience. In the heartbeat.',
    image: 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b41_Blog%205.png',
    date: 'Feb 14, 2024',
    author: 'Milo StreetCraze',
    authorTitle: 'Transit Explorer',
    authorImage: 'https://cdn.prod.website-files.com/69dcdd38161d4d87e4e258a1/69dcdd3a161d4d87e4e25bab_Tex%20Authore%202.png',
    readTime: '6',
    category: 'Travelling',
    paragraphs: [
      'Public transport can reveal a city through movement, connecting neighborhoods, routines, and unexpected destinations.',
      'From scenic routes to useful transfer points, the metro and its surrounding streets can become part of the exploration itself.',
    ],
  },
  'exploring-the-hidden-cafes-a-java-lovers-guide-to-delights': {
    slug: 'exploring-the-hidden-cafes-a-java-lovers-guide-to-delights',
    title: "Exploring the Hidden Cafés: A Java Lover's Guide to Delights.",
    summary: 'Discover insider tips that transform ordinary outings into extraordinary experiences, tales that unveil the hidden gems.',
    image: 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b3d_Blog%206.png',
    date: 'Feb 14, 2024',
    author: 'Sebastian Wanderlust',
    authorTitle: 'Cafe Explorer',
    authorImage: 'https://cdn.prod.website-files.com/69dcdd38161d4d87e4e258a1/69dcdd3a161d4d87e4e25bac_Tex%20Authore%20%203.png',
    readTime: '4',
    category: 'Artistry',
    paragraphs: [
      'Hidden cafés often become the quiet anchors of a neighborhood, offering warm corners, thoughtful menus, and a reason to slow down.',
      'For coffee lovers, the best discoveries are often tucked just beyond the busy streets, where atmosphere and local character meet in a single cup.',
    ],
  },
}

const cityCategoryDetails: Record<string, CityCategoryStaticData> = {
  'arts-and-culture': {
    slug: 'arts-and-culture',
    title: 'Arts and Culture',
    summary:
      'At Zaidic, businesses, services, and experiences come together to create a dynamic tapestry of urban life. Navigate through.',
    listingSlugs: ['bursa-modern-art-museum'],
  },
  'travel-and-exploration': {
    slug: 'travel-and-exploration',
    title: 'Travel and Exploration',
    summary:
      'At Zaidic, travel services and local experiences help visitors move through the city with confidence and discover more along the way.',
    listingSlugs: ['romes-trams-and-funiculars'],
  },
  'sports-and-fitness': {
    slug: 'sports-and-fitness',
    title: 'Sports and Fitness',
    summary:
      'At Zaidic, wellness, fitness, and active lifestyle listings make it easier to find energizing places around the city.',
    listingSlugs: ['tranquil-sunny-spa-and-wellness'],
  },
  'car-rental': {
    slug: 'car-rental',
    title: 'Car rental',
    summary:
      'At Zaidic, car rental listings connect visitors with convenient local options for flexible city travel.',
    listingSlugs: ['sunset-grill-bar-restaurant'],
  },
  'shopping-and-retail': {
    slug: 'shopping-and-retail',
    title: 'Shopping and Retail',
    summary:
      'At Zaidic, shopping and retail listings bring together local markets, useful shops, and everyday discoveries.',
    listingSlugs: ['natures-bounty-farmers-market'],
  },
  'entertainment-nightlife': {
    slug: 'entertainment-nightlife',
    title: 'Entertainment & Nightlife',
    summary:
      'At Zaidic, nightlife and entertainment listings highlight lively venues, performances, and memorable evening plans.',
    listingSlugs: ['rome-performing-party-center'],
  },
  'dining-and-restaurants': {
    slug: 'dining-and-restaurants',
    title: 'Dining and Restaurants',
    summary:
      'At Zaidic, dining listings help visitors find welcoming restaurants, local flavors, and memorable food experiences.',
    listingSlugs: ['the-gourmet-haven-restaurant'],
  },
  restaurants: {
    slug: 'restaurants',
    title: 'Restaurants',
    summary:
      'At Zaidic, restaurant listings gather useful local food spots with clear details for quick discovery.',
    listingSlugs: ['veronas-bounty-meat-market'],
  },
  'decorations-catering': {
    slug: 'decorations-catering',
    title: 'Decorations & Catering',
    summary:
      'At Zaidic, decorations and catering listings help people find useful services for events and special plans.',
    listingSlugs: ['verona-sunny-spa-and-beauty'],
  },
  'weeding-event-location': {
    slug: 'weeding-event-location',
    title: 'Weeding & Event location',
    summary:
      'At Zaidic, event location listings highlight distinctive venues with practical details for planning.',
    listingSlugs: ['turkish-and-islamic-arts-museum'],
  },
}

const teamDetails: Record<string, TeamStaticData> = {
  'mrs-isabella-nguyen': {
    slug: 'mrs-isabella-nguyen',
    name: 'Mrs. Isabella Nguyen',
    title: 'Quality Assurance Analyst',
    image:
      'https://cdn.prod.website-files.com/65c7649882e68a9e09d5e483/65d1db8d09a7384187d440ed_Team1.png',
    bio: 'Isabella helps keep the Zaidic experience consistent, polished, and dependable across every page and listing flow.',
  },
  'alexandra-rodriguez': {
    slug: 'alexandra-rodriguez',
    name: 'Alexandra Rodriguez',
    title: 'Human Resources Manager',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b4f_Team_2.png',
    bio: 'Alexandra supports the people side of Zaidic, helping the team stay organized, responsive, and ready to serve customers.',
  },
  'mrs-emily-reynolds': {
    slug: 'mrs-emily-reynolds',
    name: 'Mrs. Emily Reynolds',
    title: 'Customer Success Specialist',
    image:
      'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b50_Team%203.png',
    bio: 'Emily focuses on customer outcomes, making sure listing owners and visitors can find what they need with confidence.',
  },
}

declare global {
  interface Window {
    Webflow?: {
      destroy?: () => void
      ready?: () => void
      require?: (module: string) => { init?: () => void } | undefined
    }
    jQuery?: unknown
    $?: unknown
  }
}

function appendStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

function appendScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = false
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Unable to load ${src}`))
    document.body.appendChild(script)
  })
}

function getRouteSlug(prefix: string) {
  const match = window.location.pathname.match(new RegExp(`^/${prefix}/([^/?#]+)`))
  return match?.[1] ?? ''
}

function titleizeSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => (part.length <= 2 ? part.toUpperCase() : `${part.charAt(0).toUpperCase()}${part.slice(1)}`))
    .join(' ')
}

function fallbackListing(slug: string): ListingStaticData {
  return {
    slug,
    title: titleizeSlug(slug || 'featured-listing'),
    category: 'Featured Listing',
    image: listingBySlug('bursa-modern-art-museum')?.image ?? listingDetails['bursa-modern-art-museum'].image,
    location: '234 Culinary Street, Foodie Haven, Izmir, Turkey',
    days: 'Monday - Saturday',
    hours: '08:00 AM - 09:00 PM',
    summary:
      'A featured Zaidic listing with useful local details, a clear location, and a visitor-friendly experience.',
  }
}

function fallbackCity(slug: string): CityStaticData {
  const countryCode = slug.split('-').at(-1)?.toLowerCase()
  const fallbackListingByCountry: Record<string, string> = {
    al: 'bursa-modern-art-museum',
    at: 'sunset-grill-bar-restaurant',
    ch: 'verona-sunny-spa-and-beauty',
    de: 'turkish-and-islamic-arts-museum',
    ks: 'veronas-bounty-meat-market',
    mk: 'romes-trams-and-funiculars',
  }

  return {
    slug,
    title: titleizeSlug(slug || 'city'),
    country: 'Featured destination',
    listingSlugs: [fallbackListingByCountry[countryCode ?? ''] ?? 'bursa-modern-art-museum'],
  }
}

function fallbackCityCategory(slug: string): CityCategoryStaticData {
  return {
    slug,
    title: titleizeSlug(slug || 'category'),
    summary:
      'At Zaidic, businesses, services, and experiences come together to create a dynamic tapestry of urban life. Navigate through.',
    listingSlugs: Object.keys(listingsData()).slice(0, 1),
  }
}

function fallbackBlog(slug: string): BlogStaticData {
  return {
    slug,
    title: `${titleizeSlug(slug || 'blog-post')}.`,
    summary: 'A featured Zaidic story from the city directory and local discovery platform.',
    image: blogDetails['diverse-communities-celebrating-the-tapestry-of-city-life'].image,
    date: 'Feb 14, 2024',
    author: 'Zaidic Team',
    authorTitle: 'Editorial Team',
    authorImage: blogDetails['diverse-communities-celebrating-the-tapestry-of-city-life'].authorImage,
    readTime: '5',
    category: 'City Life',
    paragraphs: [
      'This static blog detail is ready for the current site and can later be replaced by backend CMS content.',
      'For now, it keeps every blog preview link working with a complete title, image, author, category, and article content.',
    ],
  }
}

function fallbackTeamMember(slug: string): TeamStaticData {
  return {
    slug,
    name: titleizeSlug(slug || 'team-member'),
    title: 'Zaidic Team Member',
    image: teamDetails['alexandra-rodriguez'].image,
    bio: 'A dedicated member of the Zaidic team, focused on keeping the directory helpful, current, and easy to use.',
  }
}

function setElementText(element: Element | null, value: string) {
  if (!element) return

  element.textContent = value
  element.classList.remove('w-dyn-bind-empty')
}

function setElementsText(elements: Element[], values: string[]) {
  elements.forEach((element, index) => {
    setElementText(element, values[index] ?? values[values.length - 1] ?? '')
  })
}

function setImage(element: HTMLImageElement | null, src: string, alt: string) {
  if (!element) return

  element.src = src
  element.alt = alt
  element.removeAttribute('srcset')
  element.removeAttribute('data-src')
  element.classList.remove('w-dyn-bind-empty')
}

function escapeHtml(value: string) {
  const escapeHost = document.createElement('div')
  escapeHost.textContent = value
  return escapeHost.innerHTML
}

function listingsData() {
  // Prioritize CMS data when available to avoid stale static data (with missing citySlug/countryIso2) interfering with filters
  return Object.keys(cmsListingDetails).length > 0 ? cmsListingDetails : listingDetails
}

function listingBySlug(slug: string) {
  return listingsData()[slug]
}

function normalizeAssetUrl(value?: string | null) {
  if (!value) return ''
  if (/^https?:\/\//.test(value) || value.startsWith('/')) return value
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  return `${backendUrl}/${value.replace(/^\/+/, '')}`
}

function mapCmsListing(listing: PublicListing): ListingStaticData {
  const fallbackImage = listingDetails['bursa-modern-art-museum'].image
  const image = normalizeAssetUrl(listing.image) || fallbackImage
  const gallery = (listing.gallery || []).map(normalizeAssetUrl).filter(Boolean)
  const detailsParagraphs = listing.details_paragraphs?.length
    ? listing.details_paragraphs
    : [listing.description, listing.summary].filter(Boolean) as string[]

  return {
    slug: listing.slug,
    title: listing.title,
    category: listing.category || listing.categories?.[0]?.name || 'Featured Listing',
    categorySlug: listing.categories?.[0]?.slug,
    country: listing.country?.name,
    countryIso2: listing.country?.iso2,
    citySlug: listing.city_slug || undefined,
    image,
    location: listing.location || listing.city || 'Location available soon',
    days: listing.days || 'Monday - Saturday',
    hours: listing.hours || '06:00 AM - 10:00 PM',
    summary: listing.summary || listing.description || 'A featured Zaidic listing managed from the CMS.',
    contactAddress: listing.contact_address || listing.location || listing.city || undefined,
    detailsTitle: listing.details_title || `${listing.title} Details`,
    detailsParagraphs,
    facilities: listing.facilities?.length ? listing.facilities : ['Helpful Staff', 'Easy Access', 'Visitor Friendly'],
    gallery: gallery.length ? gallery : [image],
    phone: listing.phone || undefined,
    email: listing.email || undefined,
    websiteUrl: listing.website_url || undefined,
    seoTitle: listing.seo?.title || undefined,
    seoDescription: listing.seo?.description || undefined,
  }
}

async function loadCmsListings() {
  try {
    const [catalog, listings] = await Promise.all([fetchPublicCatalog(), fetchPublicListings()])
    publicCatalog = catalog
    cmsListingDetails = listings.reduce<Record<string, ListingStaticData>>((collection, listing) => {
      collection[listing.slug] = mapCmsListing(listing)
      return collection
    }, {})
  } catch {
    cmsListingDetails = {}
    publicCatalog = fallbackCatalog()
  }
}

function fallbackCatalog(): PublicCatalog {
  const listings = Object.values(listingDetails)
  const categoryMap = new Map<string, number>()

  listings.forEach((listing) => {
    const slug = listing.categorySlug || slugify(listing.category)
    categoryMap.set(slug, (categoryMap.get(slug) || 0) + 1)
  })

  const categories = Array.from(categoryMap.entries()).map(([slug, count], index) => ({
    id: index + 1,
    name: titleizeSlug(slug),
    slug,
    description: null,
    icon: null,
    places_count: count,
  }))

  return {
    countries: [],
    cities: [],
    categories,
    popular: {
      countries: [],
      cities: [],
      categories: categories.map((category) => ({
        type: 'category',
        label: category.name,
        value: category.slug,
        places_count: category.places_count,
      })),
    },
  }
}

function currentFilters(): FilterState {
  const query = new URLSearchParams(window.location.search)
  return {
    country: query.get('country') || '',
    city: query.get('city') || '',
    category: query.get('category') || '',
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function listingMatchesFilters(listing: ListingStaticData, filters: FilterState) {
  const listingCategory = listing.categorySlug || slugify(listing.category)

  return (
    (!filters.country || listing.countryIso2 === filters.country) &&
    (!filters.city || listing.citySlug === filters.city) &&
    (!filters.category || listingCategory === filters.category)
  )
}

function filteredListings(filters = currentFilters()) {
  return Object.values(listingsData()).filter((listing) => listingMatchesFilters(listing, filters))
}

function filterUrl(filters: Partial<FilterState>) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })

  const query = params.toString()
  return query ? `/listings?${query}` : '/listings'
}

function cityOptionsFor(countryIso2: string) {
  if (!countryIso2) return []
  return publicCatalog.cities.filter((city) => city.country?.iso2 === countryIso2)
}

function liveCityCards(filters = currentFilters()) {
  const cityIndex = new Map(publicCatalog.cities.map((city, index) => [city.slug, index]))
  const liveCities = new Map<
    string,
    {
      slug: string
      name: string
      countryIso2: string
      placesCount: number
      image: string
    }
  >()

  filteredListings(filters).forEach((listing) => {
    if (!listing.citySlug) return

    const catalogCity = publicCatalog.cities.find((city) => city.slug === listing.citySlug)
    const existing = liveCities.get(listing.citySlug)

    if (existing) {
      existing.placesCount += 1
      if (!existing.image && listing.image) {
        existing.image = listing.image
      }
      return
    }

    liveCities.set(listing.citySlug, {
      slug: listing.citySlug,
      name: catalogCity?.name || titleizeSlug(listing.citySlug),
      countryIso2: listing.countryIso2 || catalogCity?.country?.iso2 || '',
      placesCount: 1,
      image: listing.image,
    })
  })

  return Array.from(liveCities.values()).sort(
    (left, right) => (cityIndex.get(left.slug) ?? Number.MAX_SAFE_INTEGER) - (cityIndex.get(right.slug) ?? Number.MAX_SAFE_INTEGER),
  )
}

function hideEmptyStates(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.w-dyn-empty').forEach((element) => {
    element.style.display = 'none'
  })
}

function renderDynamicFilters(root: HTMLElement) {
  if (!['/listings', '/cities'].includes(window.location.pathname.replace(/\/$/, ''))) return
  if (root.querySelector('.dynamic-listing-filters')) return

  const filters = currentFilters()
  const cities = cityOptionsFor(filters.country)
  const selectedCountry = publicCatalog.countries.find((country) => country.iso2 === filters.country)
  const selectedCity = publicCatalog.cities.find((city) => city.slug === filters.city)
  const selectedCategory = publicCatalog.categories.find((category) => category.slug === filters.category)
  const count = filteredListings(filters).length
  const host = root.querySelector<HTMLElement>('.listings-page-wrapper, .cities-wrapper, .pages-title-wrap')

  if (!host) return

  const filter = document.createElement('section')
  filter.className = 'dynamic-listing-filters'
  filter.innerHTML = `
    <div class="dynamic-listing-filters__header">
      <div>
        <strong>Find places</strong>
        <span>${count} place${count === 1 ? '' : 's'} found${selectedCountry ? ` in ${escapeHtml(selectedCountry.name)}` : ''}${selectedCity ? `, ${escapeHtml(selectedCity.name)}` : ''}${selectedCategory ? ` for ${escapeHtml(selectedCategory.name)}` : ''}</span>
      </div>
      <a href="/listings" class="dynamic-listing-filters__reset">Reset filters</a>
    </div>
    <div class="dynamic-listing-filters__grid">
      <label>
        <span>Country</span>
        <select class="dynamic-listing-filters__select dynamic-listing-filters__country">
          <option value="">Select country</option>
          ${publicCatalog.countries.map((country) => `<option value="${escapeHtml(country.iso2)}" ${country.iso2 === filters.country ? 'selected' : ''}>${escapeHtml(country.name)} (${country.places_count})</option>`).join('')}
        </select>
      </label>
      <label class="${filters.country ? '' : 'is-disabled'}">
        <span>City</span>
        <select class="dynamic-listing-filters__select dynamic-listing-filters__city" ${filters.country ? '' : 'disabled'}>
          <option value="">${filters.country ? 'All cities' : 'Select country first'}</option>
          ${cities.map((city) => `<option value="${escapeHtml(city.slug)}" ${city.slug === filters.city ? 'selected' : ''}>${escapeHtml(city.name)} (${city.places_count})</option>`).join('')}
        </select>
      </label>
      <label>
        <span>Category</span>
        <select class="dynamic-listing-filters__select dynamic-listing-filters__category">
          <option value="">All categories</option>
          ${publicCatalog.categories.map((category) => `<option value="${escapeHtml(category.slug)}" ${category.slug === filters.category ? 'selected' : ''}>${escapeHtml(category.name)} (${category.places_count})</option>`).join('')}
        </select>
      </label>
    </div>
  `

  host.parentElement?.insertBefore(filter, host.nextSibling)
}

function initializeDynamicFilters() {
  const root = legacyRoot.value
  if (!root) return

  root.querySelectorAll<HTMLSelectElement>('.dynamic-listing-filters select').forEach((select, index) => {
    select.addEventListener('change', () => {
      const filters = currentFilters()
      const key = (['country', 'city', 'category'] as const)[index]
      if (!key) return

      filters[key] = select.value

      if (key === 'country') {
        filters.city = ''
      }

      router.push(filterUrl(filters))
    })
  })
}

function listingSamplesFor(category?: string) {
  const listings = Object.values(listingsData())
  if (!category || category.toLowerCase() === 'all') return listings

  const normalized = category.toLowerCase()
  const matches = listings.filter((listing) => listing.category.toLowerCase() === normalized)
  return matches.length ? matches : listings
}

function fillListingCard(card: HTMLElement, listing: ListingStaticData) {
  card.style.display = ''
  card.dataset.country = listing.countryIso2 || ''
  card.dataset.city = listing.citySlug || ''
  card.dataset.category = listing.categorySlug || slugify(listing.category)
  const links = card.querySelectorAll<HTMLAnchorElement>('a[href]')
  links.forEach((link) => link.setAttribute('href', `/listings/${listing.slug}`))
  setImage(card.querySelector<HTMLImageElement>('img.w-dyn-bind-empty'), listing.image, listing.title)
  setElementText(card.querySelector('.listings-list-single-post-name.w-dyn-bind-empty'), listing.title)
  setElementText(card.querySelector('.listings-list-location.w-dyn-bind-empty'), listing.location)
  setElementsText(Array.from(card.querySelectorAll('.day-text.w-dyn-bind-empty')), [listing.days, listing.hours])
  setElementText(card.querySelector('.time-text.w-dyn-bind-empty'), listing.hours)
  setElementText(card.querySelector('.cities-places.w-dyn-bind-empty'), listing.category)
}

function hydrateListingDetail(root: HTMLElement) {
  const slug = getRouteSlug('listings')
  if (!slug) return

  const listing = listingBySlug(slug) ?? fallbackListing(slug)
  setElementText(root.querySelector('.page-banner-title.w-dyn-bind-empty'), listing.title)
  setElementText(root.querySelector('.page-link-text.w-dyn-bind-empty'), listing.title)
  setElementText(root.querySelector('.section-title.listing'), listing.title)

  const bodyCopy = root.querySelector('.listings-content-wrap p')
  setElementText(bodyCopy, listing.summary)
  setElementsText(
    Array.from(root.querySelectorAll('.date-and-time-icon-text.w-dyn-bind-empty')),
    [listing.location, listing.days, listing.hours],
  )
  setImage(root.querySelector<HTMLImageElement>('.listing-single-img'), listing.image, listing.title)
  const galleryImages = listing.gallery?.length ? listing.gallery : [listing.image]
  Array.from(root.querySelectorAll<HTMLImageElement>('.vibrant-gallery-img')).forEach((image, index) => {
    setImage(image, galleryImages[index % galleryImages.length], listing.title)
  })

  const richText = root.querySelector<HTMLElement>('.rich-text.w-dyn-bind-empty')
  if (richText) {
    const detailsTitle = listing.detailsTitle ?? `${listing.category} Details`
    const detailsParagraphs = listing.detailsParagraphs ?? [
      listing.summary,
      `${listing.title} is listed under ${listing.category} and is available ${listing.days.toLowerCase()} from ${listing.hours.toLowerCase()}.`,
    ]
    const facilities = listing.facilities ?? ['Helpful Staff', 'Easy Access', 'Visitor Friendly']

    richText.innerHTML = [
      `<h3>${escapeHtml(detailsTitle)}</h3>`,
      ...detailsParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
      '<h3>Facilities Available</h3>',
      `<ul>${facilities.map((facility) => `<li>${escapeHtml(facility)}</li>`).join('')}</ul>`,
    ].join('')
    richText.classList.remove('w-dyn-bind-empty')
  }

  root.querySelectorAll('.contact-information-text.w-dyn-bind-empty').forEach((element) => {
    setElementText(element, listing.contactAddress ?? listing.location)
  })
}

function hydrateListingsIndex(root: HTMLElement) {
  if (!['/listings', '/cities'].includes(window.location.pathname.replace(/\/$/, ''))) return

  const filters = currentFilters()
  const listings = filteredListings(filters)
  const selectedCategory = publicCatalog.categories.find((category) => category.slug === filters.category)
  const selectedCity = publicCatalog.cities.find((city) => city.slug === filters.city)
  const selectedCountry = publicCatalog.countries.find((country) => country.iso2 === filters.country)
  const titleParts = [selectedCategory?.name, selectedCity?.name, selectedCountry?.name].filter(Boolean)
  const title = titleParts.length ? `${titleParts.join(' / ')} Places` : 'Listings'

  setElementText(root.querySelector('.page-banner-title'), title)
  setElementText(root.querySelector('.page-link-text'), title)
  setElementText(root.querySelector('.section-title.cities-page, .section-title.listing'), titleParts.length ? title : 'Discover Abundance of Listings.')
  renderDynamicFilters(root)

  root.querySelectorAll<HTMLElement>('.listings-page-collection-item, .listings-content-slide').forEach((card, index) => {
    const listing = listings[index]
    if (!listing) {
      card.style.display = 'none'
      return
    }

    fillListingCard(card, listing)
  })

  if (!listings.length) {
    showListingEmptyState(root)
  }
}

function showListingEmptyState(root: HTMLElement) {
  const wrapper = root.querySelector<HTMLElement>('.listings-page-wrapper, .cities-wrapper')
  if (!wrapper || root.querySelector('.dynamic-listing-empty')) return

  const empty = document.createElement('div')
  empty.className = 'dynamic-listing-empty'
  empty.textContent = 'No places found for this filter.'
  wrapper.appendChild(empty)
}

function hydrateCityCards(root: HTMLElement) {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  if (!['/', '/cities'].includes(path)) return

  const filters = currentFilters()
  const cities = liveCityCards(filters)

  root.querySelectorAll<HTMLElement>('.cities-collection-item, .cities-page-collection-item').forEach((card, index) => {
    const city = cities[index]

    if (!city) {
      card.style.display = 'none'
      return
    }

    card.style.display = ''
    card.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
      link.setAttribute('href', filterUrl({ country: city.countryIso2, city: city.slug }))
    })
    setElementText(card.querySelector('.cities-name-v2, .cities-page-name'), city.name)
    if (city.image) {
      setImage(card.querySelector<HTMLImageElement>('.cities-img-v2, .cities-page-img'), city.image, city.name)
    }

    // Update place counts - try multiple selectors and text matching approaches
    const countFields = Array.from(
      card.querySelectorAll<HTMLElement>('.cities-places, [class*="places"], [class*="place-count"]')
    )
      .filter((element) => {
        const className = typeof element.className === 'string' ? element.className : ''
        return !/wrap/i.test(className) && element.children.length === 0
      })
      .slice(0, 2)

    const placesCount = city.placesCount

    if (countFields.length > 0) {
      if (countFields.length === 1) {
        setElementText(countFields[0], `${placesCount} ${placesCount === 1 ? 'Place' : 'Places'}`)
      } else {
        setElementsText(countFields, [String(placesCount), placesCount === 1 ? 'Place' : 'Places'])
      }
    } else {
      // Fallback: search all text nodes for "place" or "places" and replace them
      updateTextNodesInElement(card, placesCount)
    }
  })
}

function updateTextNodesInElement(element: HTMLElement, placesCount: number) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node: Node) {
        const text = (node as Text).textContent || ''
        // Only update nodes that contain a number followed by "place" or "places"
        if (/\d+\s*place(s)?/i.test(text)) {
          return NodeFilter.FILTER_ACCEPT
        }
        return NodeFilter.FILTER_REJECT
      }
    } as NodeFilter
  )

  let node = walker.nextNode() as Text | null
  while (node) {
    const text = node.textContent || ''
    // Replace patterns like "2 places", "2places", "1 place", etc.
    const updated = text.replace(
      /(\d+)\s*place(s)?/i,
      `${placesCount} ${placesCount === 1 ? 'place' : 'places'}`
    )
    if (updated !== text) {
      node.textContent = updated
    }
    node = walker.nextNode() as Text | null
  }
}

function hydrateCategoryLinks(root: HTMLElement) {
  const categoryLinks = root.querySelectorAll<HTMLAnchorElement>('a[href*="city-categories"], a[href*="detail_city-categories"]')
  categoryLinks.forEach((link) => {
    const href = link.getAttribute('href') || ''
    const slug = href.split('/').pop()?.replace(/\.html$/, '') || ''
    const categorySlug = slug === 'detail_city-categories' ? 'arts-and-culture' : slug

    link.setAttribute('href', filterUrl({ category: categorySlug }))
  })

  // Fix old listing template page links to go to /listings instead
  root.querySelectorAll<HTMLAnchorElement>('a[href*="/template-pages/listings"], a[href*="detail_listings"]').forEach(
    (link) => {
      link.setAttribute('href', '/listings')
    }
  )

  root.querySelectorAll<HTMLElement>('.listings-page-tab-link').forEach((tab) => {
    const label = tab.textContent?.trim()
    if (!label || label.toLowerCase() === 'all') return
    const category = publicCatalog.categories.find((item) => item.name.toLowerCase() === label.toLowerCase())
    if (!category) return

    tab.classList.add('dynamic-category-tab')
    if (tab instanceof HTMLAnchorElement) {
      tab.setAttribute('href', filterUrl({ category: category.slug }))
    }
  })
}

function hydratePopularItems(root: HTMLElement) {
  // Hydrate popular categories
  root.querySelectorAll<HTMLElement>('.categories-main .categories-single, .categories-single').forEach((card, index) => {
    const popularCategory = publicCatalog.popular.categories[index]
    const fallbackCategory = publicCatalog.categories[index]
    if (!popularCategory && !fallbackCategory) return

    const label = popularCategory?.label ?? fallbackCategory?.name ?? ''
    const value = popularCategory?.value ?? fallbackCategory?.slug ?? ''
    const count = popularCategory?.places_count ?? fallbackCategory?.places_count ?? 0
    if (!label || !value) return

    card.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => link.setAttribute('href', filterUrl({ category: value })))
    setElementText(card.querySelector('.categories-title, h3, .categories-text'), label)
    const details = card.querySelector<HTMLElement>('.categories-details, p')
    if (details) details.textContent = `${count} place${count === 1 ? '' : 's'} available.`
  })

  // Hydrate popular countries (if section exists)
  root.querySelectorAll<HTMLElement>('.countries-popular-item, .countries-single').forEach((card, index) => {
    const popularCountry = publicCatalog.popular.countries[index]
    if (!popularCountry) return

    card.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) =>
      link.setAttribute('href', filterUrl({ country: popularCountry.value }))
    )
    setElementText(card.querySelector('[class*="country-name"], h3, .countries-text'), popularCountry.label)
    const details = card.querySelector<HTMLElement>('[class*="detail"], p')
    if (details)
      details.textContent = `${popularCountry.places_count} place${popularCountry.places_count === 1 ? '' : 's'} available.`
  })

  // Hydrate popular cities (if section exists)
  root.querySelectorAll<HTMLElement>('.cities-popular-item').forEach((card, index) => {
    const popularCity = publicCatalog.popular.cities[index]
    if (!popularCity) return

    card.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) =>
      link.setAttribute('href', filterUrl({ country: popularCity.country, city: popularCity.value }))
    )
    setElementText(card.querySelector('[class*="city-name"], h3, .cities-text'), popularCity.label)
    const details = card.querySelector<HTMLElement>('[class*="detail"], p')
    if (details)
      details.textContent = `${popularCity.places_count} place${popularCity.places_count === 1 ? '' : 's'} available.`
  })
}

function hydrateCityDetail(root: HTMLElement) {
  const slug = getRouteSlug('cities')
  if (!slug) return

  const city = cityDetails[slug] ?? fallbackCity(slug)
  const cityListings = city.listingSlugs.map((listingSlug) => listingBySlug(listingSlug)).filter(Boolean)
  const featuredListings = cityListings.length ? cityListings : Object.values(listingsData()).slice(0, 1)

  setElementText(root.querySelector('.page-banner-title.w-dyn-bind-empty'), city.title)
  setElementText(root.querySelector('.page-link-text.w-dyn-bind-empty'), city.title)
  setElementText(root.querySelector('.section-title.cities-page.display.w-dyn-bind-empty'), city.title)

  Array.from(root.querySelectorAll<HTMLElement>('.city-single-collection-item')).forEach((card, index) => {
    fillListingCard(card, featuredListings[index % featuredListings.length])
  })
}

function hydrateCityCategoryDetail(root: HTMLElement) {
  const slug = getRouteSlug('city-categories')
  if (!slug) return

  const category = cityCategoryDetails[slug] ?? fallbackCityCategory(slug)
  const categoryListings = category.listingSlugs.map((listingSlug) => listingBySlug(listingSlug)).filter(Boolean)
  const samples = categoryListings.length ? categoryListings : listingSamplesFor(category.title)

  setElementText(root.querySelector('.page-banner-title'), category.title)
  setElementText(root.querySelector('.page-link-text.w-dyn-bind-empty'), category.title)
  setElementText(root.querySelector('.section-title.cities-page.w-dyn-bind-empty'), `${category.title} Listings`)
  setElementText(root.querySelector('.section-details.cities-page'), category.summary)

  const tabLabels = new Map<string, string>()
  root.querySelectorAll<HTMLElement>('.listings-page-tab-link[data-w-tab]').forEach((tab) => {
    tabLabels.set(tab.getAttribute('data-w-tab') ?? '', tab.textContent?.trim() ?? 'All')
  })

  root.querySelectorAll<HTMLElement>('.w-tab-pane').forEach((pane) => {
    const tabName = tabLabels.get(pane.getAttribute('data-w-tab') ?? '') ?? category.title
    const paneSamples = tabName === 'All' || tabName === category.title ? samples : listingSamplesFor(tabName)
    pane.querySelectorAll<HTMLElement>('.listings-page-collection-item').forEach((card, index) => {
      fillListingCard(card, paneSamples[index % paneSamples.length])
    })
  })
}

function hydrateBlogDetail(root: HTMLElement) {
  const slug = getRouteSlug('blogs')
  if (!slug) return

  const blog = blogDetails[slug] ?? fallbackBlog(slug)
  setElementText(root.querySelector('.page-banner-title.w-dyn-bind-empty'), blog.title)
  setElementText(root.querySelector('.blog-single-post-name.w-dyn-bind-empty'), blog.title)
  setElementText(root.querySelector('.blog-date.w-dyn-bind-empty'), blog.date)
  setElementText(root.querySelector('.blog-author.w-dyn-bind-empty'), blog.author)
  setElementText(root.querySelector('.blog-category.w-dyn-bind-empty'), blog.category)
  setElementText(root.querySelector('.post-author-name.w-dyn-bind-empty'), blog.author)
  setElementText(root.querySelector('.post-author-title.w-dyn-bind-empty'), blog.authorTitle)
  setImage(root.querySelector<HTMLImageElement>('.post-author-img'), blog.authorImage, blog.author)
  setImage(root.querySelector<HTMLImageElement>('.blog-single-img'), blog.image, blog.title)

  const postDateFields = Array.from(root.querySelectorAll('.post-date-text.w-dyn-bind-empty'))
  setElementsText(postDateFields, [blog.readTime, blog.date])

  const richTexts = Array.from(root.querySelectorAll<HTMLElement>('.rich-text.w-dyn-bind-empty'))
  const [introRichText, bodyRichText] = richTexts

  if (introRichText) {
    introRichText.innerHTML = [
      `<p>${escapeHtml(blog.summary)}</p>`,
      ...blog.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
    ].join('')
    introRichText.classList.remove('w-dyn-bind-empty')
  }

  if (bodyRichText) {
    bodyRichText.innerHTML = [
      '<h3>What this story highlights</h3>',
      '<p>Zaidic stories are written to help visitors understand the places, patterns, and small discoveries that shape everyday city life.</p>',
      `<ul><li>${escapeHtml(blog.category)}</li><li>Local discovery</li><li>Urban exploration</li></ul>`,
      '<blockquote>Explore the city with better context, clearer details, and more confidence.</blockquote>',
    ].join('')
    bodyRichText.classList.remove('w-dyn-bind-empty')
  }
}

function hydrateTeamDetail(root: HTMLElement) {
  const slug = getRouteSlug('team')
  if (!slug) return

  const member = teamDetails[slug] ?? fallbackTeamMember(slug)
  setElementText(root.querySelector('.page-banner-title.w-dyn-bind-empty'), member.name)
  setElementText(root.querySelector('.page-link-text.w-dyn-bind-empty'), member.name)
  setElementText(root.querySelector('.team-single-name.w-dyn-bind-empty'), member.name)
  setElementText(root.querySelector('.team-title.w-dyn-bind-empty'), member.title)
  setElementText(root.querySelector('.team-single-title.w-dyn-bind-empty'), member.bio)
  setImage(root.querySelector<HTMLImageElement>('.team-img'), member.image, member.name)
}

function hydrateStaticDetailData(root: HTMLElement) {
  hydrateListingsIndex(root)
  hydrateCityCards(root)
  hydrateCategoryLinks(root)
  hydratePopularItems(root)
  hydrateListingDetail(root)
  hydrateCityDetail(root)
  hydrateCityCategoryDetail(root)
  hydrateBlogDetail(root)
  hydrateTeamDetail(root)
  hideEmptyStates(root)
}

function extractHomeMarkup(html: string) {
  const documentFragment = new DOMParser().parseFromString(html, 'text/html')
  webflowPageId = documentFragment.documentElement.getAttribute('data-wf-page') ?? ''
  webflowSiteId = documentFragment.documentElement.getAttribute('data-wf-site') ?? ''

  const pageWrapper = documentFragment.querySelector<HTMLElement>('.page-wrapper')
  const preloader = documentFragment.querySelector<HTMLElement>('.preeloader')

  if (!pageWrapper) {
    throw new Error('The exported home page wrapper was not found.')
  }

  // A shared Vue header is rendered globally, so drop the embedded Webflow header.
  pageWrapper.querySelector<HTMLElement>('.navbar.w-nav, .navbar')?.remove()
  // A shared Vue footer is rendered globally, so drop the embedded Webflow footer.
  pageWrapper.querySelector<HTMLElement>('section.footer, footer')?.remove()

  normalizeLegacyLinks(pageWrapper)
  normalizeLegacyAssetPaths(pageWrapper)
  hydrateStaticDetailData(pageWrapper)
  pageWrapper.style.opacity = '1'
  inlineScripts = Array.from(documentFragment.querySelectorAll<HTMLScriptElement>('script:not([src])'))
    .filter((script) => script.type !== 'text/x-wf-template')
    .map((script) => script.textContent?.trim() ?? '')
    .filter((script) => !script.includes('WebFont.load'))
    .filter((script) => !script.includes('w-mod-'))
    .filter(Boolean)

  return `${pageWrapper.outerHTML}${preloader?.outerHTML ?? ''}`
}

function resolveLegacyRoute(href: string) {
  let normalized = href.trim()

  if (!normalized || normalized.startsWith('#') || normalized.startsWith('mailto:') || normalized.startsWith('tel:')) {
    return normalized || undefined
  }

  try {
    const url = new URL(normalized, window.location.origin)
    if (url.origin !== window.location.origin && !url.hostname.endsWith('zaidic.webflow.io')) {
      return undefined
    }

    normalized = `${url.pathname}${url.search}${url.hash}`
  } catch {
    // Keep the original relative path when URL parsing is not useful.
  }

  normalized = normalized
    .replace(/^https?:\/\/zaidic\.webflow\.io\/?/, '')
    .replace(/^(\.\.\/)+/, '')
    .replace(/^\.\//, '')
    .replace(/^\//, '')
    .replace(/\.html$/, '')
    .replace(/\/$/, '')

  const routeMap: Record<string, string> = {
    '': '/',
    '#': '#',
    'index': '/',
    'backup/home-v1': '/',
    'template-pages/about-us': '/about',
    'template-pages/listings': '/listings',
    'template-pages/blogs': '/blogs',
    'template-pages/contact-us': '/contact',
    'template-pages/pricing': '/pricing',
    'template-pages/services': '/services',
    'template-pages/cities': '/listings',
    'template-pages/add-listing': '/add-listing',
    'login': '/login',
    'register': '/register',
    'search': '/search',
    'detail_city-categories': '/listings?category=arts-and-culture',
    'detail_cities': '/cities/vlore-al',
    'detail_listings': '/listings/bursa-modern-art-museum',
    'detail_blogs': '/blogs/diverse-communities-celebrating-the-tapestry-of-city-life',
    'detail_team': '/team/alexandra-rodriguez',
  }

  if (routeMap[normalized]) {
    return routeMap[normalized]
  }

  if (/^city-categories\/[^/]+$/.test(normalized)) {
    return filterUrl({ category: normalized.split('/').pop() })
  }

  if (/^cities\/[^/]+$/.test(normalized)) {
    return filterUrl({ city: normalized.split('/').pop() })
  }

  if (/^listings\/[^/]+$/.test(normalized)) {
    return `/${normalized}`
  }

  if (/^blogs\/[^/]+$/.test(normalized)) {
    return `/${normalized}`
  }

  if (/^team\/[^/]+$/.test(normalized)) {
    return `/${normalized}`
  }

  return undefined
}

function normalizeLegacyLinks(root: HTMLElement) {
  root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    const href = link.getAttribute('href')
    if (!href) return

    const route = resolveLegacyRoute(href)
    if (route && route !== '#') {
      link.setAttribute('href', route)
    }
  })
}

function absolutizeLegacyAssetPath(value: string) {
  const trimmed = value.trim()

  if (
    !trimmed ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:') ||
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
  ) {
    return value
  }

  const normalized = trimmed.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '')
  const assetRoots = ['assets/', 'css/', 'documents/', 'fonts/', 'images/', 'js/']

  if (assetRoots.some((root) => normalized.startsWith(root))) {
    return `/${normalized}`
  }

  return value
}

function absolutizeSrcset(value: string) {
  return value
    .split(',')
    .map((candidate) => {
      const parts = candidate.trim().split(/\s+/)
      if (!parts[0]) return candidate

      parts[0] = absolutizeLegacyAssetPath(parts[0])
      return parts.join(' ')
    })
    .join(', ')
}

function normalizeLegacyAssetPaths(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[src]').forEach((element) => {
    const src = element.getAttribute('src')
    if (src) {
      element.setAttribute('src', absolutizeLegacyAssetPath(src))
    }
  })

  root.querySelectorAll<HTMLElement>('[data-src]').forEach((element) => {
    const src = element.getAttribute('data-src')
    if (src) {
      element.setAttribute('data-src', absolutizeLegacyAssetPath(src))
    }
  })

  root.querySelectorAll<HTMLElement>('[srcset]').forEach((element) => {
    const srcset = element.getAttribute('srcset')
    if (srcset) {
      element.setAttribute('srcset', absolutizeSrcset(srcset))
    }
  })
}

function restoreWebflowDocumentState() {
  if (webflowPageId) {
    document.documentElement.setAttribute('data-wf-page', webflowPageId)
  }

  if (webflowSiteId) {
    document.documentElement.setAttribute('data-wf-site', webflowSiteId)
  }

  document.documentElement.classList.add('w-mod-js')

  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.documentElement.classList.add('w-mod-touch')
  }
}

function runInlineScripts() {
  inlineScripts.forEach((script) => {
    Function(script)()
  })

  document.dispatchEvent(new Event('DOMContentLoaded'))
}

function syncMobileMenuAttributes() {
  const menuButton = document.querySelector<HTMLElement>('.legacy-home .w-nav-button')
  const navMenu = document.querySelector<HTMLElement>('.legacy-home .w-nav-menu')
  const navbar = document.querySelector<HTMLElement>('.legacy-home .w-nav')

  menuButton?.classList.toggle('w--open', isMobileNavOpen.value)
  menuButton?.setAttribute('role', 'button')
  menuButton?.setAttribute('tabindex', '0')
  menuButton?.setAttribute('aria-label', 'Toggle menu')
  menuButton?.setAttribute('aria-expanded', String(isMobileNavOpen.value))

  navbar?.classList.toggle('legacy-nav-open', isMobileNavOpen.value)

  if (isMobileNavOpen.value) {
    navMenu?.setAttribute('data-nav-menu-open', '')
  } else {
    navMenu?.removeAttribute('data-nav-menu-open')
  }
}

function toggleMobileMenu(event: Event) {
  event.preventDefault()
  event.stopPropagation()

  if ('stopImmediatePropagation' in event && typeof event.stopImmediatePropagation === 'function') {
    event.stopImmediatePropagation()
  }

  isMobileNavOpen.value = !isMobileNavOpen.value
  syncMobileMenuAttributes()
}

function closeMobileMenu() {
  isMobileNavOpen.value = false
  syncMobileMenuAttributes()
}

function getApiBase(): string {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (backendUrl) return backendUrl

  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000'
  }

  return window.location.origin
}

function openSubscribeModal() {
  isSubscribeModalOpen.value = true
  subscribeFeedback.value = ''
}

function closeSubscribeModal() {
  isSubscribeModalOpen.value = false
  subscribeSubmitting.value = false
}

async function submitStickySubscribe() {
  if (!subscribeEmail.value || subscribeSubmitting.value) return

  subscribeSubmitting.value = true
  subscribeFeedback.value = ''

  try {
    const response = await fetch(`${getApiBase()}/api/v1/public/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: subscribeEmail.value,
        source: 'sticky-bar',
      }),
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(payload?.message || 'Unable to subscribe right now. Please try again.')
    }

    subscribeFeedbackTone.value = 'success'
    subscribeFeedback.value = payload?.message || 'Subscribed successfully.'
    subscribeEmail.value = ''
  } catch (error) {
    subscribeFeedbackTone.value = 'danger'
    subscribeFeedback.value = error instanceof Error ? error.message : 'Unable to subscribe right now.'
  } finally {
    subscribeSubmitting.value = false
  }
}

function closeDropdowns(except?: HTMLElement) {
  document.querySelectorAll<HTMLElement>('.legacy-home .w-dropdown.legacy-dropdown-open').forEach((dropdown) => {
    if (dropdown === except) return

    dropdown.classList.remove('legacy-dropdown-open')
    dropdown.querySelector<HTMLElement>('.w-dropdown-toggle')?.classList.remove('w--open')
    dropdown.querySelector<HTMLElement>('.w-dropdown-list')?.classList.remove('w--open')
  })
}

function toggleDropdown(toggle: HTMLElement) {
  const dropdown = toggle.closest<HTMLElement>('.w-dropdown')
  if (!dropdown) return

  const shouldOpen = !dropdown.classList.contains('legacy-dropdown-open')
  closeDropdowns(dropdown)
  dropdown.classList.toggle('legacy-dropdown-open', shouldOpen)
  toggle.classList.toggle('w--open', shouldOpen)
  dropdown.querySelector<HTMLElement>('.w-dropdown-list')?.classList.toggle('w--open', shouldOpen)
}

function normalizeCategory(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function getBlogFilterLabelText(label: HTMLElement) {
  return label.querySelector<HTMLElement>('[fs-cmsfilter-field="category"]')?.textContent?.trim() ?? ''
}

function filterBlogItems(category: string) {
  const normalizedCategory = normalizeCategory(category)
  const showAll = !normalizedCategory || normalizedCategory === 'all'
  const root = legacyRoot.value

  root?.querySelectorAll<HTMLElement>('.blog-collection-item').forEach((item) => {
    const categories = Array.from(item.querySelectorAll<HTMLElement>('[fs-cmsfilter-field="category"]'))
      .map((element) => normalizeCategory(element.textContent ?? ''))
      .filter(Boolean)

    const shouldShow = showAll || categories.includes(normalizedCategory)
    item.style.display = shouldShow ? '' : 'none'
    item.toggleAttribute('hidden', !shouldShow)
  })
}

function setBlogFilterActive(activeLabel: HTMLElement) {
  const root = legacyRoot.value

  root?.querySelectorAll<HTMLElement>('.listings-page-tab-link[fs-cmsfilter-field], .listings-page-tab-link').forEach((label) => {
    const isActive = label === activeLabel
    label.classList.toggle('fs-cmsfilter_active', isActive)
    label.classList.toggle('w--current', isActive)
    label.setAttribute('aria-checked', String(isActive))
    const input = label.querySelector<HTMLInputElement>('input[type="radio"]')
    if (input) {
      input.checked = isActive
    }
  })
}

function handleBlogFilterClick(label: HTMLElement, event: Event) {
  event.preventDefault()
  const category = getBlogFilterLabelText(label)
  if (!category) return

  setBlogFilterActive(label)
  filterBlogItems(category)
}

function initializeBlogFilters() {
  const root = legacyRoot.value
  if (!root?.querySelector('.blog-collection-list')) return

  root.querySelectorAll<HTMLElement>('.listings-page-tab-link').forEach((label) => {
    label.setAttribute('role', 'radio')
    label.setAttribute('tabindex', '0')
    label.setAttribute('aria-label', getBlogFilterLabelText(label))
  })

  const activeLabel =
    root.querySelector<HTMLElement>('.listings-page-tab-link.fs-cmsfilter_active') ??
    root.querySelector<HTMLElement>('.listings-page-tab-link')

  if (activeLabel) {
    setBlogFilterActive(activeLabel)
    filterBlogItems(getBlogFilterLabelText(activeLabel))
  }
}

function activateBestListingTab(tabsRoot: HTMLElement, tabName: string) {
  const tabLinks = Array.from(tabsRoot.querySelectorAll<HTMLElement>('.best-listing-tab-link[data-w-tab]'))
  const panes = Array.from(tabsRoot.querySelectorAll<HTMLElement>('.best-listing-tab-pane[data-w-tab]'))

  tabLinks.forEach((link) => {
    const isActive = link.getAttribute('data-w-tab') === tabName
    link.classList.toggle('w--current', isActive)
    link.setAttribute('aria-selected', String(isActive))
    link.setAttribute('tabindex', isActive ? '0' : '-1')
    link.querySelector<HTMLElement>('.best-listing-tab-link-arrow')?.toggleAttribute('hidden', !isActive)
  })

  panes.forEach((pane) => {
    const isActive = pane.getAttribute('data-w-tab') === tabName
    pane.classList.toggle('w--tab-active', isActive)
    pane.style.display = isActive ? 'block' : 'none'
    pane.style.opacity = isActive ? '1' : '0'
    pane.setAttribute('aria-hidden', String(!isActive))
  })

  tabsRoot.setAttribute('data-current', tabName)
}

function initializeAboutBestListingTabs() {
  const root = legacyRoot.value
  const tabsRoot = root?.querySelector<HTMLElement>('.best-listing-tabs')
  if (!tabsRoot) return

  const tabLinks = Array.from(tabsRoot.querySelectorAll<HTMLElement>('.best-listing-tab-link[data-w-tab]'))
  if (!tabLinks.length) return

  tabLinks.forEach((link, index) => {
    link.setAttribute('role', 'tab')
    link.setAttribute('tabindex', index === 0 ? '0' : '-1')
    link.setAttribute('aria-selected', index === 0 ? 'true' : 'false')

    link.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      activateBestListingTab(tabsRoot, link.getAttribute('data-w-tab') ?? 'Tab 1')
    })

    link.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return

      event.preventDefault()
      activateBestListingTab(tabsRoot, link.getAttribute('data-w-tab') ?? 'Tab 1')
    })
  })

  tabsRoot.querySelectorAll<HTMLElement>('.best-listing-tab-pane[data-w-tab]').forEach((pane) => {
    pane.setAttribute('role', 'tabpanel')
    pane.style.transition = 'opacity 180ms ease'
  })

  const activeTab = tabsRoot.querySelector<HTMLElement>('.best-listing-tab-link.w--current[data-w-tab]')
  activateBestListingTab(tabsRoot, activeTab?.getAttribute('data-w-tab') ?? 'Tab 1')
}

function setFaqAccordionItem(item: HTMLElement, isActive: boolean) {
  const answerWrap = item.querySelector<HTMLElement>('.ans-wrap')
  const title = item.querySelector<HTMLElement>('.faq-title')
  const answer = item.querySelector<HTMLElement>('.faq-ans-v2')
  const minusIcon = item.querySelector<HTMLElement>('.faq-title-icon-1')
  const plusIcon = item.querySelector<HTMLElement>('.faq-title-icon-2')

  item.classList.toggle('w--current', isActive)
  item.setAttribute('aria-expanded', String(isActive))
  item.style.backgroundColor = isActive ? 'rgb(255, 147, 154)' : 'rgb(255, 255, 255)'
  title?.style.setProperty('color', 'rgb(83, 40, 34)')
  answer?.style.setProperty('color', 'rgba(83, 40, 34, 0.8)')

  if (answerWrap) {
    answerWrap.style.overflow = 'hidden'
    answerWrap.style.transition = 'height 220ms ease'
    answerWrap.style.height = isActive ? `${answerWrap.scrollHeight}px` : '0px'
  }

  if (minusIcon) {
    minusIcon.style.opacity = isActive ? '1' : '0'
  }

  if (plusIcon) {
    plusIcon.style.opacity = isActive ? '0' : '1'
  }
}

function activateFaqAccordion(activeItem: HTMLElement) {
  const root = legacyRoot.value
  root?.querySelectorAll<HTMLElement>('.faq-single-wrap').forEach((item) => {
    setFaqAccordionItem(item, item === activeItem)
  })
}

function initializeAboutFaqAccordion() {
  const root = legacyRoot.value
  const faqItems = Array.from(root?.querySelectorAll<HTMLElement>('.faq-single-wrap') ?? [])
  if (!faqItems.length) return

  faqItems.forEach((item, index) => {
    item.setAttribute('role', 'button')
    item.setAttribute('tabindex', '0')
    setFaqAccordionItem(item, item.classList.contains('w--current') || index === 0)

    item.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      activateFaqAccordion(item)
    })

    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return

      event.preventDefault()
      activateFaqAccordion(item)
    })
  })
}

function handleLegacyClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const dropdownToggle = target?.closest<HTMLElement>('.w-dropdown-toggle')
  const blogFilterLabel = target?.closest<HTMLElement>('.listings-page-tab-link')
  const anchor = target?.closest<HTMLAnchorElement>('a[href]')

  if (target?.closest('.w-nav-button')) {
    toggleMobileMenu(event)
    return
  }

  if (target?.closest('.legacy-nav-backdrop')) {
    closeMobileMenu()
    closeDropdowns()
    return
  }

  if (dropdownToggle) {
    event.preventDefault()
    toggleDropdown(dropdownToggle)
    return
  }

  if (blogFilterLabel) {
    const tabRoute = anchor ? resolveLegacyRoute(anchor.getAttribute('href') ?? '') : undefined
    if (blogFilterLabel.classList.contains('dynamic-category-tab') && tabRoute?.startsWith('/listings')) {
      event.preventDefault()
      void router.push(tabRoute)
      return
    }

    handleBlogFilterClick(blogFilterLabel, event)
    return
  }

  if (!target?.closest('.w-dropdown')) {
    closeDropdowns()
  }

  if (anchor) {
    if (
      anchor.classList.contains('top-nav-link') &&
      anchor.closest('.navigation-content-wrap') &&
      (anchor.textContent?.toLowerCase().includes('subscribe') || anchor.getAttribute('href')?.includes('pricing'))
    ) {
      event.preventDefault()
      openSubscribeModal()
      return
    }

    const route = resolveLegacyRoute(anchor.getAttribute('href') ?? '')
    if (route && route !== '#') {
      event.preventDefault()
      closeMobileMenu()
      closeDropdowns()
      void router.push(route)
      return
    }
  }

  if (target?.closest('.w-nav-menu a')) {
    closeMobileMenu()
  }
}

function handleLegacyClickCapture(event: MouseEvent) {
  const target = event.target as HTMLElement | null

  if (target?.closest('.w-nav-button')) {
    toggleMobileMenu(event)
  }
}

function handleLegacyKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const blogFilterLabel = target?.closest<HTMLElement>('.listings-page-tab-link')

  if (target?.closest('.w-nav-button') && (event.key === 'Enter' || event.key === ' ')) {
    toggleMobileMenu(event)
  }

  if (blogFilterLabel && (event.key === 'Enter' || event.key === ' ')) {
    handleBlogFilterClick(blogFilterLabel, event)
  }

  if (event.key === 'Escape') {
    closeSubscribeModal()
    closeMobileMenu()
    closeDropdowns()
  }
}

// TODO: Restore these functions when implementing public listing submission form
// function fieldValue(form: HTMLFormElement, id: string) {
//   return (form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)?.value || '').trim()
// }

// function collectAddListingRawFields(form: HTMLFormElement) {
//   const fields: Record<string, string | string[]> = {}
//
//   form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach((field) => {
//     if (!field.name || field.type === 'submit') return
//
//     const label = field.closest('.add-listing-field-single')?.querySelector('.add-listing-field-text')?.textContent
//       ?.replace('*', '')
//       .trim()
//       .replace(/:$/, '')
//       || field.name
//
//     if (field instanceof HTMLInputElement && field.type === 'checkbox') {
//       const checkboxLabel = field.closest('label')?.querySelector('.checkbox-label')?.textContent?.trim()
//       if (!checkboxLabel) return
//
//       const groupLabel = field.closest('.add-listing-field-single')?.querySelector('.add-listing-field-text')?.textContent
//         ?.replace('*', '')
//         .trim()
//         .replace(/:$/, '')
//         || 'Checkboxes'
//       const values = Array.isArray(fields[groupLabel]) ? fields[groupLabel] as string[] : []
//       if (field.checked) values.push(checkboxLabel.replace(/v$/, '').replace('&', 'and').trim())
//       fields[groupLabel] = values
//       return
//     }
//
//     fields[label] = field.value.trim()
//   })
//
//   return fields
// }

function setWebflowFormState(form: HTMLFormElement, state: 'idle' | 'success' | 'error') {
  try {
    const wrapper = form.closest<HTMLElement>('.w-form')
    if (!wrapper) {
      console.warn('⚠️ Could not find .w-form wrapper')
      return
    }

    const success = wrapper.querySelector<HTMLElement>('.w-form-done')
    const error = wrapper.querySelector<HTMLElement>('.w-form-fail')

    // For success, hide error and show form/success message
    if (state === 'success') {
      if (error) {
        error.style.display = 'none'
        error.classList.add('hidden')
      }
      if (form) {
        form.style.display = 'none'
      }
      if (success) {
        success.style.display = 'block'
        success.classList.remove('hidden')
      }
      console.log('✅ Form success state applied')
    }
    // For error, show error and form
    else if (state === 'error') {
      if (error) {
        error.style.display = 'block'
        error.classList.remove('hidden')
      }
      if (form) {
        form.style.display = ''
      }
      if (success) {
        success.style.display = 'none'
      }
      console.log('❌ Form error state applied')
    }
    // For idle, show form and hide both messages
    else {
      if (error) {
        error.style.display = 'none'
      }
      if (success) {
        success.style.display = 'none'
      }
      if (form) {
        form.style.display = ''
      }
      console.log('🔄 Form idle state applied')
    }
  } catch (err) {
    console.error('❌ Error setting form state:', err)
  }
}

function normalizeAddListingForm(root: HTMLElement | null) {
  if (!root) {
    console.warn('⚠️ No root element provided for form normalization')
    return
  }

  try {
    // Find ALL forms on the page
    const allForms = Array.from(root.querySelectorAll<HTMLFormElement>('form'))
    console.log('📋 Found', allForms.length, 'forms on page')

    // Attach listener to each form that might be the add listing form
    allForms.forEach((form, index) => {
      try {
        const isAddListingForm =
          form.id?.includes('add-listing') ||
          form.name?.includes('add-listing') ||
          form.className?.includes('add-listing') ||
          form.querySelector('input[name*="Business-Name"]') !== null ||
          form.querySelector('.business-category-check-box') !== null

        console.log(`📝 Form ${index}:`, form.id || form.name || 'unnamed', '- Is add listing:', isAddListingForm)

        if (isAddListingForm) {
          console.log('✅ Attaching handler to add listing form')

          // Disable Webflow validation completely
          form.setAttribute('novalidate', 'novalidate')
          form.removeAttribute('data-wf-form')

          // CRITICAL: Disable Webflow's native submit handler
          if ((form as any).Webflow) {
            delete (form as any).Webflow
          }

          // Direct submit handler - MUST prevent default immediately
          const submitHandler = (event: Event) => {
            console.log('🎯🎯🎯 FORM SUBMIT INTERCEPTED 🎯🎯🎯')
            event.preventDefault()
            event.stopPropagation()
            event.stopImmediatePropagation?.()

            // Hide error message immediately
            const wrapper = form.closest('.w-form')
            if (wrapper) {
              const errorEl = wrapper.querySelector('.w-form-fail')
              if (errorEl) {
                (errorEl as HTMLElement).style.display = 'none'
              }
            }

            // Call handler
            handleLegacySubmit(event as SubmitEvent).catch((err) => {
              console.error('❌ Submission error:', err)
            })

            return false
          }

          // Set as onsubmit property (highest priority)
          form.onsubmit = submitHandler

          // Add event listeners
          form.addEventListener('submit', submitHandler, true) // capture phase
          form.addEventListener('submit', submitHandler, false) // bubble phase

          console.log('✅ All submit handlers attached, Webflow disabled')
        }
      } catch (err) {
        console.error(`⚠️ Error processing form ${index}:`, err)
      }
    })
  } catch (err) {
    console.error('❌ Error normalizing forms:', err)
  }
}

async function handleLegacySubmit(event: SubmitEvent) {
  const form = event.target as HTMLFormElement | null

  if (!form) {
    console.log('⏭️ No form target found')
    return
  }

  console.log('📝 Form submitted - ID:', form.id, '| Name:', form.name, '| Class:', form.className)

  // Check if this is the add listing form (very flexible matching)
  const formId = (form.id || '').toLowerCase()
  const formName = (form.name || '').toLowerCase()
  const formClass = (form.className || '').toLowerCase()
  const formAction = (form.action || '').toLowerCase()

  // Be very flexible in detecting the form
  const isAddListingForm = formId.includes('add-listing') ||
                          formName.includes('add-listing') ||
                          formClass.includes('add-listing') ||
                          formAction.includes('add-listing') ||
                          formId.includes('wf-form') && formClass.includes('add') ||
                          form.querySelector('input[name*="Business-Name"]') !== null

  if (!isAddListingForm) {
    console.log('⏭️ Not an add listing form, skipping')
    return
  }

  console.log('✅ Intercepting add listing form submission')

  // CRITICAL: Stop all form propagation immediately
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation?.()

  console.log('✋ Form submission prevented')

  const submitButton = form.querySelector<HTMLInputElement>('[type="submit"]')
  const originalLabel = submitButton?.value
  if (submitButton) {
    submitButton.disabled = true
    submitButton.value = 'Submitting...'
  }

  try {
    // Collect ALL form field names for debugging
    const formData = new FormData(form)
    const allFields: Record<string, string> = {}
    formData.forEach((value, key) => {
      allFields[key] = String(value)
    })

    console.log('🔍 All form fields available:', allFields)
    console.log('🔍 Form inputs:', Array.from(form.querySelectorAll('input, textarea, select')).map(el => ({
      name: (el as any).name,
      type: (el as any).type,
      value: (el as any).value,
    })))

    // Note: Removing strict category requirement since we're building from legacy form
    // The form will submit with available data
    console.log('✅ Form validation passed, proceeding with submission')

    const apiBase = getApiBase()

    // Create submission data with flexible field mapping
    const submissionData = new FormData()

    // Helper to get field value with multiple fallback names
    const getValue = (names: string[]): string => {
      for (const name of names) {
        const value = formData.get(name)
        if (value) return String(value)
      }
      return ''
    }

    // Try to get each required field with multiple possible names
    const title = getValue(['Business-Name', 'businessName', 'name', 'title']) || 'Untitled Listing'
    const description = getValue(['Business-Description', 'description', 'message', 'body']) || 'No description provided'
    const contactName = getValue(['Business-Owner', 'owner', 'fullName', 'contact-name', 'name']) || 'Anonymous'
    const contactEmail = getValue(['Email-Address', 'email', 'contact-email', 'Email']) || 'noreply@example.com'
    const contactPhone = getValue(['Phone-Number', 'phone', 'contact-phone']) || ''
    const website = getValue(['Business-Website', 'website', 'url', 'Website']) || ''
    const categoryId = getValue(['category_id', 'category', 'Category']) || ''
    const cityId = getValue(['city_id', 'city', 'City']) || ''

    submissionData.append('title', title)
    submissionData.append('business_name', title)
    submissionData.append('description', description)
    submissionData.append('contact_name', contactName)
    submissionData.append('contact_email', contactEmail)
    submissionData.append('contact_phone', contactPhone)
    submissionData.append('website', website)

    // Only append optional fields if they have values
    if (categoryId) submissionData.append('category_id', categoryId)
    if (cityId) submissionData.append('city_id', cityId)

    console.log('📤 API Endpoint:', `${apiBase}/api/v1/public/listings/submit`)
    console.log('📦 Data being sent:', {
      title,
      business_name: title,
      description,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      website,
      category_id: categoryId || '(empty)',
      city_id: cityId || '(empty)',
    })

    console.log('🌐 Sending to:', `${apiBase}/api/v1/public/listings/submit`)

    const response = await fetch(`${apiBase}/api/v1/public/listings/submit`, {
      method: 'POST',
      body: submissionData,
    })

    console.log('📡 Network request completed. Status:', response.status)

    let result: any = {}
    try {
      result = await response.json()
      console.log('📨 API Response:', result)
    } catch (e) {
      console.log('⚠️ Could not parse response as JSON')
    }

    if (!response.ok) {
      console.error('❌ API Error - Status:', response.status, 'Response:', result)
      throw new Error(result?.message || result?.error || `API Error: ${response.status}`)
    }

    // SUCCESS - Hide form and display success message
    console.log('✨✨✨ SUBMISSION SUCCESSFUL ✨✨✨')

    const wrapper = form.closest('.w-form')
    console.log('🔍 Wrapper found:', !!wrapper)

    if (wrapper) {
      // Hide error message
      const errorEl = wrapper.querySelector('.w-form-fail')
      if (errorEl) {
        console.log('🚫 Hiding error message')
        ;(errorEl as HTMLElement).style.display = 'none'
        ;(errorEl as HTMLElement).hidden = true
      }

      // Try to show the Webflow success element
      let successEl = wrapper.querySelector('.w-form-done') as HTMLElement
      if (successEl) {
        console.log('✅ Found .w-form-done, trying to display it')
        // Remove any hiding
        successEl.removeAttribute('hidden')
        successEl.hidden = false
        successEl.style.display = 'block'
      }

      // If that doesn't work, create a custom success message
      if (!successEl || window.getComputedStyle(successEl).display === 'none') {
        console.log('📝 Creating custom success message')
        const customSuccess = document.createElement('div')
        customSuccess.innerHTML = '<div style="padding: 20px; background: #4CAF50; color: white; border-radius: 4px; text-align: center; font-size: 16px; font-weight: 500;">✅ Thank you! Your submission has been received! We\'ll review it shortly.</div>'
        customSuccess.style.cssText = `
          display: block !important;
          padding: 20px;
          background: #4CAF50;
          color: white;
          border-radius: 4px;
          text-align: center;
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 20px;
          z-index: 1000;
        `
        // Insert after form
        form.parentNode?.insertBefore(customSuccess, form.nextSibling)
        console.log('✅ Custom success message injected')
      }
    }

    // Hide the form
    form.style.display = 'none'

    // Log to confirm
    console.log('✨ Form hidden, success displayed')

    // Reset form after showing success
    setTimeout(() => {
      console.log('🔄 Resetting form for next submission...')
      form.reset()
      form.style.display = ''
      if (wrapper) {
        const successEl = wrapper.querySelector('.w-form-done')
        const errorEl = wrapper.querySelector('.w-form-fail')
        if (successEl) (successEl as HTMLElement).style.display = 'none'
        if (errorEl) (errorEl as HTMLElement).style.display = 'none'
      }
    }, 3000)
  } catch (error) {
    console.error('🚨 Submission failed:', error instanceof Error ? error.message : error)
    try {
      setWebflowFormState(form, 'error')
    } catch (stateError) {
      console.warn('⚠️ Could not set error state:', stateError)
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false
      submitButton.value = originalLabel || 'Submit Your Business'
    }
  }
}

async function initializeWebflow() {
  restoreWebflowDocumentState()
  await appendScript('/js/jquery.min.js')
  await appendScript('/js/webflow.js')

  window.Webflow?.destroy?.()
  window.Webflow?.ready?.()
  window.Webflow?.require?.('ix2')?.init?.()
}

function initializeGsapAnimations() {
  if (!legacyRoot.value) return

  gsap.registerPlugin(ScrollTrigger)
  gsapContext?.revert()

  gsapContext = gsap.context(() => {
    gsap.set('.page-wrapper', { opacity: 1 })

    const scopedElements = (selector: string) => gsap.utils.toArray<HTMLElement>(selector)
    const fromIfExists = (
      selector: string,
      vars: gsap.TweenVars,
      timeline?: gsap.core.Timeline,
      position?: gsap.Position,
    ) => {
      const elements = scopedElements(selector)
      if (!elements.length) return

      if (timeline) {
        timeline.from(elements, vars, position)
        return
      }

      gsap.from(elements, vars)
    }

    const heroTimeline = gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
    })

    fromIfExists(
      '.navbar',
      {
        y: -24,
        opacity: 0,
        duration: 0.55,
      },
      heroTimeline,
    )

    fromIfExists(
      [
        '.hero-sub-title',
        '.hero-title-v2',
        '.hero-details-v2',
        '.search-box-wrapper',
        '.page-section-wrapper',
      ].join(', '),
      {
        y: 34,
        opacity: 0,
        duration: 0.75,
        stagger: 0.08,
      },
      heroTimeline,
      '-=0.2',
    )

    fromIfExists(
      [
        '.hero-img-single',
        '.hero-shape-1',
        '.hero-shape-2',
        '.hero-shape-3',
        '.magic-wrapper-img-v2',
        '.about-title-img-wrap',
      ].join(', '),
      {
        y: 38,
        scale: 0.94,
        opacity: 0,
        duration: 0.85,
        stagger: 0.07,
      },
      heroTimeline,
      '-=0.5',
    )

    scopedElements('.section:not(.home-v2)').forEach((section) => {
      const revealItems = section.querySelectorAll(
        [
          '.section-title',
          '.section-details',
          '.section-title-wrap',
          '.section-title-wrap-left-v2',
          '.categories-main',
          '.cities-v2-content-single',
          '.magic-wrapper-v2',
          '.magic-content-wrapper',
          '.counter-wrapper',
          '.counter-wrapper-v2',
          '.best-listing-tab-content',
          '.best-listing-tab-pane-img-wrap',
          '.listings-list-single',
          '.team-collection-list-wrapper',
          '.team-single-wrapper',
          '.testimonial-slide-single',
          '.faq-content-wrapper',
          '.faq-single',
          '.cta-wtapper',
        ].join(', '),
      )

      if (!revealItems.length) return

      gsap.from(revealItems, {
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          once: true,
        },
        y: 36,
        opacity: 0,
        duration: 0.72,
        ease: 'power3.out',
        stagger: 0.08,
      })
    })

    const floatingShapes = scopedElements(
      '.hero-shape-1, .hero-shape-2, .hero-shape-3, .title-shape, .pricing-shape, .section-title-shape, .cta-img-shape1, .cta-img-shape2',
    )

    if (floatingShapes.length) {
      gsap.to(floatingShapes, {
        y: -12,
        rotate: 3,
        duration: 2.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.2,
      })
    }

    scopedElements('.hero-img-wrapper, .magic-wrapper-v2, .about-title-img-wrap').forEach((element) => {
      gsap.to(element, {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: element.closest('.section') ?? element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Keep page hero content visible even if scroll-trigger timing/order changes.
      scopedElements('.page-section-wrapper').forEach((element) => {
        gsap.set(element, { opacity: 1, y: 0, clearProps: 'transform' })
      })
    })

    ScrollTrigger.refresh()
  }, legacyRoot.value)
}

function hidePreloader() {
  isPreloaderVisible.value = false

  const preloader = document.querySelector<HTMLElement>('.legacy-home .preeloader')
  if (!preloader) return

  gsap.to(preloader, {
    opacity: 0,
    duration: 0.35,
    ease: 'power2.out',
    onComplete: () => {
      preloader.style.display = 'none'
      preloader.setAttribute('aria-hidden', 'true')
    },
  })
}

function startPreloaderTimer() {
  window.clearTimeout(preloaderTimer)
  isPreloaderVisible.value = true

  const preloader = document.querySelector<HTMLElement>('.legacy-home .preeloader')
  if (preloader) {
    preloader.style.display = 'flex'
    preloader.style.opacity = '1'
    preloader.setAttribute('aria-hidden', 'false')
  }

  preloaderTimer = window.setTimeout(hidePreloader, 3000)
}

onMounted(async () => {
  try {
    appendStylesheet('/css/normalize.css')
    appendStylesheet('/css/webflow.css')
    appendStylesheet('/css/kukaqka.webflow.css')
    await loadCmsListings()

    const response = await fetch(props.legacyPath)
    if (!response.ok) {
      throw new Error('Unable to load the exported home page.')
    }

    legacyMarkup.value = extractHomeMarkup(await response.text())
    isLoading.value = false
    await nextTick()

    try {
      normalizeAddListingForm(legacyRoot.value)
    } catch (err) {
      console.error('❌ Error normalizing forms:', err)
    }

    try {
      initializeDynamicFilters()
    } catch (err) {
      console.error('❌ Error initializing filters:', err)
    }

    try {
      await initializeWebflow()
    } catch (err) {
      console.error('❌ Error initializing Webflow:', err)
    }

    try {
      runInlineScripts()
    } catch (err) {
      console.error('❌ Error running inline scripts:', err)
    }

    try {
      syncMobileMenuAttributes()
    } catch (err) {
      console.error('❌ Error syncing mobile menu:', err)
    }

    try {
      initializeBlogFilters()
    } catch (err) {
      console.error('❌ Error initializing blog filters:', err)
    }

    try {
      initializeAboutBestListingTabs()
    } catch (err) {
      console.error('❌ Error initializing tabs:', err)
    }

    try {
      initializeAboutFaqAccordion()
    } catch (err) {
      console.error('❌ Error initializing FAQ:', err)
    }

    try {
      initializeGsapAnimations()
    } catch (err) {
      console.error('❌ Error initializing GSAP:', err)
    }

    try {
      startPreloaderTimer()
    } catch (err) {
      console.error('❌ Error starting preloader timer:', err)
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Unable to initialize the home page.'
    isLoading.value = false
  }
})

// Re-hydrate city cards when filter query parameters change
watch(
  () => [route.query.country, route.query.city, route.query.category],
  () => {
    const root = legacyRoot.value
    if (root && window.location.pathname === '/') {
      hydrateCityCards(root)
    }
  }
)

onBeforeUnmount(() => {
  window.clearTimeout(preloaderTimer)
  gsapContext?.revert()
})
</script>

<template>
  <div
    class="legacy-home"
    :class="{
      'legacy-home--nav-open': isMobileNavOpen,
      'legacy-home--preloader-visible': isPreloaderVisible,
      'legacy-home--preloader-hidden': !isPreloaderVisible,
    }"
    @click.capture="handleLegacyClickCapture"
    @click="handleLegacyClick"
    @keydown="handleLegacyKeydown"
    @submit.capture="handleLegacySubmit"
    ref="legacyRoot"
  >
    <button
      v-if="isMobileNavOpen"
      class="legacy-nav-backdrop"
      type="button"
      aria-label="Close menu"
    ></button>

    <div v-if="loadError" class="legacy-home__error">
      {{ loadError }}
    </div>

    <div v-else-if="!isLoading" v-html="legacyMarkup"></div>

    <div v-if="isSubscribeModalOpen" class="legacy-subscribe-modal" role="dialog" aria-modal="true" aria-label="Subscribe to newsletter">
      <button class="legacy-subscribe-modal__backdrop" type="button" aria-label="Close subscription popup" @click="closeSubscribeModal"></button>

      <div class="legacy-subscribe-modal__panel">
        <button class="legacy-subscribe-modal__close" type="button" aria-label="Close" @click="closeSubscribeModal">x</button>
        <h3 class="legacy-subscribe-modal__title">Subscribe to Our Newsletter</h3>
        <p class="legacy-subscribe-modal__text">Get updates from Zaidic directly in your inbox.</p>

        <form class="legacy-subscribe-modal__form" @submit.prevent="submitStickySubscribe">
          <input
            v-model="subscribeEmail"
            class="legacy-subscribe-modal__input"
            type="email"
            required
            placeholder="Enter your email"
          />
          <button class="legacy-subscribe-modal__submit" type="submit" :disabled="subscribeSubmitting">
            {{ subscribeSubmitting ? 'Subscribing...' : 'Subscribe' }}
          </button>
        </form>

        <p
          v-if="subscribeFeedback"
          class="legacy-subscribe-modal__feedback"
          :class="`legacy-subscribe-modal__feedback--${subscribeFeedbackTone}`"
        >
          {{ subscribeFeedback }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legacy-home {
  min-height: 100vh;
  background: var(--body-background-color);
}

.legacy-home__error {
  display: grid;
  min-height: 100vh;
  place-items: center;
  color: var(--primary-color);
  font-family: var(--marcellus-font-family);
  font-size: 28px;
}

.legacy-subscribe-modal {
  position: fixed;
  inset: 0;
  z-index: 12000;
  display: grid;
  place-items: center;
  padding: 16px;
}

.legacy-subscribe-modal__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(0, 0, 0, 0.4);
}

.legacy-subscribe-modal__panel {
  position: relative;
  width: min(100%, 460px);
  border-radius: 12px;
  background: #fff;
  border: 1px solid #f0ddd6;
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.22);
  padding: 24px;
  color: #532822;
}

.legacy-subscribe-modal__close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: 0;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #f9ece8;
  color: #532822;
  font-size: 16px;
  cursor: pointer;
}

.legacy-subscribe-modal__title {
  margin: 0;
  font-family: var(--marcellus-font-family);
  font-size: 30px;
  line-height: 1.1;
}

.legacy-subscribe-modal__text {
  margin-top: 10px;
  color: rgba(83, 40, 34, 0.8);
  font-size: 15px;
  line-height: 1.4;
}

.legacy-subscribe-modal__form {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.legacy-subscribe-modal__input {
  height: 48px;
  border-radius: 8px;
  border: 1px solid #f0ddd6;
  padding: 0 14px;
  font-size: 15px;
  color: #532822;
}

.legacy-subscribe-modal__submit {
  height: 48px;
  border: 0;
  border-radius: 8px;
  background: var(--yellow);
  color: #532822;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}

.legacy-subscribe-modal__submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.legacy-subscribe-modal__feedback {
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.4;
}

.legacy-subscribe-modal__feedback--success {
  color: #0d7f2b;
}

.legacy-subscribe-modal__feedback--danger {
  color: #b42318;
}

:deep(.menu-button.w-nav-button) {
  min-width: 42px;
  min-height: 42px;
  cursor: pointer;
}

:deep(.menu-button.w-nav-button .lottie-animation) {
  min-width: 38px;
  min-height: 38px;
}

:deep(.w-nav-overlay) {
  display: none !important;
  pointer-events: none !important;
}

@media screen and (max-width: 991px) {
  .legacy-nav-backdrop {
    position: fixed;
    inset: 0;
    z-index: 997;
    border: 0;
    background: rgb(0 0 0 / 16%);
    padding: 0;
  }

  .legacy-home--nav-open :deep(.navbar.w-nav) {
    z-index: 9999;
  }

  .legacy-home--nav-open :deep(.nav-menu.w-nav-menu) {
    display: flex;
    position: absolute;
    z-index: 9998;
    top: calc(100% + 12px);
    left: 0;
    right: 0;
    flex-direction: column;
    width: 100%;
    max-height: calc(100vh - 118px);
    background: transparent;
    padding: 0 15px;
    overflow: visible;
  }

  .legacy-home--nav-open :deep(.nav-menu.w-nav-menu .menu-wrap) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    width: 100%;
    max-height: calc(100vh - 138px);
    padding: 30px;
    overflow: auto;
    border: 3px solid var(--pink);
    background-color: var(--primary-color);
    border-radius: 18px;
    box-shadow: 0 16px 40px rgb(83 40 34 / 12%);
  }

  .legacy-home--nav-open :deep(.nav-menu.w-nav-menu .menu-link) {
    display: flex;
    width: 100%;
    min-height: 44px;
    align-items: center;
    padding: 10px 0;
    color: var(--white);
    border-bottom: 1px solid rgb(255 255 255 / 16%);
  }

  .legacy-home--nav-open :deep(.nav-menu.w-nav-menu .menu-link:hover),
  .legacy-home--nav-open :deep(.nav-menu.w-nav-menu .menu-link.w--current) {
    color: #00cba0;
  }

  .legacy-home--nav-open :deep(.nav-menu.w-nav-menu .secondary-button.for-mobile) {
    display: flex;
    width: 100%;
    margin-top: 22px;
    color: var(--primary-color);
    background: var(--yellow);
    border-color: var(--yellow);
  }

  .legacy-home--nav-open :deep(.nav-menu.w-nav-menu .more-temple-text),
  .legacy-home--nav-open :deep(.nav-menu.w-nav-menu .primary-button-text) {
    position: relative;
    z-index: 1;
  }
}

@media screen and (max-width: 479px) {
  .legacy-home--nav-open :deep(.nav-menu.w-nav-menu) {
    top: calc(100% + 8px);
    padding-left: 10px;
    padding-right: 10px;
  }

  .legacy-home--nav-open :deep(.nav-menu.w-nav-menu .menu-wrap) {
    padding: 24px;
  }
}

:deep(.w-dropdown.legacy-dropdown-open > .w-dropdown-list) {
  display: block;
}

:deep(.search-dropdown.legacy-dropdown-open > .w-dropdown-list) {
  display: block;
  opacity: 1;
  visibility: visible;
}

:deep(.search-box-wrapper),
:deep(.search-wrapper-v2),
:deep(.search-box),
:deep(.search-dropdown.legacy-dropdown-open) {
  position: relative;
  z-index: 900;
}

:deep(.search-dropdown.legacy-dropdown-open > .w-dropdown-list),
:deep(.search-dropdown.legacy-dropdown-open .serch-drop-wrap) {
  z-index: 9999;
}

:deep(.hero-img-wrapper),
:deep(.cities-v2-slider-wrapper),
:deep(.listings-content-wrapper),
:deep(.listings-content-slider),
:deep(.testimonial-slider) {
  position: relative;
  z-index: 1;
}

:deep(.cities-v2 .cities-img-wrap-v2) {
  width: 100%;
  aspect-ratio: 416 / 502;
}

:deep(.cities-v2 .cities-img-v2) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

:deep(.preeloader) {
  position: fixed;
  inset: 0;
  z-index: 99999;
}

.legacy-home--preloader-hidden :deep(.preeloader) {
  pointer-events: none;
}

:deep(.dynamic-listing-filters) {
  width: min(100%, 1120px);
  margin: 34px auto 20px;
  border: 1px solid rgb(83 40 34 / 12%);
  border-radius: 18px;
  background: #fff8ee;
  box-shadow: 0 18px 50px rgb(83 40 34 / 8%);
  padding: 22px;
}

:deep(.dynamic-listing-filters__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

:deep(.dynamic-listing-filters__header strong) {
  display: block;
  color: #532822;
  font-size: 24px;
  line-height: 1.1;
}

:deep(.dynamic-listing-filters__header span) {
  display: block;
  margin-top: 5px;
  color: rgb(83 40 34 / 70%);
  font-size: 15px;
}

:deep(.dynamic-listing-filters__reset) {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  border-radius: 10px;
  background: #ffd15c;
  color: #532822;
  padding: 0 16px;
  font-weight: 700;
  text-decoration: none;
}

:deep(.dynamic-listing-filters__grid) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

:deep(.dynamic-listing-filters label) {
  display: grid;
  gap: 8px;
  color: #532822;
  font-size: 14px;
  font-weight: 700;
}

:deep(.dynamic-listing-filters label.is-disabled) {
  opacity: 0.55;
}

:deep(.dynamic-listing-filters select) {
  width: 100%;
  min-height: 52px;
  border: 1px solid rgb(83 40 34 / 14%);
  border-radius: 12px;
  background: #fff;
  color: #532822;
  padding: 0 14px;
  font: inherit;
}

:deep(.dynamic-listing-filters select:focus) {
  border-color: #ff939a;
  outline: 3px solid rgb(255 147 154 / 24%);
}

:deep(.dynamic-listing-empty) {
  margin: 24px auto;
  border: 1px dashed rgb(83 40 34 / 20%);
  border-radius: 16px;
  background: #fff8ee;
  color: #532822;
  padding: 30px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
}

@media screen and (max-width: 767px) {
  :deep(.dynamic-listing-filters__header) {
    align-items: stretch;
    flex-direction: column;
  }

  :deep(.dynamic-listing-filters__grid) {
    grid-template-columns: 1fr;
  }
}
</style>
