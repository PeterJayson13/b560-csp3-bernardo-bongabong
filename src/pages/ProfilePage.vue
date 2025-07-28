<template>
  <div class="profile-container">
    <div class="profile-content">
      <h1 class="profile-title">User Profile</h1>

      <div v-if="isLoggedIn">
        <div v-if="!editMode" class="profile-details">
          <p class="detail-item">
            <span class="detail-label">User ID:</span>
            <span class="detail-value">{{ currentUserId }}</span>
          </p>
          <p class="detail-item">
            <span class="detail-label">Email:</span>
            <span class="detail-value">{{ userProfile.email || 'N/A' }}</span>
          </p>
          <p class="detail-item">
            <span class="detail-label">Full Name:</span>
            <span class="detail-value">{{ fullName || 'N/A' }}</span>
          </p>
          <p class="detail-item">
            <span class="detail-label">Mobile No:</span>
            <span class="detail-value">{{ userProfile.mobileNo || 'N/A' }}</span>
          </p>
          <p class="detail-item">
            <span class="detail-label">Login Status:</span>
            <span class="detail-value text-green-600 font-semibold">Logged In</span>
          </p>
          <p v-if="isAdminUser" class="detail-item">
            <span class="detail-label">Role:</span>
            <span class="detail-value text-blue-600 font-semibold">Administrator</span>
          </p>
          <button @click="toggleEditMode" class="edit-button">Edit Profile</button>
        </div>

        <div v-else class="profile-edit-form">
          <div class="form-group">
            <label for="editEmail" class="form-label">Email:</label>
            <input type="email" id="editEmail" v-model="editableProfile.email" class="form-input" />
          </div>
          <div class="form-group">
            <label for="editFirstName" class="form-label">First Name:</label>
            <input type="text" id="editFirstName" v-model="editableProfile.firstName" class="form-input" />
          </div>
          <div class="form-group">
            <label for="editLastName" class="form-label">Last Name:</label>
            <input type="text" id="editLastName" v-model="editableProfile.lastName" class="form-input" />
          </div>
          <div class="form-group">
            <label for="editMobileNo" class="form-label">Mobile Number:</label>
            <input type="text" id="editMobileNo" v-model="editableProfile.mobileNo" class="form-input" maxlength="11" />
          </div>
          <div class="form-actions">
            <button @click="saveProfile" class="save-button" :disabled="isLoading">Save Changes</button>
            <button @click="cancelEdit" class="cancel-button" :disabled="isLoading">Cancel</button>
          </div>
        </div>
      </div>
      <div v-else class="not-logged-in">
        <p class="text-red-600 font-semibold mb-4">You must be logged in to view this page.</p>
        <router-link to="/login" class="login-button">Go to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGlobalStore } from '../stores/global';
import { useRouter } from 'vue-router';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const globalStore = useGlobalStore();
const router = useRouter();
const notyf = new Notyf({ duration: 3000, position: { x: 'right', y: 'bottom' } });

const isLoggedIn = computed(() => globalStore.isLoggedIn);
const currentUserId = computed(() => globalStore.currentUserId);
const isAdminUser = computed(() => globalStore.isAdminUser);
const authToken = computed(() => globalStore.token);

const userProfile = ref({
  email: '',
  firstName: '',
  lastName: '',
  mobileNo: '',
});

const editableProfile = ref({ ...userProfile.value });
const editMode = ref(false);
const isLoading = ref(false);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// FIX: Create a computed property to combine firstName and lastName for display
const fullName = computed(() => {
  return [userProfile.value.firstName, userProfile.value.lastName].filter(Boolean).join(' ');
});

