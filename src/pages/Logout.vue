<template>
  <div class="logout-container">
    <h2 class="logout-title">You have been logged out.</h2>
    <p class="logout-message">Thank you for visiting MyShop!</p>
    <p class="logout-redirect-info">
      Redirecting to home page in {{ countdown }} seconds...
    </p>
    <button @click="navigateToHome" class="logout-button">Go to Home Now</button>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../stores/global';

const router = useRouter();
const globalStore = useGlobalStore();

const countdown = ref(5);
let timer = null;

// ✅ Logout and start countdown on mount
onMounted(() => {
  globalStore.logout();

  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      router.push('/');
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

const navigateToHome = () => {
  if (timer) clearInterval(timer);
  router.push('/');
};
</script>

<style scoped>
.logout-container {
  background-color: #ffffff;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  margin: 50px auto;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.logout-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
}

.logout-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.logout-redirect-info {
  font-size: 14px;
  color: #888;
  margin-bottom: 25px;
}

.logout-button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #0056b3;
}
</style>
