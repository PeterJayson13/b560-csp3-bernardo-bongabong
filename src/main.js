import { createApp } from 'vue';
import App from './App.vue';

// --- Third-party libraries ---
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import 'bootstrap'; // Bootstrap JavaScript (if needed, though often for specific components)

// --- Local Components/Pages ---
import HomePage from './pages/HomePage.vue';
import ProductCatalog from './pages/ProductCatalog.vue';
import ProductDetails from './pages/ProductDetails.vue';
import Login from './pages/Login.vue';
import Register from './pages/Register.vue';
import Logout from './pages/Logout.vue';
import AdminPage from './pages/AdminPage.vue';
import CartPage from './pages/CartPage.vue';
import CheckoutPage from './pages/CheckoutPage.vue'; // Import CheckoutPage.vue
import ProfilePage from './pages/ProfilePage.vue'; // Import the new ProfilePage
import OrderTracker from './pages/OrderTracker.vue';

// --- Global Store ---
import { useGlobalStore } from './stores/global'; // Import useGlobalStore

// --- Global Styles ---
import './style.css'; // Your main global CSS file

// --- Router Setup ---
const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/products', name: 'ProductCatalog', component: ProductCatalog },
  { path: '/products/:id', name: 'ProductDetails', component: ProductDetails },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/logout', name: 'Logout', component: Logout },
  { path: '/admin', name: 'AdminPage', component: AdminPage },
  { path: '/cart', name: 'CartPage', component: CartPage },
  { path: '/checkout', name: 'CheckoutPage', component: CheckoutPage },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true } // Add meta field to require authentication
  },
  {
        path: '/orders',
        name: 'OrderTracker',
        component: OrderTracker,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
  history: createWebHistory(), // Use HTML5 History API for clean URLs
  routes,
});

// --- Pinia Setup ---
const pinia = createPinia();

// --- Vue App Initialization ---
const app = createApp(App);

// Use Pinia before router so the store is available in navigation guards
app.use(pinia);

// Navigation Guard to check authentication
router.beforeEach((to, from, next) => {
  // Get the global store instance after Pinia has been installed
  const globalStore = useGlobalStore();
  if (to.meta.requiresAuth && !globalStore.isLoggedIn) {
    next('/login'); // Redirect to login page if not authenticated
  } else {
    next(); // Proceed to the route
  }
});

// Use Vue Router
app.use(router);

// Mount the app to the DOM
app.mount('#app');
