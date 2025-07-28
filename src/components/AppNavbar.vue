<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <router-link to="/" class="navbar-brand">
        <img :src="logoImage" alt="UrbanSteps Logo" class="navbar-logo" />
      </router-link>

      <ul class="navbar-nav me-auto" v-if="isLoggedIn">
        <li class="nav-item">
          <span class="nav-link welcome-message">
            Welcome to Urban Steps, {{ globalStore.userEmail }}!
          </span>
        </li>
      </ul>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>


      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link">Home</router-link>
          </li>

          <li class="nav-item">
            <router-link to="/products" class="nav-link">Products</router-link>
          </li>

          <li v-if="isLoggedIn && !isAdmin" class="nav-item">
            <router-link to="/cart" class="nav-link">
              Cart
              <span v-if="cartItemCount > 0" class="badge bg-primary rounded-pill ms-1">
                {{ cartItemCount }}
              </span>
            </router-link>
          </li>

          <template v-if="!isLoggedIn">
            <li class="nav-item">
              <router-link to="/login" class="nav-link">Login</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/register" class="nav-link">Register</router-link>
            </li>
          </template>

          <template v-else>
            <li v-if="isAdmin" class="nav-item">
              <router-link to="/admin" class="nav-link">Manage Products</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/profile" class="nav-link">Profile</router-link>
            </li>
            <li v-if="isLoggedIn && !isAdmin" class="nav-item">
                <router-link to="/orders" class="nav-link">Order Tracker</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/logout" class="nav-link">Logout</router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useGlobalStore } from '../stores/global';
import { useCartStore } from '../stores/cart';
import logoImage from '../assets/product/logo.png';


const globalStore = useGlobalStore();
const cartStore = useCartStore();

const isLoggedIn = computed(() => globalStore.isLoggedIn);
const isAdmin = computed(() => globalStore.isAdminUser);
const cartItemCount = computed(() => cartStore.cartItemCount);
// The userFirstName computed property is no longer needed

</script>

<style scoped>
.router-link-active {
  font-weight: bold;
  color: #0d6efd !important;
}

.badge {
  display: inline-block;
  padding: .35em .65em;
  font-size: .75em;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: .25rem;
}

.bg-primary {
  background-color: #0d6efd !important;
}

.rounded-pill {
  border-radius: 50rem !important;
}

.ms-1 {
  margin-left: .25rem !important;
}

.navbar-logo {
  height: 40px; /* adjust as needed */
  width: auto;
  object-fit: contain;
}

.welcome-message {
  color: #f8f9fa; /* or any light color to contrast the navbar */
  font-weight: 500;
  font-size: 1rem;
  animation: fadeIn 0.6s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>