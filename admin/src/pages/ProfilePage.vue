<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue"
import { api } from "@/services/api"
import { useAuthStore } from "@/stores/auth"

const auth = useAuthStore()

const isCurrentUserSuperAdmin = computed(() => {
  const userRoles = auth.user?.roles || []
  return userRoles.includes('super-admin')
})

function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    'super-admin': 'Full system access. Can manage all features, users, roles, and permissions.',
    'admin': 'Administrative access. Can manage most features except role deletion.',
    'staff': 'Limited access. Can manage content and listings.',
    'client': 'Client access. Can view and create listings.',
    'user': 'Standard user access. Can view listings and basic features.',
  }
  return descriptions[role] || 'Standard user access.'
}

interface ProfileSettings {
  name: string
  email: string
  phone: string
  bio: string
  department: string
  location: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  profilePicture: string
}

// Profile state
const profileSettings = ref<ProfileSettings>({
  name: "",
  email: "",
  phone: "",
  bio: "",
  department: "",
  location: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  profilePicture: "",
})

// Save states
const personalInfoSaveState = ref<'idle' | 'saving' | 'saved'>('idle')
const passwordSaveState = ref<'idle' | 'saving' | 'saved'>('idle')

// UI states
const profilePictureFile = ref<File | null>(null)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Debounce timer
let personalInfoDebounce: any = null

// Initialize profile data
function initializeProfileData() {
  if (auth.user) {
    profileSettings.value.name = auth.user.name || ""
    profileSettings.value.email = auth.user.email || ""
    profileSettings.value.phone = auth.user.phone || ""
    profileSettings.value.bio = auth.user.bio || ""
    profileSettings.value.department = auth.user.department || ""
    profileSettings.value.location = auth.user.location || ""
    if (auth.user.profile_picture) {
      let pictureUrl = auth.user.profile_picture
      if (!pictureUrl.startsWith('http')) {
        if (!pictureUrl.startsWith('/')) {
          pictureUrl = `/storage/${pictureUrl}`
        }
      }
      profileSettings.value.profilePicture = pictureUrl
    } else {
      profileSettings.value.profilePicture = ""
    }
  }
}

// Watch for real-time updates from auth store
watch(
  () => auth.user,
  (newUser) => {
    if (newUser) {
      profileSettings.value.name = newUser.name || ""
      profileSettings.value.email = newUser.email || ""
      profileSettings.value.phone = newUser.phone || ""
      profileSettings.value.bio = newUser.bio || ""
      profileSettings.value.department = newUser.department || ""
      profileSettings.value.location = newUser.location || ""
      if (newUser.profile_picture) {
        const pictureUrl = newUser.profile_picture.startsWith('http')
          ? newUser.profile_picture
          : newUser.profile_picture.startsWith('/')
            ? newUser.profile_picture
            : `/storage/${newUser.profile_picture}`
        profileSettings.value.profilePicture = pictureUrl
      } else {
        profileSettings.value.profilePicture = ""
      }
    }
  },
  { deep: true, immediate: true }
)

// Auto-save watcher for personal info
watch(
  () => ({
    name: profileSettings.value.name,
    email: profileSettings.value.email,
    phone: profileSettings.value.phone,
    bio: profileSettings.value.bio,
    department: profileSettings.value.department,
    location: profileSettings.value.location,
  }),
  () => {
    personalInfoSaveState.value = 'idle'
    if (personalInfoDebounce) clearTimeout(personalInfoDebounce)
    personalInfoDebounce = setTimeout(() => {
      savePersonalInfo()
    }, 1000)
  },
  { deep: true }
)

function handleProfilePictureChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files[0]) {
    profilePictureFile.value = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      profileSettings.value.profilePicture = e.target?.result as string
    }
    reader.readAsDataURL(files[0])
    // Auto-save profile picture
    uploadProfilePicture(files[0])
  }
}

async function uploadProfilePicture(file: File) {
  try {
    personalInfoSaveState.value = 'saving'
    const formData = new FormData()
    formData.append("profile_picture", file)

    const response = await api.post("/user/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    if (response.data && response.data.user) {
      const updatedUser = {
        id: auth.user?.id || response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone || "",
        bio: response.data.user.bio || "",
        department: response.data.user.department || "",
        location: response.data.user.location || "",
        role: response.data.user.role || auth.user?.role,
        profile_picture: response.data.user.profile_picture || null,
      }
      auth.setSession(auth.token, updatedUser)

      if (response.data.user.profile_picture) {
        profileSettings.value.profilePicture = response.data.user.profile_picture
      }

      personalInfoSaveState.value = 'saved'
      resetSaveState(personalInfoSaveState)
    }
  } catch (error: any) {
    personalInfoSaveState.value = 'idle'
  }
}

