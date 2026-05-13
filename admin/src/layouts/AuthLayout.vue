<template>
  <main class="sign-wrapper" :style="{ '--auth-bg': `url(${asset('Sign-Page-Bg.png')})` }">
    <section class="sign-left-content-wrap">
      <div class="sign-left-content-inner">
        <RouterLink class="sign-logo-link" to="/login">
          <img :src="asset('Sign-Logo.svg')" alt="Kukaqka" class="sign-logo" />
        </RouterLink>
        <h1 class="sign-head">
          Start Your <span class="sign-color">Listing Journey</span> Here!
        </h1>
        <div class="sign-img-wrapper">
          <div class="sign-img-wrap">
            <img :src="asset('Sign-Img-1.png')" alt="" class="sign-img" />
          </div>
          <div class="sign-img-wrap _2">
            <img :src="asset('Sign-Img-2.png')" alt="" class="sign-img" />
          </div>
          <img :src="asset('Sign-Star-Shape.png')" alt="" class="sign-shape-1" />
          <img :src="asset('Sign-Shape-Fast.png')" alt="" class="sign-shape-2" />
        </div>
        <img :src="asset('Sign-star-Shape-2_1Sign-star-Shape-2.png')" alt="" class="sign-shape-3" />
      </div>
    </section>

    <section class="sign-right-content-wrapper">
      <div class="sign-content-wrap">
        <div class="sign-content-inner">
          <RouterView />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const asset = (name: string) => `${import.meta.env.BASE_URL}images/${name}`
</script>
