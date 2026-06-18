<template>
  <LegacyWebflowPage legacy-path="/legacy/detail_listings.html" loading-label="Loading Listing..." />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LegacyWebflowPage from '@/components/legacy/LegacyWebflowPage.vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()

onMounted(async () => {
  try {
    // Wait for legacy page to fully render
    setTimeout(() => {
      initializeLinks()
      initializeAnimations()
      populateContactInformation()
    }, 1500)
  } catch (error) {
  }
})

function populateContactInformation() {
  // Get listing slug from route
  const slug = router.currentRoute.value.params.slug as string
  if (!slug) {
    return
  }

  // Find all contact information elements
  const contactWrap = document.querySelector('.contact-information-wrap')
  if (!contactWrap) {
    return
  }

  // Get all contact information lists
  const contactLists = contactWrap.querySelectorAll('.contact-information-list')

  // Update contact information dynamically based on listing data
  // This will be filled with CMS data
  const contactData: Record<string, string | null> = {
    phone: null,
    email: null,
    website: null,
    address: null,
  }

  // Try to fetch from window.__listingData if available (set by LegacyWebflowPage)
  if ((window as any).__listingData) {
    const listingData = (window as any).__listingData
    contactData.phone = listingData.phone || listingData.contact_phone || null
    contactData.email = listingData.email || listingData.contact_email || null
    contactData.website = listingData.websiteUrl || listingData.contact_website || null
    contactData.address = listingData.contactAddress || listingData.location || null
  }

  // Update the first contact list (phone)
  if (contactLists[0]) {
    const phoneText = contactLists[0].querySelector('.contact-information-text') as HTMLElement
    if (phoneText && contactData.phone) {
      phoneText.textContent = contactData.phone
    }
  }

  // Update the second contact list (email)
  if (contactLists[1]) {
    const emailText = contactLists[1].querySelector('.contact-information-text') as HTMLElement
    if (emailText && contactData.email) {
      emailText.textContent = contactData.email
    }
  }

  // Update the third contact list (website)
  if (contactLists[2]) {
    const websiteText = contactLists[2].querySelector('.contact-information-text') as HTMLElement
    if (websiteText && contactData.website) {
      websiteText.textContent = contactData.website
    }
  }

  // Update the fourth contact list (address)
  if (contactLists[3]) {
    const addressText = contactLists[3].querySelector('.contact-information-text') as HTMLElement
    if (addressText && contactData.address) {
      addressText.textContent = contactData.address
    }
  }
}

function initializeLinks() {
  const ctaSection = document.querySelector('.section.cta')
  if (!ctaSection) {
    return
  }

  // Update button links to use router
  ctaSection.querySelectorAll<HTMLAnchorElement>('a.primary-button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      const href = btn.getAttribute('href')

      if (href?.includes('listings')) {
        router.push('/listings')
      } else if (href?.includes('add-listing')) {
        router.push('/add-listing')
      }
    })
  })
}

function initializeAnimations() {
  const ctaSection = document.querySelector('.section.cta')
  if (!ctaSection) {
    return
  }

  const title = ctaSection.querySelector('.section-title.cta')
  const titleShape = ctaSection.querySelector('.section-title-shape')
  const buttons = ctaSection.querySelectorAll('.primary-button')
  const img1 = ctaSection.querySelector('.cta-img-1._1')
  const img2 = ctaSection.querySelector('.cta-img-1._2')
  const img3 = ctaSection.querySelector('.cta-img-1._3')
  const shape1 = ctaSection.querySelector('.cta-img-shape1')

  // Ensure buttons are visible
  if (buttons.length > 0) {
    buttons.forEach((btn) => {
      const btnEl = btn as HTMLElement
      btnEl.style.display = 'inline-block'
      btnEl.style.visibility = 'visible'
      btnEl.style.opacity = '1'
    })
  }

  // Immediate timeline for entrance animations
  const tl = gsap.timeline()

  // Section entrance
  tl.from(ctaSection, { opacity: 0, y: 50, duration: 0.8, ease: 'power2.out' }, 0)

  // Title entrance
  if (title) {
    tl.from(title, { opacity: 0, y: 30, duration: 0.8, ease: 'power2.out' }, 0.2)
  }

  // Title shape entrance
  if (titleShape) {
    tl.from(titleShape, { opacity: 0, x: 30, duration: 0.6, ease: 'power2.out' }, 0.4)
  }

  // Buttons entrance
  if (buttons.length > 0) {
    tl.from(buttons, { opacity: 0, y: 25, scale: 0.9, duration: 0.7, stagger: 0.2, ease: 'back.out' }, 0.3)
  }

  // Image entrance and floating animations
  if (img1) {
    tl.from(img1, { opacity: 0, x: -40, rotation: -15, duration: 0.8, ease: 'power2.out' }, 0.5)
    // Continuous floating - start immediately
    gsap.to(img1, { duration: 4, y: 15, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5 })
  }

  if (img3) {
    tl.from(img3, { opacity: 0, y: -40, scale: 0.8, duration: 0.8, ease: 'power2.out' }, 0.5)
    // Continuous floating - start immediately
    gsap.to(img3, { duration: 3.8, y: -18, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.3 })
  }

  if (img2) {
    tl.from(img2, { opacity: 0, x: 40, rotation: 15, duration: 0.8, ease: 'power2.out' }, 0.5)
    // Continuous floating - start immediately
    gsap.to(img2, { duration: 4.5, y: -12, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.0 })
  }

  // Shape floating - start immediately
  if (shape1) {
    gsap.to(shape1, { duration: 5, y: 10, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.2 })
  }

  // Button hover animations
  buttons.forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        duration: 0.4,
        
        // boxShadow: btn.classList.contains('white')
        //   ? '0 16px 40px rgba(244, 211, 94, 0.5), 0 0 20px rgba(244, 211, 94, 0.3)'
        //   : '0 16px 40px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.2)',
        ease: 'power2.out',
        overwrite: 'auto',
      })

      gsap.to(btn, { duration: 0.4, scale: 1.05, ease: 'back.out', overwrite: 'auto' })

      const colorDiv = btn.querySelector('.button-color')
      if (colorDiv) {
        gsap.to(colorDiv, { duration: 0.4, height: '100%', ease: 'power2.out', overwrite: 'auto' })
      }
    })

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        duration: 0.4,
        scale: 1,
        // boxShadow: btn.classList.contains('white')
        //   ? '0 6px 20px rgba(244, 211, 94, 0.35)'
        //   : '0 4px 15px rgba(255, 255, 255, 0.15)',
        ease: 'power2.out',
        overwrite: 'auto',
      })

      const colorDiv = btn.querySelector('.button-color')
      if (colorDiv && !btn.classList.contains('white')) {
        gsap.to(colorDiv, { duration: 0.4, height: '0%', ease: 'power2.out', overwrite: 'auto' })
      }
    })
  })

  // Image hover effects
  const images = [img1, img2, img3].filter((img): img is Element => img !== null)
  images.forEach((img: Element) => {
    img.addEventListener('mouseenter', () => {
      gsap.to(img, { duration: 0.4, scale: 1.05, filter: 'brightness(1.1)', ease: 'power2.out', overwrite: 'auto' })
    })

    img.addEventListener('mouseleave', () => {
      gsap.to(img, { duration: 0.4, scale: 1, filter: 'brightness(1)', ease: 'power2.out', overwrite: 'auto' })
    })
  })

}
</script>
