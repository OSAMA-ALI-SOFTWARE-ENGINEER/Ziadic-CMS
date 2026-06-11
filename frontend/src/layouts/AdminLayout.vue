<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from 'primevue/sidebar'
import Button from 'primevue/button'
import Menu from 'primevue/menu'

const router = useRouter()
const authStore = useAuthStore()
const sidebarVisible = ref(false)
const userMenuRef = ref()

const menuItems = computed(() => [
  {
    label: 'Dashboard',
    icon: 'pi pi-fw pi-home',
    to: '/admin/dashboard',
  },
  {
    label: 'Listings',
    icon: 'pi pi-fw pi-list',
    to: '/admin/listings',
  },
  {
    label: 'Submissions',
    icon: 'pi pi-fw pi-inbox',
    to: '/admin/submissions',
  },
  {
    label: 'Users',
    icon: 'pi pi-fw pi-users',
    to: '/admin/users',
  },
  {
    label: 'Activity',
    icon: 'pi pi-fw pi-history',
    to: '/admin/activity',
  },
  {
    label: 'Settings',
    icon: 'pi pi-fw pi-cog',
    to: '/admin/settings',
  },
])

const userMenu = computed(() => [
  {
    label: 'Dashboard',
    icon: 'pi pi-user',
    command: () => router.push('/dashboard'),
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: () => {
      authStore.logout()
      router.push('/login')
    },
  },
])

function toggleUserMenu(event: Event) {
  userMenuRef.value?.toggle(event)
}
</script>

<template>
  <div class="admin-layout">
    <!-- Header -->
    <header class="admin-header">
      <div class="admin-header-left">
        <Button
          icon="pi pi-bars"
          class="admin-menu-toggle"
          text
          rounded
          @click="sidebarVisible = true"
        />
        <router-link to="/admin/dashboard" class="admin-logo">Zaidic Admin</router-link>
      </div>

      <div class="admin-header-right">
        <Button
          :label="authStore.user?.name || 'User'"
          icon="pi pi-user"
          class="admin-user-btn"
          text
          rounded
          @click="toggleUserMenu"
        />
        <Menu ref="userMenuRef" :model="userMenu" popup />
      </div>
    </header>

    <div class="admin-container">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <nav class="admin-nav">
          <router-link
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="admin-nav-item"
            active-class="active"
          >
            <i :class="item.icon" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- Mobile Sidebar -->
      <Sidebar v-model:visible="sidebarVisible" position="left" class="admin-sidebar-mobile">
        <nav class="admin-nav">
          <router-link
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="admin-nav-item"
            active-class="active"
            @click="sidebarVisible = false"
          >
            <i :class="item.icon" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </Sidebar>

      <!-- Main Content -->
      <main class="admin-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.admin-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #c41e3a;
  text-decoration: none;
  transition: color 0.2s;
}

.admin-logo:hover {
  color: #a01730;
}

.admin-menu-toggle {
  display: none;
}

.admin-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-user-btn {
  font-size: 0.875rem;
}

.admin-container {
  display: flex;
  flex: 1;
}

.admin-sidebar {
  width: 240px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  padding: 1.5rem 0;
  position: sticky;
  top: 65px;
  height: calc(100vh - 65px);
  overflow-y: auto;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.admin-nav-item:hover {
  background-color: #f5f5f5;
  color: #c41e3a;
}

.admin-nav-item.active {
  background-color: #ffe0e6;
  color: #c41e3a;
  border-right: 3px solid #c41e3a;
}

.admin-nav-item i {
  width: 20px;
  text-align: center;
}

.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.admin-sidebar-mobile {
  display: none;
}

@media (max-width: 768px) {
  .admin-header {
    padding: 1rem;
  }

  .admin-logo {
    font-size: 1.1rem;
  }

  .admin-menu-toggle {
    display: inline-flex;
  }

  .admin-container {
    position: relative;
  }

  .admin-sidebar {
    display: none;
  }

  .admin-sidebar-mobile {
    display: flex;
  }

  .admin-main {
    padding: 1.5rem;
  }
}
</style>
