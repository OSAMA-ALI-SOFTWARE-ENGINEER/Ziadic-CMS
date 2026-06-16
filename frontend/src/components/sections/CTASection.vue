<script setup lang="ts">
import { onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ctaRef = ref<HTMLElement | null>(null)
const ctaWrapperRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!ctaRef.value || !ctaWrapperRef.value) return

  // Animate CTA wrapper on scroll
  gsap.to(ctaWrapperRef.value, {
    scrollTrigger: {
      trigger: ctaRef.value,
      start: 'top center',
      end: 'center center',
      scrub: 1,
      markers: false,
    },
    duration: 1,
    opacity: 1,
    y: 0,
  })

  // Animate CTA images
  const images = ctaRef.value.querySelectorAll('.cta-img-1')
  images.forEach((img, index) => {
    gsap.from(img, {
      scrollTrigger: {
        trigger: ctaRef.value,
        start: 'top center+=100',
        end: 'center center',
        scrub: 1,
        markers: false,
      },
      y: 50 + index * 20,
      opacity: 0,
      duration: 1,
      delay: index * 0.1,
    })
  })

  // Animate buttons on hover
  const buttons = ctaRef.value.querySelectorAll('.primary-button')
  buttons.forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        duration: 0.3,
        y: -4,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
      })
    })

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        duration: 0.3,
        y: 0,
        boxShadow: 'none',
      })
    })
  })
})
</script>

<template>
  <section ref="ctaRef" class="section cta">
    <div class="container">
      <div ref="ctaWrapperRef" class="cta-wtapper">
        <div class="cta-left">
          <div class="section-title-cta-wrap">
            <h2 class="section-title cta">
              Ready to <span class="strike-through">Start?</span><br />Click to Unlock Our Urban Wonders!
            </h2>
            <img src="/images/Blog.png" alt="" class="section-title-shape">
          </div>
          <div class="button-wrap left">
            <router-link to="/listings" class="primary-button white">
              <div class="style-button-text white">Explore Listings</div>
              <div class="button-color active"></div>
            </router-link>
            <router-link to="/add-listing" class="primary-button out-white">
              <div class="style-button-text">Add a Listing</div>
              <div class="button-color"></div>
            </router-link>
          </div>
        </div>
        <div class="cta-right">
          <div class="cta-img">
            <img src="/images/Mask-group.png" alt="" class="cta-img-1 _1" loading="lazy" decoding="async">
            <img src="/images/Cta1.png" alt="" class="cta-img-1 _3" loading="lazy" decoding="async">
            <img src="/images/Mask-group-1.png" alt="" class="cta-img-1 _2" loading="lazy" decoding="async">
            <img src="/images/Best-Listing-Tab-Pane-Shape.png" alt="" class="cta-img-shape1" loading="lazy" decoding="async">
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section.cta {
  padding: 60px 20px;
  position: relative;
  background: linear-gradient(rgba(90, 50, 30, 0.95), rgba(90, 50, 30, 0.95)), url('/images/All-Bg.png');
  background-size: cover;
  background-position: center;
  min-height: 500px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.container {
  max-width: 1350px;
  margin: 0 auto;
  padding: 0 15px;
  width: 100%;
}

.cta-wtapper {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.cta-left {
  color: white;
  z-index: 2;
  position: relative;
}

.section-title-cta-wrap {
  position: relative;
  margin-bottom: 40px;
}

.section-title.cta {
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 400;
  color: white;
  margin: 0 0 20px 0;
  font-family: Marcellus, serif;
  line-height: 1.2;
  text-wrap: balance;
}

.strike-through {
  position: relative;
  display: inline-block;
}

.strike-through::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 2px;
  background: white;
  transform: translateY(-50%);
}

.section-title-shape {
  width: 80px;
  height: auto;
  margin-top: 10px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.button-wrap.left {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.primary-button {
  position: relative;
  display: inline-block;
  padding: 14px 28px;
  text-decoration: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  background: #f4d35e;
  color: #333;
}

.primary-button.white {
  background: #f4d35e;
  color: #333;
}

.primary-button.white:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(244, 211, 94, 0.4);
}

.primary-button.out-white {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.primary-button.out-white:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(255, 255, 255, 0.2);
}

.style-button-text {
  font-size: 16px;
  font-weight: 600;
  display: block;
}

.style-button-text.white {
  color: #333;
}

.button-color {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  background: rgba(0, 0, 0, 0.1);
  transition: height 0.3s ease;
  z-index: -1;
}

.button-color.active {
  height: 100%;
}

.cta-right {
  position: relative;
  z-index: 1;
  min-height: 350px;
}

.cta-img {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 350px;
}

.cta-img-1 {
  position: absolute;
  width: auto;
  height: auto;
  max-width: 100%;
  object-fit: contain;
}

.cta-img-1._1 {
  width: 160px;
  bottom: 10%;
  left: 0;
  z-index: 2;
}

.cta-img-1._2 {
  width: 140px;
  bottom: 5%;
  right: 10%;
  z-index: 1;
}

.cta-img-1._3 {
  width: 200px;
  top: 15%;
  right: 15%;
  z-index: 3;
}

.cta-img-shape1 {
  position: absolute;
  opacity: 0.6;
  pointer-events: none;
  width: 250px;
  top: -50px;
  right: -30px;
  z-index: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .cta-wtapper {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .cta-right {
    min-height: 250px;
  }

  .cta-img-1._1,
  .cta-img-1._2,
  .cta-img-1._3 {
    width: 120px;
  }
}

@media (max-width: 768px) {
  .section.cta {
    padding: 40px 20px;
    min-height: auto;
  }

  .cta-wtapper {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .section-title.cta {
    font-size: 32px;
  }

  .cta-right {
    display: none;
  }

  .button-wrap.left {
    flex-direction: column;
  }

  .primary-button {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .section.cta {
    padding: 30px 16px;
  }

  .section-title.cta {
    font-size: 24px;
  }

  .cta-left {
    text-align: center;
  }

  .section-title-shape {
    width: 60px;
  }
}
</style>
