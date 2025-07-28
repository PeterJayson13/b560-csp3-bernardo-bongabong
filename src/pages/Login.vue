<template>
  <div class="form-container">
    <h2 class="form-title">Login</h2>

    <form @submit.prevent="handleLogin" class="form-fields">
      <div class="form-group">
        <label for="loginEmail" class="form-label">Email address</label>
        <input
          type="email"
          id="loginEmail"
          v-model="email"
          placeholder="Email"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="loginPassword" class="form-label">Password</label>
        <input
          type="password"
          id="loginPassword"
          v-model="password"
          placeholder="Password"
          required
          class="form-input"
        />
      </div>

      <button type="submit" class="form-button">Submit</button>
    </form>

    <div class="google-login-container">
      <div id="google-signin-button"></div>
    </div>

    <p class="form-switch-text">
      Don't have an account?
      <router-link to="/register" class="form-switch-button">
        Register here
      </router-link>
    </p>

    <div
      v-if="message.text"
      :class="['message-box', message.type === 'success' ? 'message-success' : 'message-error']"
    >
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../stores/global';

const router = useRouter();
const globalStore = useGlobalStore();

const email = ref('');
const password = ref('');
const message = reactive({ text: '', type: '' });

const emit = defineEmits(['switch-page', 'login-success']);

onMounted(() => {
  if (window.google) {
    initializeGoogleSignIn();
  } else {
    window.onload = initializeGoogleSignIn;
  }
});

function initializeGoogleSignIn() {
  window.google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: handleGoogleLogin,
  });

  window.google.accounts.id.renderButton(
    document.getElementById("google-signin-button"),
    { theme: "outline", size: "large", type: "standard", width: 300 }
  );
}

// Handles standard email/password login
async function handleLogin() {
  message.text = '';
  message.type = '';

  try {
    const response = await fetch('http://localhost:4000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

    const data = await response.json();

    if (response.ok && data.access) {
      message.text = data.message || 'Login successful!';
      message.type = 'success';

      const token = data.access;
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const isAdmin = decodedPayload.isAdmin;
      const userId = decodedPayload.id;

      globalStore.login(token, isAdmin, userId, email.value); // <-- Pass the email value
      emit('login-success', token);

      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else {
      message.text = data.error || data.message || 'Login failed. Please check your credentials.';
      message.type = 'error';
    }
  } catch (error) {
    message.text = 'An error occurred during login. Please try again.';
    message.type = 'error';
    console.error('Login error:', error);
  }
}

// Handles the response from Google Sign-In
async function handleGoogleLogin(response) {
  message.text = '';
  message.type = '';

  try {
    const res = await fetch('http://localhost:4000/users/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: response.credential }),
    });

    const data = await res.json();

    if (res.ok && data.auth) {
      message.text = data.message || 'Google login successful!';
      message.type = 'success';

      const token = data.auth;
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const isAdmin = decodedPayload.isAdmin;
      const userId = decodedPayload.id;
      const userEmail = decodedPayload.email; // <-- Assuming Google payload includes email

      globalStore.login(token, isAdmin, userId, userEmail); // <-- Pass the email value
      emit('login-success', token);

      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else {
      message.text = data.message || 'Google login failed. Please try again.';
      message.type = 'error';
    }
  } catch (error) {
    message.text = 'An error occurred during Google login. Please try again.';
    message.type = 'error';
    console.error('Google login error:', error);
  }
}
</script>


<style scoped>
.form-container {
  background-color: #ffffff;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
  text-align: center;
  margin: auto;
}

.form-title {
  font-size: 32px;
  font-weight: normal;
  color: #333;
  margin-bottom: 30px;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  text-align: left;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
}

.form-input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px 12px;
  width: 100%;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #5cb85c;
}

.form-button {
  background-color: #007bff;
  color: #ffffff;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.form-button:hover {
  background-color: #0056b3;
}

.google-login-container {
  margin-top: 20px;
}

.form-switch-text {
  margin-top: 25px;
  font-size: 14px;
  color: #666;
}

.form-switch-button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  text-decoration: underline;
}

.form-switch-button:hover {
  color: #0056b3;
}

.message-box {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-weight: 500;
  text-align: center;
}
.message-success {
  background-color: #d1fae5;
  color: #065f46;
}
.message-error {
  background-color: #fee2e2;
  color: #991b1b;
}
</style>