async function savePersonalInfo() {
  try {
    personalInfoSaveState.value = 'saving'
    const formData = new FormData()
    formData.append("name", profileSettings.value.name)
    formData.append("email", profileSettings.value.email)
    formData.append("phone", profileSettings.value.phone)
    formData.append("bio", profileSettings.value.bio)
    formData.append("department", profileSettings.value.department)
    formData.append("location", profileSettings.value.location)

    const response = await api.post("/user/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    if (response.data && response.data.user) {
      const updatedUser = {
        id: auth.user?.id || response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone || "",
        bio: response.data.user.bio || "",
        department: response.data.user.department || "",
        location: response.data.user.location || "",
        role: response.data.user.role || auth.user?.role,
        profile_picture: response.data.user.profile_picture || null,
      }
      auth.setSession(auth.token, updatedUser)

      personalInfoSaveState.value = 'saved'
      resetSaveState(personalInfoSaveState)
    }
  } catch (error: any) {
    personalInfoSaveState.value = 'idle'
  }
}

async function savePassword() {
  if (!profileSettings.value.currentPassword) {
    alert("Please enter your current password")
    return
  }

  if (!profileSettings.value.newPassword) {
    alert("Please enter a new password")
    return
  }

  if (profileSettings.value.newPassword !== profileSettings.value.confirmPassword) {
    alert("Passwords do not match")
    return
  }

  try {
    passwordSaveState.value = 'saving'
    const formData = new FormData()
    formData.append("current_password", profileSettings.value.currentPassword)
    formData.append("new_password", profileSettings.value.newPassword)
    formData.append("new_password_confirmation", profileSettings.value.confirmPassword)

    const response = await api.post("/user/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    if (response.data) {
      // Clear password fields
      profileSettings.value.currentPassword = ""
      profileSettings.value.newPassword = ""
      profileSettings.value.confirmPassword = ""
      profilePictureFile.value = null

      passwordSaveState.value = 'saved'
      resetSaveState(passwordSaveState)
      alert("Password changed successfully!")
    }
  } catch (error: any) {
    alert(error.response?.data?.message || "Failed to change password")
    passwordSaveState.value = 'idle'
  }
}

function resetSaveState(state: typeof personalInfoSaveState, delay = 2500) {
  setTimeout(() => {
    state.value = 'idle'
  }, delay)
}

onMounted(() => {
  initializeProfileData()
})
</script>

