<template>
  <div>
    <LegacyWebflowPage legacy-path="/legacy/index.html" loading-label="Loading Home..." />
    <PopularListingsSection />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import LegacyWebflowPage from '@/components/legacy/LegacyWebflowPage.vue'
import PopularListingsSection from '@/components/sections/PopularListingsSection.vue'

import { fetchPublicCatalog } from '@/services/listings'

onMounted(async () => {
  try {
    // Wait for the legacy HTML to be rendered in the DOM
    let attempts = 0
    while (!document.querySelector('.cities-slider') && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    if (!document.querySelector('.cities-slider')) {
      return
    }

    const catalog = await fetchPublicCatalog()

    populateIconicCitiesSection(catalog.cities)

    // Reinitialize Webflow to recognize the new slider structure
    await new Promise(resolve => setTimeout(resolve, 200))

    if ((window as any).Webflow) {
      try {
        ;(window as any).Webflow.ready?.()

        // Additional: manually bind slider events if Webflow.ready() wasn't enough
        await new Promise(resolve => setTimeout(resolve, 100))
        initializeSliderNavigation()
      } catch (error) {
        // Try manual initialization
        initializeSliderNavigation()
      }
    } else {
      // Fallback: manually initialize slider
      initializeSliderNavigation()
    }
  } catch (error) {
  }
})

function initializeSliderNavigation() {
  const slider = document.querySelector<HTMLElement>('.cities-slider')
  const sliderMask = slider?.querySelector<HTMLElement>('.cities-mask')
  const slides = sliderMask?.querySelectorAll<HTMLElement>('.cities-slide')

  if (!slider || !sliderMask || !slides || slides.length === 0) {
    return
  }

  // Add smooth transition to slider mask
  sliderMask.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'

  let currentSlide = 0
  const totalSlides = slides.length
  let isAnimating = false

  function updateSlider(newIndex: number) {
    // Prevent multiple simultaneous animations
    if (isAnimating) return

    isAnimating = true
    currentSlide = (newIndex + totalSlides) % totalSlides

    // Calculate transform with smooth animation
    const offset = currentSlide * 100
    sliderMask!.style.transform = `translateX(-${offset}%)`

    // Update dots immediately
    const dots = slider!.querySelectorAll<HTMLElement>('.w-slider-dot')
    dots.forEach((dot, index) => {
      const isActive = index === currentSlide
      dot.classList.toggle('w-active', isActive)
      dot.setAttribute('aria-pressed', String(isActive))
      dot.setAttribute('tabindex', isActive ? '0' : '-1')
    })

    // Update slides
    slides!.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', String(index !== currentSlide))
    })

    // Allow next animation after transition completes
    setTimeout(() => {
      isAnimating = false
    }, 600)

  }

  // Bind click handlers to arrow buttons
  const leftArrow = slider.querySelector<HTMLElement>('.w-slider-arrow-left')
  const rightArrow = slider.querySelector<HTMLElement>('.w-slider-arrow-right')

  if (leftArrow) {
    leftArrow.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      updateSlider(currentSlide - 1)
    })

    // Add hover effect
    leftArrow.style.cursor = 'pointer'
  }

  if (rightArrow) {
    rightArrow.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      updateSlider(currentSlide + 1)
    })

    // Add hover effect
    rightArrow.style.cursor = 'pointer'
  }

  // Bind click handlers to dot navigation
  const dots = slider.querySelectorAll<HTMLElement>('.w-slider-dot')
  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      updateSlider(index)
    })

    // Add hover effect
    dot.style.cursor = 'pointer'
  })

}

