<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue"
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import Toast from "primevue/toast"
import { useToast } from "primevue/usetoast"
import { api } from "@/services/api"
import { useAuthStore } from "@/stores/auth"

const toast = useToast()
const auth = useAuthStore()

// Profile Settings
const profileSettings = ref({
  name: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  profilePicture: "",
})
const profileLoading = ref(false)
const profilePictureFile = ref<File | null>(null)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Initialize profile data from auth store
function initializeProfileData() {
  if (auth.user) {
    profileSettings.value.name = auth.user.name || ""
    profileSettings.value.email = auth.user.email || ""
    if (auth.user.profile_picture) {
      // Ensure URL is correct
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
      if (newUser.profile_picture) {
        const pictureUrl = newUser.profile_picture.startsWith('http') ? newUser.profile_picture : (newUser.profile_picture.startsWith('/') ? newUser.profile_picture : `/storage/${newUser.profile_picture}`)
        profileSettings.value.profilePicture = pictureUrl
      } else {
        profileSettings.value.profilePicture = ""
      }
    }
  },
  { deep: true, immediate: true }
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
  }
}

async function saveProfileSettings() {
  if (profileSettings.value.newPassword && profileSettings.value.newPassword !== profileSettings.value.confirmPassword) {
    toast.add({ severity: "error", summary: "Error", detail: "Passwords do not match" })
    return
  }

  try {
    profileLoading.value = true
    const formData = new FormData()
    formData.append("name", profileSettings.value.name)
    formData.append("email", profileSettings.value.email)
    if (profileSettings.value.currentPassword) {
      formData.append("current_password", profileSettings.value.currentPassword)
    }
    if (profileSettings.value.newPassword) {
      formData.append("new_password", profileSettings.value.newPassword)
      formData.append("new_password_confirmation", profileSettings.value.confirmPassword)
    }
    if (profilePictureFile.value) {
      formData.append("profile_picture", profilePictureFile.value)
    }

    const response = await api.post("/user/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    if (response.data && response.data.user) {
      // Update auth store using setSession to properly persist to localStorage
      const updatedUser = {
        id: auth.user?.id || response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role || auth.user?.role,
        profile_picture: response.data.user.profile_picture || null
      }
      auth.setSession(auth.token, updatedUser)

      // Explicitly update profile picture from server response to show real-time preview
      if (response.data.user.profile_picture) {
        profileSettings.value.profilePicture = response.data.user.profile_picture
      }

      // Clear password fields
      profileSettings.value.currentPassword = ""
      profileSettings.value.newPassword = ""
      profileSettings.value.confirmPassword = ""
      profilePictureFile.value = null

      toast.add({ severity: "success", summary: "Success", detail: "Profile updated successfully" })
    }
  } catch (error: any) {
    console.error("Failed to save profile:", error)
    console.error("API Response Status:", error.response?.status)
    console.error("API Response URL:", error.config?.url)
    console.error("API Response Data:", error.response?.data)
    const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to update profile"
    toast.add({ severity: "error", summary: "Error", detail: errorMessage })
  } finally {
    profileLoading.value = false
  }
}

onMounted(() => {
  // Initialize profile data from auth store
  initializeProfileData()
})
</script>

<template>
  <div class="profile-page">
    <Toast />
    <div class="profile-header">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Profile Settings</h1>
      <p class="text-gray-600">Manage your personal information and account security</p>
    </div>

    <div class="profile-container">
      <div class="cms-card p-8">
        <div class="max-w-2xl">
          <div class="space-y-8">
            <!-- Profile Picture Section -->
            <div class="border-b pb-8">
              <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <i class="pi pi-image text-blue-500"></i>
                Profile Picture
              </h2>
              <div class="flex items-center gap-8">
                <div class="h-32 w-32 rounded-xl bg-linear-to-br from-(--admin-primary) to-(--admin-primary-strong) flex items-center justify-center text-white text-5xl font-bold overflow-hidden shadow-lg relative">
                  <img
                    v-if="profileSettings.profilePicture"
                    :key="profileSettings.profilePicture"
                    :src="profileSettings.profilePicture"
                    alt="Profile"
                    class="w-full h-full object-cover"
                  />
                  <span v-show="!profileSettings.profilePicture" class="absolute inset-0 flex items-center justify-center">
                    {{ profileSettings.name?.charAt(0) || 'A' }}
                  </span>
                </div>
                <div class="flex-1">
                  <label class="block">
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleProfilePictureChange"
                    />
                    <span class="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors font-semibold">
                      <i class="pi pi-upload mr-2"></i>
                      Upload Picture
                    </span>
                  </label>
                  <p class="text-sm text-gray-500 mt-3">JPG, PNG, GIF, or WebP</p>
                  <p class="text-xs text-gray-400">Max 5MB</p>
                </div>
              </div>
            </div>

            <!-- Personal Information Section -->
            <div class="border-b pb-8">
              <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <i class="pi pi-user text-green-500"></i>
                Personal Information
              </h2>
              <div class="space-y-6">
                <div>
                  <label class="block font-semibold mb-2 text-gray-700">Full Name</label>
                  <InputText v-model="profileSettings.name" class="w-full" placeholder="Your full name" />
                </div>

                <div>
                  <label class="block font-semibold mb-2 text-gray-700">Email Address</label>
                  <InputText v-model="profileSettings.email" type="email" class="w-full" placeholder="your@email.com" />
                </div>
              </div>
            </div>

            <!-- Password Section -->
            <div class="border-b pb-8">
              <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <i class="pi pi-lock text-red-500"></i>
                Change Password
              </h2>
              <p class="text-sm text-gray-600 mb-6">Update your password to keep your account secure. Leave blank to keep current password.</p>
              <div class="space-y-6">
                <div>
                  <label class="block font-semibold mb-2 text-gray-700">Current Password</label>
                  <div class="relative">
                    <InputText
                      v-model="profileSettings.currentPassword"
                      :type="showCurrentPassword ? 'text' : 'password'"
                      class="w-full pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      @click="showCurrentPassword = !showCurrentPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      :title="showCurrentPassword ? 'Hide password' : 'Show password'"
                    >
                      <i :class="showCurrentPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block font-semibold mb-2 text-gray-700">New Password</label>
                  <div class="relative">
                    <InputText
                      v-model="profileSettings.newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      class="w-full pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      @click="showNewPassword = !showNewPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      :title="showNewPassword ? 'Hide password' : 'Show password'"
                    >
                      <i :class="showNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block font-semibold mb-2 text-gray-700">Confirm Password</label>
                  <div class="relative">
                    <InputText
                      v-model="profileSettings.confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="w-full pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      :title="showConfirmPassword ? 'Hide password' : 'Show password'"
                    >
                      <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 pt-4">
              <Button label="Save Changes" icon="pi pi-save" class="p-button-success" @click="saveProfileSettings" :loading="profileLoading" />
              <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="() => {
                profileSettings.currentPassword = ''
                profileSettings.newPassword = ''
                profileSettings.confirmPassword = ''
              }" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.profile-header {
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.profile-container {
  padding: 0 2rem 2rem;
}

:deep(.p-inputtext) {
  border-radius: 6px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

:deep(.p-inputtext:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.p-button) {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.p-button-success) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
}

:deep(.p-button-success:hover) {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

:deep(.p-button-text) {
  color: #6b7280;
}

:deep(.p-button-text:hover) {
  background-color: #f3f4f6;
}
</style>