<template>
  <div class="profile-container">
    <!-- Header -->
    <div class="profile-header">
      <div>
        <h1 class="profile-title">Profile Settings</h1>
        <p class="profile-subtitle">Manage your personal information and account security</p>
      </div>
    </div>

    <!-- Profile Picture Card -->
    <div class="settings-card">
      <div class="card-header">
        <div class="card-header-content">
          <div class="card-icon">📸</div>
          <div>
            <h2 class="card-title">Profile Picture</h2>
            <p class="card-description">Upload or change your profile photo</p>
          </div>
        </div>
        <div :class="['save-indicator', personalInfoSaveState]">
          <i v-if="personalInfoSaveState === 'saving'" class="pi pi-spin pi-spinner"></i>
          <i v-if="personalInfoSaveState === 'saved'" class="pi pi-check"></i>
        </div>
      </div>
      <div class="card-body profile-picture-section">
        <div class="picture-wrapper">
          <div class="profile-picture-display">
            <img
              v-if="profileSettings.profilePicture"
              :src="profileSettings.profilePicture"
              :key="profileSettings.profilePicture"
              alt="Profile Picture"
              class="picture-image"
            />
            <span v-else class="picture-fallback">{{ profileSettings.name?.charAt(0) || 'A' }}</span>
          </div>
          <div class="picture-controls">
            <label class="upload-button">
              <input type="file" accept="image/*" class="hidden" @change="handleProfilePictureChange" />
              <i class="pi pi-cloud-upload"></i>
              Upload Picture
            </label>
            <p class="upload-hint">JPG, PNG, GIF, or WebP • Max 5MB</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Personal Information Card -->
    <div class="settings-card">
      <div class="card-header">
        <div class="card-header-content">
          <div class="card-icon">👤</div>
          <div>
            <h2 class="card-title">Personal Information</h2>
            <p class="card-description">Update your profile details</p>
          </div>
        </div>
        <div :class="['save-indicator', personalInfoSaveState]">
          <i v-if="personalInfoSaveState === 'saving'" class="pi pi-spin pi-spinner"></i>
          <i v-if="personalInfoSaveState === 'saved'" class="pi pi-check"></i>
        </div>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input
            v-model="profileSettings.name"
            type="text"
            class="form-input"
            placeholder="Enter your full name"
          />
          <p class="form-hint">Your complete name</p>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input
            v-model="profileSettings.email"
            type="email"
            class="form-input"
            placeholder="your@email.com"
          />
          <p class="form-hint">Your primary email address</p>
        </div>

        <div class="form-group-row">
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input
              v-model="profileSettings.phone"
              type="tel"
              class="form-input"
              placeholder="+1 (555) 000-0000"
            />
            <p class="form-hint">Contact phone number</p>
          </div>

          <div class="form-group">
            <label class="form-label">Department</label>
            <input
              v-model="profileSettings.department"
              type="text"
              class="form-input"
              placeholder="e.g., Engineering"
            />
            <p class="form-hint">Your department or team</p>
          </div>
        </div>

        <div class="form-group-row">
          <div class="form-group">
            <label class="form-label">Location</label>
            <input
              v-model="profileSettings.location"
              type="text"
              class="form-input"
              placeholder="City, Country"
            />
            <p class="form-hint">Your location</p>
          </div>

          <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea
              v-model="profileSettings.bio"
              class="form-textarea"
              placeholder="Tell us about yourself..."
              rows="2"
              maxlength="500"
            ></textarea>
            <p class="form-hint">{{ profileSettings.bio.length }}/500 characters</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Roles & Permissions Card -->
    <div class="settings-card">
      <div class="card-header">
        <div class="card-header-content">
          <div class="card-icon">🔐</div>
          <div>
            <h2 class="card-title">Roles & Permissions</h2>
            <p class="card-description">Your assigned role and permissions</p>
          </div>
        </div>
      </div>
      <div class="card-body">
        <!-- Current Role -->
        <div class="role-section">
          <h3 class="section-title">Your Role</h3>
          <div class="role-badge" :class="'role-' + (auth.user?.role || 'user')">
            <i class="pi pi-shield"></i>
            <span>{{ auth.user?.role ? auth.user.role.replace('-', ' ').toUpperCase() : 'USER' }}</span>
          </div>
          <p class="role-description">
            {{ getRoleDescription(auth.user?.role || 'user') }}
          </p>
        </div>

        <!-- Permissions -->
        <div class="permissions-section">
          <h3 class="section-title">Your Permissions</h3>
          <div v-if="auth.user?.permissions && auth.user.permissions.length > 0" class="permissions-grid">
            <div v-for="permission in auth.user.permissions" :key="permission" class="permission-badge">
              <i class="pi pi-check-circle"></i>
              <span>{{ permission }}</span>
            </div>
          </div>
          <div v-else class="empty-permissions">
            <p>No specific permissions assigned. Contact administrator for details.</p>
          </div>
        </div>

        <!-- Admin Note -->
        <div v-if="isCurrentUserSuperAdmin" class="admin-note">
          <div class="note-header">
            <i class="pi pi-info-circle"></i>
            <span>Super Admin Only</span>
          </div>
          <p>As a Super Admin, you can manage user roles and permissions from the <RouterLink to="/admin/roles" class="admin-link">Roles & Permissions page</RouterLink>.</p>
        </div>
      </div>
    </div>

    <!-- Change Password Card -->
    <div class="settings-card">
      <div class="card-header">
        <div class="card-header-content">
          <div class="card-icon">🔒</div>
          <div>
            <h2 class="card-title">Change Password</h2>
            <p class="card-description">Update your password to secure your account</p>
          </div>
        </div>
        <div :class="['save-indicator', passwordSaveState]">
          <i v-if="passwordSaveState === 'saving'" class="pi pi-spin pi-spinner"></i>
          <i v-if="passwordSaveState === 'saved'" class="pi pi-check"></i>
        </div>
      </div>
      <div class="card-body">
        <p class="form-hint mb-6">Leave blank to keep your current password. You must provide your current password to set a new one.</p>

        <div class="form-group">
          <label class="form-label">Current Password</label>
          <div class="password-input-wrapper">
            <input
              v-model="profileSettings.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Enter current password"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showCurrentPassword = !showCurrentPassword"
              :title="showCurrentPassword ? 'Hide password' : 'Show password'"
            >
              <i :class="showCurrentPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">New Password</label>
          <div class="password-input-wrapper">
            <input
              v-model="profileSettings.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Enter new password"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showNewPassword = !showNewPassword"
              :title="showNewPassword ? 'Hide password' : 'Show password'"
            >
              <i :class="showNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <div class="password-input-wrapper">
            <input
              v-model="profileSettings.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
              :title="showConfirmPassword ? 'Hide password' : 'Show password'"
            >
              <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <div class="button-group">
          <button class="btn-primary" @click="savePassword" :disabled="passwordSaveState === 'saving'">
            <i class="pi pi-check"></i>
            {{ passwordSaveState === 'saving' ? 'Saving...' : 'Update Password' }}
          </button>
          <button
            class="btn-secondary"
            @click="() => {
              profileSettings.currentPassword = ''
              profileSettings.newPassword = ''
              profileSettings.confirmPassword = ''
            }"
          >
            <i class="pi pi-times"></i>
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
}