function populateIconicCitiesSection(cities: any[]) {
  // Find the cities slider in the Webflow HTML
  const slider = document.querySelector<HTMLElement>('.cities-slider')
  if (!slider) {
    return
  }

  // Find the slider mask where slides are contained
  const sliderMask = slider.querySelector<HTMLElement>('.cities-mask')
  if (!sliderMask) {
    return
  }

  // Get the first slide as a template
  const templateSlide = slider.querySelector<HTMLElement>('.cities-slide')
  if (!templateSlide) {
    return
  }


  // Clear all existing slides
  const existingSlides = sliderMask.querySelectorAll('.cities-slide')
  existingSlides.forEach((slide) => slide.remove())

  // Create a slide for each city
  cities.forEach((city, slideIndex) => {
    // Clone the template slide
    const newSlide = templateSlide.cloneNode(true) as HTMLElement
    newSlide.setAttribute('aria-label', `${slideIndex + 1} of ${cities.length}`)
    newSlide.setAttribute('role', 'group')

    // Reset transform and styles with smooth transitions
    newSlide.style.transform = ''
    newSlide.style.opacity = '1'
    newSlide.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'

    // Find the city item within the cloned slide
    const cityItem = newSlide.querySelector('.cities-collection-item')
    if (!cityItem) return

    // Add hover effects to the card
    const cityCard = cityItem.querySelector('.cities-sicgle-v2') as HTMLElement
    const arrowWrap = cityItem.querySelector<HTMLElement>('.cities-img-arrow-wrap-v2')
    const imgWrap = cityItem.querySelector<HTMLElement>('.cities-img-wrap-v2')
    const shapeWrap = cityItem.querySelector<HTMLElement>('.cities-img-wrap-shape-wrap')

    if (cityCard) {
      cityCard.style.cursor = 'none'
      cityCard.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'

      // Track mouse position for smooth cursor following
      cityCard.addEventListener('mousemove', (e: MouseEvent) => {
        if (!arrowWrap || !imgWrap) return

        // Get position relative to the image wrapper for accurate cursor tracking
        const imgRect = imgWrap.getBoundingClientRect()
        const x = e.clientX - imgRect.left
        const y = e.clientY - imgRect.top

        // Move arrow to exactly follow cursor (no offset needed, it centers itself)
        arrowWrap.style.transition = 'none'
        arrowWrap.style.transform = `translate3d(${x}px, ${y}px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)`
      })

      cityCard.addEventListener('mouseenter', () => {
        // Lift the card (removed scale effect)
        cityCard.style.transform = 'translateY(-8px)'
        cityCard.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)'

        // Show arrow cursor
        if (arrowWrap) {
          arrowWrap.style.opacity = '1'
          arrowWrap.style.pointerEvents = 'none'
          arrowWrap.style.zIndex = '1000'
        }

        // Animate shape overlay (pink color) - use opacity to avoid jumping
        if (shapeWrap) {
          const shapes = shapeWrap.querySelectorAll<HTMLElement>('.cities-img-wrap-shape-v2')
          shapes.forEach((shape, index) => {
            shape.style.transition = 'opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            if (index === 0) {
              // Color-two shape (pink overlay) - fade in
              shape.style.opacity = '1'
            } else {
              // First shape - fade out
              shape.style.opacity = '0'
            }
          })
        }
      })

      cityCard.addEventListener('mouseleave', () => {
        // Reset card (no scale)
        cityCard.style.transform = 'translateY(0px)'
        cityCard.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
        cityCard.style.cursor = 'none'

        // Hide arrow cursor
        if (arrowWrap) {
          arrowWrap.style.opacity = '0'
          arrowWrap.style.transform = 'translate3d(0.0414%, -26.0472%, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)'
        }

        // Reset shape overlay - fade out pink, fade in white
        if (shapeWrap) {
          const shapes = shapeWrap.querySelectorAll<HTMLElement>('.cities-img-wrap-shape-v2')
          shapes.forEach((shape, index) => {
            shape.style.transition = 'opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            if (index === 0) {
              // Color-two shape (pink overlay) - fade out
              shape.style.opacity = '0'
            } else {
              // First shape - fade in
              shape.style.opacity = '1'
            }
          })
        }
      })

      // Set initial shadow
      cityCard.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'

      // Set initial arrow visibility and positioning
      if (arrowWrap) {
        arrowWrap.style.opacity = '0'
        arrowWrap.style.willChange = 'transform'
        arrowWrap.style.position = 'absolute'
        arrowWrap.style.left = '0'
        arrowWrap.style.top = '0'
        arrowWrap.style.transform = 'translate3d(0, 0, 0)'
      }

      // Ensure image wrapper is positioned for absolute arrow positioning
      if (imgWrap) {
        const computedPosition = window.getComputedStyle(imgWrap).position
        if (computedPosition === 'static') {
          imgWrap.style.position = 'relative'
        }
      }

      // Set initial shape transitions and opacity
      if (shapeWrap) {
        const shapes = shapeWrap.querySelectorAll<HTMLElement>('.cities-img-wrap-shape-v2')
        shapes.forEach((shape, index) => {
          shape.style.transition = 'opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          shape.style.willChange = 'opacity'
          // Set initial opacity state
          if (index === 0) {
            // Color-two (pink) - start hidden
            shape.style.opacity = '0'
          } else {
            // First shape (white) - start visible
            shape.style.opacity = '1'
          }
        })
      }
    }

    // Update city image
    const img = cityItem.querySelector<HTMLImageElement>('.cities-img-v2')
    if (img) {
      img.src = city.image || 'https://cdn.prod.website-files.com/69dcdd3a161d4d87e4e259f3/69dcdd3a161d4d87e4e25b2a_Listings1.png'
      img.alt = `${city.name}, ${city.country?.iso2 || ''}`
      img.style.cursor = 'pointer'
    }

    // Update city name link and text
    const nameLink = cityItem.querySelector<HTMLAnchorElement>('.cities-name-link-v2')
    if (nameLink) {
      const countryCode = city.country?.iso2 || ''
      const citySlug = city.slug
      nameLink.href = `/listings?country=${countryCode}&city=${citySlug}`
      nameLink.style.cursor = 'pointer'

      const nameHeading = nameLink.querySelector('.cities-name-v2')
      if (nameHeading) {
        nameHeading.textContent = `${city.name}, ${countryCode}`
      }
    }

    // Update the arrow link
    const arrowLink = cityItem.querySelector<HTMLAnchorElement>('.cities-img-arrow-wrap-v2')
    if (arrowLink) {
      const countryCode = city.country?.iso2 || ''
      const citySlug = city.slug
      arrowLink.href = `/listings?country=${countryCode}&city=${citySlug}`
      arrowLink.style.cursor = 'pointer'
    }

    // Update places count
    const placesWrap = cityItem.querySelector('.cities-places-wrap-v2')
    if (placesWrap) {
      const placeDivs = placesWrap.querySelectorAll('.cities-places')
      if (placeDivs.length >= 2) {
        placeDivs[0].textContent = city.places_count.toString()
        placeDivs[1].textContent = city.places_count !== 1 ? 'Places' : 'Place'
      }
    }

    // Append the new slide to the slider mask
    sliderMask.appendChild(newSlide)

  })

  // Rebuild slider navigation dots
  const parentWrapper = slider.parentElement
  if (parentWrapper) {
    const navContainer = parentWrapper.querySelector('.slider-nav')
    if (navContainer) {
      navContainer.innerHTML = ''
      cities.forEach((_, index) => {
        const dot = document.createElement('div')
        dot.className = 'w-slider-dot w-round w-num'
        if (index === 0) {
          dot.classList.add('w-active')
        }
        dot.setAttribute('data-wf-ignore', '')
        dot.setAttribute('aria-label', `Show slide ${index + 1} of ${cities.length}`)
        dot.setAttribute('aria-pressed', index === 0 ? 'true' : 'false')
        dot.setAttribute('role', 'button')
        dot.setAttribute('tabindex', index === 0 ? '0' : '-1')
        dot.style.marginLeft = '3px'
        dot.style.marginRight = '3px'
        dot.textContent = (index + 1).toString()
        navContainer.appendChild(dot)
      })
    } else {
    }
  }

}
</script>

