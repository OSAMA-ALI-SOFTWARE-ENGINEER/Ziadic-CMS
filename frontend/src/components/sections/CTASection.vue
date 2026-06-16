<script setup lang="ts">
import { onMounted, ref } from 'vue'

const ctaRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!ctaRef.value) return

  // Animate buttons on hover
  const buttons = ctaRef.value.querySelectorAll('.primary-button')
  buttons.forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      (btn as HTMLElement).style.transform = 'translateY(-4px)'
      ;(btn as HTMLElement).style.transition = 'all 0.3s ease'
    })

    btn.addEventListener('mouseleave', () => {
      (btn as HTMLElement).style.transform = 'translateY(0)'
    })
  })
})
</script>

<template>
  <section ref="ctaRef" class="section cta">
    <div class="container">
      <div class="cta-wtapper">
        <div class="cta-left">
          <div class="section-title-cta-wrap">
            <h2 class="section-title cta">Ready to <u class="u-start">Start?</u> Click to Unlock Our Urban Wonders!</h2>
            <img src="/images/Blog.png" alt="" class="section-title-shape">
          </div>
          <div class="button-wrap left">
            <router-link to="/listings" class="primary-button white w-inline-block">
              <div class="style-button-text white">Explore Listings</div>
              <div class="button-color active"></div>
            </router-link>
            <router-link to="/add-listing" class="primary-button out-white w-inline-block">
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
  padding-top: 0;
  padding-bottom: 0;
}

.container {
  width: 100%;
  max-width: 1350px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 15px;
  padding-right: 15px;
}

.cta-wtapper {
  grid-column-gap: 52px;
  grid-row-gap: 52px;
  background-image: url('/images/CTA-BG.png');
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border-radius: 30px;
  align-items: center;
  padding: 46px 60px 46px 100px;
  display: flex;
}

.cta-left {
  flex: none;
  width: 572px;
}

.cta-right {
  justify-content: center;
  align-items: center;
  width: 100%;
  display: flex;
}

.section-title-cta-wrap {
  position: relative;
}

.section-title.cta {
  font-family: Marcellus, serif;
  color: #fff;
  font-size: 48px;
  font-weight: 400;
  line-height: 135.714%;
  margin-bottom: 24px;
}

.u-start {
  text-decoration: underline;
}

.section-title-shape {
  z-index: 0;
  position: absolute;
  right: 124px;
  top: 1px;
  width: 80px;
  height: auto;
}

.button-wrap.left {
  grid-column-gap: 20px;
  grid-row-gap: 10px;
  align-items: center;
  display: flex;
  flex-wrap: wrap;
}

.primary-button {
  position: relative;
  background-color: #f4d35e;
  color: #333;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  overflow: hidden;
  display: inline-block;
  transition: all 0.3s ease;
}

.primary-button.white {
  background-color: #f4d35e;
  color: #333;
}

.primary-button.white:hover {
  transform: translateY(-4px);
}

.primary-button.out-white {
  background-color: transparent;
  color: #fff;
  border: 2px solid #fff;
}

.primary-button.out-white:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
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

.cta-img {
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  min-height: 350px;
}

.cta-img-1 {
  z-index: 3;
  border: 4px solid #fdf5ed;
  border-radius: 30px;
  position: relative;
  max-width: 100%;
  height: auto;
}

.cta-img-1._1 {
  z-index: 0;
  position: absolute;
  left: 42px;
  width: 160px;
  transform: rotate(-5deg);
}

.cta-img-1._3 {
  z-index: 3;
  width: 200px;
  position: relative;
}

.cta-img-1._2 {
  z-index: 5;
  position: absolute;
  right: 16px;
  width: 140px;
  transform: rotate(5deg);
}

.cta-img-shape1 {
  z-index: 2;
  position: absolute;
  bottom: -20px;
  left: 61px;
  width: 250px;
  height: auto;
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 1024px) {
  .cta-wtapper {
    grid-template-columns: 1fr;
    padding: 40px;
    gap: 30px;
  }

  .cta-left {
    width: 100%;
  }

  .cta-img {
    min-height: 250px;
  }

  .cta-img-1._1,
  .cta-img-1._2 {
    width: 120px;
  }
}

@media (max-width: 768px) {
  .cta-wtapper {
    padding: 30px 20px;
  }

  .cta-left {
    width: 100%;
  }

  .section-title.cta {
    font-size: 32px;
  }

  .cta-right {
    display: none;
  }

  .button-wrap.left {
    flex-direction: column;
    width: 100%;
  }

  .primary-button {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .cta-wtapper {
    padding: 24px 16px;
  }

  .section-title.cta {
    font-size: 24px;
  }

  .cta-left {
    width: 100%;
  }

  .section-title-shape {
    width: 60px;
  }
}
</style>