/* Header */
.profile-header {
  margin-bottom: 2rem;
}

.profile-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.profile-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

/* Card Container */
.settings-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.settings-card:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 1px solid #e5e7eb;
}

.card-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  font-size: 1.75rem;
  line-height: 1;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.card-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

/* Save Indicator */
.save-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.save-indicator.idle {
  opacity: 0;
}

.save-indicator.saving {
  background: #f0f9ff;
  color: #0369a1;
  opacity: 1;
}

.save-indicator.saved {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  opacity: 1;
}

/* Card Body */
.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Profile Picture Section */
.profile-picture-section {
  padding: 2rem;
}

.picture-wrapper {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.profile-picture-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-size: 2rem;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.picture-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.picture-fallback {
  line-height: 1;
}

.picture-controls {
  flex: 1;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.upload-button:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.upload-hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0.75rem 0 0 0;
}

/* Forms */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.form-input,
.form-textarea {
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-hint {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
  margin-top: 0.25rem;
}

/* Password Input */
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .form-input {
  padding-right: 2.75rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0.375rem;
}

.password-toggle:hover {
  color: #1f2937;
  background: #f3f4f6;
}

/* Buttons */
.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-secondary:hover {
  background: #e5e7eb;
  color: #1f2937;
}

/* Roles & Permissions Styles */
.role-section,
.permissions-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  width: fit-content;
  border: 2px solid;
}

.role-super-admin {
  background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%);
  color: #92400e;
  border-color: #fcd34d;
}

.role-admin {
  background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%);
  color: #1e40af;
  border-color: #93c5fd;
}

.role-staff {
  background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%);
  color: #065f46;
  border-color: #a7f3d0;
}

.role-client {
  background: linear-gradient(135deg, #fae8ff 0%, #f3e8ff 100%);
  color: #6b21a8;
  border-color: #e9d5ff;
}

.role-user {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border-color: #d1d5db;
}

.role-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.permission-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid #a7f3d0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #065f46;
  text-transform: capitalize;
}

.permission-badge i {
  color: #10b981;
  font-size: 1rem;
}

.empty-permissions {
  padding: 2rem;
  background: #f9fafb;
  border: 1px dashed #e5e7eb;
  border-radius: 0.5rem;
  text-align: center;
}

.empty-permissions p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.admin-note {
  padding: 1.25rem;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fcd34d;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.note-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.note-header i {
  font-size: 1.125rem;
}

.admin-note p {
  font-size: 0.875rem;
  color: #92400e;
  margin: 0;
  line-height: 1.5;
}

.admin-link {
  color: #d97706;
  text-decoration: underline;
  font-weight: 600;
  transition: color 0.2s ease;
}

.admin-link:hover {
  color: #b45309;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .picture-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .form-group-row {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .permissions-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .role-badge {
    font-size: 0.85rem;
    padding: 0.625rem 1rem;
  }
}
</style>
