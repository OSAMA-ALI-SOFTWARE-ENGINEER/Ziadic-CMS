<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
const legacyRoot = ref<HTMLElement | null>(null)
const router = useRouter()
let inlineScripts: string[] = []
let webflowPageId = ''
let webflowSiteId = ''
let gsapContext: gsap.Context | undefined
let preloaderTimer: number | undefined

type ListingStaticData = {
  slug: string
  title: string
  category: string
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
    image: listingDetails['bursa-modern-art-museum'].image,
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
    listingSlugs: Object.keys(listingDetails).slice(0, 1),
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

function hideEmptyStates(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.w-dyn-empty').forEach((element) => {
    element.style.display = 'none'
  })
}

function listingSamplesFor(category?: string) {
  const listings = Object.values(listingDetails)
  if (!category || category.toLowerCase() === 'all') return listings

  const normalized = category.toLowerCase()
  const matches = listings.filter((listing) => listing.category.toLowerCase() === normalized)
  return matches.length ? matches : listings
}

function fillListingCard(card: HTMLElement, listing: ListingStaticData) {
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

  const listing = listingDetails[slug] ?? fallbackListing(slug)
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

function hydrateCityDetail(root: HTMLElement) {
  const slug = getRouteSlug('cities')
  if (!slug) return

  const city = cityDetails[slug] ?? fallbackCity(slug)
  const cityListings = city.listingSlugs.map((listingSlug) => listingDetails[listingSlug]).filter(Boolean)
  const featuredListings = cityListings.length ? cityListings : Object.values(listingDetails).slice(0, 1)

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
  const categoryListings = category.listingSlugs.map((listingSlug) => listingDetails[listingSlug]).filter(Boolean)
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
    'template-pages/cities': '/cities',
    'template-pages/add-listing': '/add-listing',
    'search': '/search',
    'detail_city-categories': '/city-categories/arts-and-culture',
    'detail_cities': '/cities/vlore-al',
    'detail_listings': '/listings/bursa-modern-art-museum',
    'detail_blogs': '/blogs/diverse-communities-celebrating-the-tapestry-of-city-life',
    'detail_team': '/team/alexandra-rodriguez',
  }

  if (routeMap[normalized]) {
    return routeMap[normalized]
  }

  if (/^city-categories\/[^/]+$/.test(normalized)) {
    return `/${normalized}`
  }

  if (/^cities\/[^/]+$/.test(normalized)) {
    return `/${normalized}`
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
    handleBlogFilterClick(blogFilterLabel, event)
    return
  }

  if (!target?.closest('.w-dropdown')) {
    closeDropdowns()
  }

  if (anchor) {
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
    closeMobileMenu()
    closeDropdowns()
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
          '.page-section-wrapper',
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

    const response = await fetch(props.legacyPath)
    if (!response.ok) {
      throw new Error('Unable to load the exported home page.')
    }

    legacyMarkup.value = extractHomeMarkup(await response.text())
    isLoading.value = false
    await nextTick()
    await initializeWebflow()
    runInlineScripts()
    syncMobileMenuAttributes()
    initializeBlogFilters()
    initializeAboutBestListingTabs()
    initializeAboutFaqAccordion()
    initializeGsapAnimations()
    startPreloaderTimer()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Unable to initialize the home page.'
    isLoading.value = false
  }
})

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
    ref="legacyRoot"
  >
    <button
      v-if="isMobileNavOpen"
      class="legacy-nav-backdrop"
      type="button"
      aria-label="Close menu"
    ></button>

    <div v-if="isLoading" class="legacy-home__loading">
      <span>{{ props.loadingLabel }}</span>
    </div>

    <div v-else-if="loadError" class="legacy-home__error">
      {{ loadError }}
    </div>

    <div v-else v-html="legacyMarkup"></div>
  </div>
</template>

<style scoped>
.legacy-home {
  min-height: 100vh;
  background: var(--body-background-color);
}

.legacy-home__loading,
.legacy-home__error {
  display: grid;
  min-height: 100vh;
  place-items: center;
  color: var(--primary-color);
  font-family: var(--marcellus-font-family);
  font-size: 28px;
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

:deep(.preeloader) {
  position: fixed;
  inset: 0;
  z-index: 99999;
}

.legacy-home--preloader-hidden :deep(.preeloader) {
  pointer-events: none;
}
</style>
