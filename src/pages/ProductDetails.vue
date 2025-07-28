<template>
  <div class="container mt-5" v-if="product">
    <div class="row align-items-center">
      <div class="col-md-6 mb-3 mb-md-0">
        <img
          :src="getMappedImageUrl(product.name)"
          :alt="product.name + ' image'"
          class="img-fluid product-image"
          loading="lazy"
          @error="onImageError"
        />
      </div>

      <div class="col-md-6">
        <h2>{{ product.name }}</h2>
        <p>{{ product.description }}</p>
        <p class="fw-bold fs-4">₱{{ product.price ? product.price.toFixed(2) : 'N/A' }}</p>

        <div class="mb-3">
          <label for="size-select" class="form-label fw-bold">Select Size:</label>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="size in availableSizes"
              :key="size"
              @click="selectedSize = size"
              :class="['btn', selectedSize === size ? 'btn-dark' : 'btn-outline-dark']"
              :disabled="isAddingToCart"
            >
              {{ size }}
            </button>
          </div>
          <div v-if="!selectedSize" class="text-danger mt-2 small">
            Please select a size.
          </div>
        </div>

        <div class="d-flex align-items-center mb-3">
          <button class="btn btn-outline-secondary" @click="decreaseQty" :disabled="isAddingToCart">−</button>
          <input
            type="number"
            class="form-control mx-2 text-center"
            v-model.number="quantity"
            min="1"
            style="width: 70px;"
            :disabled="isAddingToCart"
          />
          <button class="btn btn-outline-secondary" @click="increaseQty" :disabled="isAddingToCart">+</button>
        </div>

        <button
          v-if="isLoggedIn"
          class="btn btn-success me-2"
          @click="handleAddToCart"
          :disabled="isAddingToCart || !selectedSize"
        >
          {{ isAddingToCart ? 'Adding...' : 'Add to Cart' }}
        </button>

        <!-- Router link to login (if not logged in) -->
        <router-link
          v-else
          to="/login"
          class="btn btn-warning me-2"
        >
          Log in to Add to Cart
        </router-link>

        <button class="btn btn-secondary me-2" @click="goBackToProducts">
          Back to Products
        </button>

        <button class="btn btn-info" @click="goToCart">
          Go to Cart
        </button>
      </div>
    </div>
  </div>

  <div v-else class="container mt-5 text-center">
    <p>Loading product details...</p>
    <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGlobalStore } from '../stores/global';
import { useCartStore } from '../stores/cart';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const route = useRoute();
const router = useRouter();
const globalStore = useGlobalStore();
const cartStore = useCartStore();
const notyf = new Notyf();

const product = ref(null);
const quantity = ref(1);
const isAddingToCart = ref(false);
const selectedSize = ref(null);

const isLoggedIn = computed(() => globalStore.isLoggedIn);
const authToken = computed(() => globalStore.token);

const availableSizes = ref([
  'US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'
]);


const increaseQty = () => quantity.value++;
const decreaseQty = () => { if (quantity.value > 1) quantity.value--; };

const productImageMap = {
  'Jordan 1 High': 'Jordan 1 - High Red.png',
  'Adidas Samba OG': 'Samba.png',
  'Converse Chuck Taylor 70 Low Black': 'Converse.png',
  'Adizero Evo SL': 'Adizero Evo SL Shoes.png',
  'Air Zoom Pegasus 41': 'Air Zoom Pegasus 41.png',
  'onCloud Cloudmonster': 'Cloudmonster.png',
  'Adidas Harden Vol 9': 'Adidas Harden Vol 9.png',
  'LeBron NXXT Genisus EP': 'LeBron NXXT Genisus EP.png',
  'Anta Kyrie Irving X Shock Wave 5': 'Anta Kyrie Irving X Shock Wave 5.png'
};

const getMappedImageUrl = (productName) => {
  const filename = productImageMap[productName];
  if (filename) {
    try {
      return new URL(`../assets/product/${filename}`, import.meta.url).href;
    } catch (err) {
      console.warn(`Error loading image for ${productName}: ${filename}. Using default.png.`);
      return new URL('../assets/default.png', import.meta.url).href;
    }
  } else {
    console.warn(`No specific image mapped for product: ${productName}. Using default.png.`);
    return new URL('../assets/default.png', import.meta.url).href;
  }
};

const onImageError = (event) => {
  event.target.src = new URL('../assets/default.png', import.meta.url).href;
};

const showMessage = (text, type) => {
  type === 'success' ? notyf.success(text) : notyf.error(text);
};

const goBackToProducts = () => {
  router.push('/products');
};

// CHANGED: Function to navigate to the Cart Page
const goToCart = () => {
  router.push('/cart'); // Assuming your cart page route is '/cart'
};


const handleAddToCart = async () => {
  if (!isLoggedIn.value) {
    showMessage('Please log in to add items to your cart.', 'error');
    router.push('/login');
    return;
  }

  if (quantity.value <= 0) {
    showMessage('Quantity must be at least 1.', 'error');
    return;
  }

  if (!selectedSize.value) {
    showMessage('Please select a size before adding to cart.', 'error');
    return;
  }

  isAddingToCart.value = true;
  try {
    const response = await fetch('http://localhost:4000/cart/add-to-cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`
      },
      body: JSON.stringify({
        productId: product.value._id,
        quantity: quantity.value,
        size: selectedSize.value
      })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(data.message || 'Product added to cart successfully!', 'success');
      await fetchCartAndUpdateStore();
    } else if (response.status === 401 || response.status === 403) {
      showMessage(data.message || 'Authentication failed. Please log in again.', 'error');
      globalStore.logout();
      cartStore.clearCartState();
      router.push('/login');
    } else {
      showMessage(data.message || 'Failed to add product to cart.', 'error');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    showMessage('Network error. Could not add product to cart.', 'error');
  } finally {
    isAddingToCart.value = false;
  }
};

const fetchCartAndUpdateStore = async () => {
  if (!isLoggedIn.value || !authToken.value) {
    cartStore.clearCartState();
    return;
  }
  try {
    const response = await fetch('http://localhost:4000/cart/get-cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`
      }
    });
    const data = await response.json();
    if (response.ok && data.cart && Array.isArray(data.cart.cartItems)) {
      cartStore.setCartItems(data.cart.cartItems);
    } else {
      cartStore.setCartItems([]);
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    cartStore.setCartItems([]);
  }
};

onMounted(async () => {
  try {
    const res = await fetch(`http://localhost:4000/products/${route.params.id}`);
    const data = await res.json();
    if (res.ok) {
      product.value = data;
    } else {
      showMessage(data.message || 'Product not found.', 'error');
      product.value = null;
    }
  } catch (err) {
    console.error('Failed to fetch product details:', err);
    showMessage('Network error fetching product details.', 'error');
    product.value = null;
  }

  await fetchCartAndUpdateStore();
});
</script>

<style scoped>
.product-image {
  /* Let's be more explicit with dimensions and center it */
  width: 100%; /* Ensure it takes full width of its column */
  height: 500px; /* Set a fixed height for consistency, or use max-height: 500px; */
  object-fit: contain; /* Ensures the entire image is visible, no cropping, maintains aspect ratio */
  
  /* Additional styling you already have */
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #f8f9fa;

  /* Optional: Add display flex and margin auto to center if width is not 100% or if column is small */
  display: block; /* Ensures it behaves like a block element */
  margin: 0 auto; /* Centers the image horizontally within its parent column */
}
</style>