<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Card } from 'primevue/card'
import { Button } from 'primevue/button'

const router = useRouter()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.isAdmin)

function logout() {
  authStore.logout()
  router.push('/login')
}

function goToAdmin() {
  router.push('/admin/dashboard')
}
</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-container">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1 class="header-title">Welcome, {{ authStore.user?.name }}!</h1>
          <p class="header-subtitle">Manage your account and submissions</p>
        </div>
        <Button
          icon="pi pi-sign-out"
          label="Logout"
          severity="secondary"
          @click="logout"
        />
      </header>

      <!-- Admin Access -->
      <Card v-if="isAdmin" class="admin-card">
        <template #header>
          <div class="card-header">
            <h2 class="card-title">Admin Access</h2>
          </div>
        </template>

        <template #content>
          <p class="card-description">You have admin privileges. Access the admin dashboard to manage listings, users, and site settings.</p>
          <Button
            label="Go to Admin Dashboard"
            icon="pi pi-arrow-right"
            @click="goToAdmin"
            class="action-btn"
          />
        </template>
      </Card>

      <!-- User Profile Card -->
      <Card class="profile-card">
        <template #header>
          <div class="card-header">
            <h2 class="card-title">Profile Information</h2>
          </div>
        </template>

        <template #content>
          <div class="profile-info">
            <div class="info-group">
              <label class="info-label">Name</label>
              <p class="info-value">{{ authStore.user?.name }}</p>
            </div>

            <div class="info-group">
              <label class="info-label">Email</label>
              <p class="info-value">{{ authStore.user?.email }}</p>
            </div>

            <div v-if="authStore.user?.phone" class="info-group">
              <label class="info-label">Phone</label>
              <p class="info-value">{{ authStore.user?.phone }}</p>
            </div>

            <div class="info-group">
              <label class="info-label">Account Status</label>
              <p class="info-value">
                <span class="badge badge-success">{{ authStore.user?.status }}</span>
              </p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Quick Links -->
      <Card class="quick-links-card">
        <template #header>
          <div class="card-header">
            <h2 class="card-title">Quick Links</h2>
          </div>
        </template>

        <template #content>
          <div class="quick-links">
            <router-link to="/listings" class="quick-link-item">
              <i class="pi pi-list" />
              <span>Browse Listings</span>
            </router-link>

            <router-link to="/about" class="quick-link-item">
              <i class="pi pi-info-circle" />
              <span>About Us</span>
            </router-link>

            <router-link to="/blogs" class="quick-link-item">
              <i class="pi pi-book" />
              <span>Blog</span>
            </router-link>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdf5ed 0%, #fff0f5 100%);
  padding: 2rem 1rem;
}

.dashboard-container {
  max-width: 900px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.header-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.admin-card {
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f5 100%);
  border: 2px solid #c41e3a;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(196, 30, 58, 0.1);
}

.card-header {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.card-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.action-btn {
  width: 100%;
  padding: 0.75rem;
}

.profile-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: none;
  margin-bottom: 2rem;
}

.quick-links-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: none;
}

.profile-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1.5rem;
}

.info-group {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.info-value {
  font-size: 1rem;
  color: #1a1a1a;
  margin: 0;
  word-break: break-word;
}

.badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-success {
  background-color: #d4edda;
  color: #155724;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.quick-link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #1a1a1a;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.quick-link-item:hover {
  background: #fff;
  border-color: #c41e3a;
  color: #c41e3a;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(196, 30, 58, 0.1);
}

.quick-link-item i {
  font-size: 1.75rem;
}

.quick-link-item span {
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-title {
    font-size: 1.5rem;
  }

  .profile-info {
    grid-template-columns: 1fr;
  }

  .quick-links {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
