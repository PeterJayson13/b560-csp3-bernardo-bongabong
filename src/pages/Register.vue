<template>
  <div class="form-container">
    <h2 class="form-title">Register</h2>

    <form @submit.prevent="handleRegister" class="form-fields">
      <div class="form-group">
        <label for="firstName" class="form-label">First Name</label>
        <input
          type="text"
          id="firstName"
          v-model="firstName"
          placeholder="Enter your first name"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="lastName" class="form-label">Last Name</label>
        <input
          type="text"
          id="lastName"
          v-model="lastName"
          placeholder="Enter your last name"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="email" class="form-label">Email Address</label>
        <input
          type="email"
          id="email"
          v-model="email"
          placeholder="Enter your email"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="mobileNo" class="form-label">Mobile Number</label>
        <input
          type="text"
          id="mobileNo"
          v-model="mobileNo"
          placeholder="09123456789"
          required
          class="form-input"
          maxlength="11"
        />
      </div>

      <div class="form-group">
        <label for="password" class="form-label">Password</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="Choose a password"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword" class="form-label">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          placeholder="Confirm your password"
          required
          class="form-input"
        />
      </div>

      <button type="submit" class="form-button">Submit</button>
    </form>

    <p class="form-switch-text">
      Already have an account?
      <button @click="goToLogin" class="form-switch-button">
        Login here
      </button>
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router'; // ✅ Step 1: Import

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const mobileNo = ref('');
const password = ref('');
const confirmPassword = ref('');
const message = reactive({ text: '', type: '' });

const router = useRouter(); // ✅ Step 2: Initialize

const goToLogin = () => {
  router.push('/login');
};

async function handleRegister() {
  message.text = '';
  message.type = '';

  if (password.value !== confirmPassword.value) {
    message.text = 'Passwords do not match!';
    message.type = 'error';
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        mobileNo: mobileNo.value,
        password: password.value
      })
    });

    const data = await response.json();

    if (response.ok) {
      message.text = data.message || 'Registration successful!';
      message.type = 'success';

      // Optional delay so user can see the message
      setTimeout(() => {
        router.push('/login'); // ✅ Step 3: Redirect to login
      }, 1000);

    } else {
      message.text = data.message || 'Registration failed.';
      message.type = 'error';
    }
  } catch (err) {
    message.text = 'An error occurred during registration.';
    message.type = 'error';
    console.error(err);
  }
}

</script>

<style scoped>
/* Your existing styles for form-container, inputs, button, messages */
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
}
.form-input:focus {
  outline: none;
  border-color: #5cb85c;
}
.form-button {
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}
.form-button:hover {
  background-color: #0056b3;
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
  text-decoration: underline;
  padding: 0;
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