const fetchUserProfile = async () => {
  if (!isLoggedIn.value || !authToken.value) {
    console.log("Not logged in, skipping profile fetch.");
    userProfile.value = { email: '', firstName: '', lastName: '', mobileNo: '' };
    editableProfile.value = { ...userProfile.value };
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/users/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`,
      },
    });

    if (response.status === 401) {
      globalStore.logout();
      notyf.error('Session expired. Please log in again.');
      router.push('/login');
      return;
    }

    const data = await response.json();
    if (response.ok) {
      userProfile.value = {
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        mobileNo: data.mobileNo || '',
      };
      editableProfile.value = { ...userProfile.value };
      notyf.success('Profile loaded successfully.');
    } else {
      console.error('Failed to fetch profile:', data.message || 'Unknown error');
      notyf.error(data.message || 'Failed to load profile.');
    }
  } catch (error) {
    console.error('Network error fetching profile:', error);
    notyf.error(`Network error: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

const toggleEditMode = () => {
  editMode.value = !editMode.value;
  if (editMode.value) {
    editableProfile.value = { ...userProfile.value };
  }
};

const cancelEdit = () => {
  editMode.value = false;
  editableProfile.value = { ...userProfile.value };
};

const saveProfile = async () => {
  if (!isLoggedIn.value || !authToken.value) {
    notyf.error('You must be logged in to save changes.');
    return;
  }
  isLoading.value = true;
  try {
    const updatePayload = {
      email: editableProfile.value.email,
      firstName: editableProfile.value.firstName,
      lastName: editableProfile.value.lastName,
      mobileNo: editableProfile.value.mobileNo,
    };

    const response = await fetch(`${API_BASE_URL}/users/update-profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`,
      },
      body: JSON.stringify(updatePayload),
    });

    if (response.status === 401) {
      globalStore.logout();
      notyf.error('Session expired. Please log in again.');
      router.push('/login');
      return;
    }

    const data = await response.json();
    if (response.ok) {
      await fetchUserProfile();
      editMode.value = false;
      notyf.success(data.message || 'Profile updated successfully!');
    } else {
      console.error('Failed to update profile:', data.message || 'Unknown error');
      notyf.error(data.message || 'Failed to update profile.');
    }
  } catch (error) {
    console.error('Network error updating profile:', error);
    notyf.error(`Network error: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

watch(isLoggedIn, (newVal) => {
  if (newVal) {
    fetchUserProfile();
  }
}, { immediate: true });

onMounted(() => {
  // Any other setup that needs to run only once after component is mounted
});
</script>

<style scoped>
/* (The CSS remains unchanged) */
.profile-container {
  min-height: 100vh;
  background-color: #f8fafc; /* bg-gray-100 */
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align to top */
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.profile-content {
  width: 100%;
  max-width: 600px;
  background: white;
  padding: 2.5rem; /* p-10 */
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
  margin-top: 3rem; /* Add some top margin */
}

.profile-title {
  font-size: 2.5rem; /* text-4xl */
  font-weight: bold;
  color: #1f2937; /* text-gray-800 */
  margin-bottom: 2rem; /* mb-8 */
}

.profile-details {
  background-color: #f3f4f6; /* bg-gray-100 */
  padding: 1.5rem; /* p-6 */
  border-radius: 8px;
  text-align: left;
  margin-bottom: 2rem;
}

.detail-item {
  font-size: 1.1rem;
  color: #374151; /* text-gray-700 */
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed #e5e7eb;
}

.detail-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #1f2937;
  flex-basis: 30%; /* Adjust as needed */
}

.detail-value {
  flex-basis: 65%; /* Adjust as needed */
  text-align: right;
  word-wrap: break-word; /* Ensure long IDs wrap */
}

.not-logged-in {
  padding: 1.5rem;
  background-color: #fef2f2; /* bg-red-50 */
  border: 1px solid #ef4444; /* border-red-500 */
  border-radius: 8px;
  color: #b91c1c; /* text-red-700 */
  text-align: center;
}

.login-button {
  display: inline-block;
  background-color: #3b82f6; /* bg-blue-500 */
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px; /* rounded-full */
  text-decoration: none;
  font-weight: bold;
  margin-top: 1rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.login-button:hover {
  background-color: #2563eb; /* bg-blue-600 */
  transform: translateY(-2px);
}

/* Edit Form Styles */
.profile-edit-form {
  background-color: #f3f4f6;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: left;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  color: #1f2937;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.edit-button, .save-button, .cancel-button {
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.edit-button {
  background-color: #3b82f6;
  color: white;
  margin-top: 1rem;
}

.edit-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}

.save-button {
  background-color: #10b981;
  color: white;
}

.save-button:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-2px);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #ef4444;
  color: white;
}

.cancel-button:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-2px);
}

.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>