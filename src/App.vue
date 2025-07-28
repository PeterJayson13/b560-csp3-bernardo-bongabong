<template>
  <div id="app">
    <AppNavbar />

    <main class="flex-grow-1">
      <router-view></router-view>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import AppNavbar from './components/AppNavbar.vue';
import AppFooter from './components/AppFooter.vue';
// ... other imports

</script>

<style>
/* You may need to adjust your main layout for the footer to stick to the bottom */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex-grow: 1;
}
</style>