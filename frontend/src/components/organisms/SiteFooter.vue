<template>
  <footer class="border-t border-[var(--border-color)] bg-[var(--primary-color)] pt-10 text-white md:pt-14">
    <div class="container">
      <div class="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
        <form class="w-full max-w-[570px] lg:flex-1" aria-label="Newsletter signup">
          <label for="footer-email" class="mb-2 block text-[18px] leading-tight">Subscribe to our newsletter</label>
          <div class="flex flex-col gap-3 sm:flex-row">
            <input
              id="footer-email"
              class="h-[52px] min-w-0 flex-1 rounded-[8px] border-0 bg-white px-5 text-[16px] text-[var(--primary-color-80)] outline-none"
              type="email"
              placeholder="Enter your email"
            />
            <button
              class="h-[52px] rounded-[8px] bg-[var(--yellow)] px-7 text-[16px] font-medium text-[var(--primary-color)]"
              type="submit"
            >
              Subscribe
            </button>
          </div>
        </form>

        <RouterLink to="/" aria-label="Zaidic home" class="shrink-0">
          <img src="/assets/images/Sign-Logo.svg" alt="Zaidic" class="h-auto w-[142px]" />
        </RouterLink>

        <div class="flex shrink-0 items-center gap-3">
          <span class="[font-family:var(--marcellus-font-family)] text-[24px] leading-none text-black">Follow Us</span>
          <a class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] text-black" href="https://www.facebook.com/" target="_blank" aria-label="Facebook">
            <i class="pi pi-facebook" aria-hidden="true"></i>
          </a>
          <a class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] text-black" href="https://twitter.com/" target="_blank" aria-label="Twitter">
            <i class="pi pi-twitter" aria-hidden="true"></i>
          </a>
          <a class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] text-black" href="https://www.instagram.com/" target="_blank" aria-label="Instagram">
            <i class="pi pi-instagram" aria-hidden="true"></i>
          </a>
        </div>

        <a class="flex min-w-0 items-center justify-center gap-2 text-[16px] text-black" href="mailto:info@kukaqka.com">
          <img src="/assets/images/mail.svg" alt="" class="h-5 w-5 shrink-0" />
          <span class="truncate">info@kukaqka.com</span>
        </a>
      </div>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-x-1 border-t border-[var(--border-color)] py-3 text-center text-[12px] leading-snug text-black">
        <span>Copyright 2026 - kukaqka.com</span>
        <span>Made with</span>
        <img src="/assets/images/Design-ohne-Titel---2026-04-16T165756.855.png" alt="" class="h-8 w-auto max-w-[120px] object-contain" />
      </div>
    </div>
  </footer>
</template>
