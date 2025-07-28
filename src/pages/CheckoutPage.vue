<template>
  <div class="checkout-container">
    <div class="checkout-content">
      <h1 class="checkout-title">Checkout</h1>

      <div v-if="isLoading" class="loading-section">
        <p>Processing your order...</p>
        <div class="spinner animate-spin"></div>
      </div>

      <div v-else>
        <div class="order-summary-section">
          <h2 class="section-title">Order Summary</h2>
          <div v-if="cartItems.length === 0" class="empty-cart-message">
            Your cart is empty. Please add items to proceed.
          </div>
          <div v-else class="order-items-list">
            <div v-for="item in cartItems" :key="item.productId + (item.size || '')" class="order-item-row">
              <img
                :src="getProductDetails(item.productId).imageUrl"
                :alt="getProductDetails(item.productId).name"
                class="order-product-image"
                @error="onImageError"
              />
              <div class="order-product-info">
                <p class="order-product-name">{{ getProductDetails(item.productId).name }}</p>
                <p class="order-product-qty">Qty: {{ item.quantity }} <span v-if="item.size"> / Size: {{ item.size }}</span></p>
              </div>
              <p class="order-product-total">₱{{ item.subtotal ? item.subtotal.toFixed(2) : 'N/A' }}</p>
            </div>
            <div class="order-total">
              Grand Total: <span class="order-total-value">₱{{ totalCartPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="address-section">
          <h2 class="section-title">Shipping Address</h2>
          <form @submit.prevent="null" class="address-form">
            <div class="form-group">
              <label for="street">Street Address:</label>
              <input type="text" id="street" v-model="address.street" required class="form-input" />
            </div>
            <div class="form-group">
              <label for="city">City:</label>
              <input type="text" id="city" v-model="address.city" required class="form-input" />
            </div>
            <div class="form-group">
              <label for="postalCode">Postal Code:</label>
              <input type="text" id="postalCode" v-model="address.postalCode" required class="form-input" />
            </div>
            <div class="form-group">
              <label for="country">Country:</label>
              <input type="text" id="country" v-model="address.country" required class="form-input" />
            </div>
            <div class="form-group">
              <label for="phoneNumber">Phone Number:</label>
              <input type="tel" id="phoneNumber" v-model="address.phoneNumber" required class="form-input" />
            </div>
          </form>
        </div>

        <div class="payment-section">
          <h2 class="section-title">Payment Method</h2>
          <div class="payment-options">
            <label class="payment-option">
              <input type="radio" name="payment" value="Credit Card" v-model="paymentMethod" required />
              Credit Card
            </label>
            <label class="payment-option">
              <input type="radio" name="payment" value="PayPal" v-model="paymentMethod" required />
              PayPal
            </label>
            <label class="payment-option">
              <input type="radio" name="payment" value="Cash on Delivery" v-model="paymentMethod" required />
              Cash on Delivery
            </label>
          </div>
        </div>

        <div class="checkout-actions">
          <button @click="router.push('/cart')" class="back-to-cart-btn">Back to Cart</button>
          <button @click="confirmOrder" :disabled="!isFormValid || isLoading" class="confirm-order-btn">Confirm Order</button>
        </div>
      </div>

      <div v-if="showConfirmationModal" class="modal-overlay">
        <div class="modal-box">
          <h3 class="modal-title">Confirm Your Order</h3>
          <p class="modal-message">Please review your order details, shipping address, and payment method.</p>

          <div class="confirmation-summary">
            <h4>Shipping To:</h4>
            <p>
              {{ address.street }}, {{ address.city }}, {{ address.postalCode }}, {{ address.country }}<br />
              Phone: {{ address.phoneNumber }}
            </p>
            <h4>Payment Via:</h4>
            <p>{{ paymentMethod }}</p>
            <h4>Order Details:</h4>
            <ul class="confirmation-items-list">
              <li v-for="item in cartItems" :key="item.productId + (item.size || '')">
                <img
                  :src="getProductDetails(item.productId).imageUrl"
                  :alt="getProductDetails(item.productId).name"
                  class="confirmation-product-thumbnail"
                  @error="onImageError"
                />
                {{ getProductDetails(item.productId).name }} (Qty: {{ item.quantity }} <span v-if="item.size">Size: {{ item.size }}</span>) - ₱{{ item.subtotal ? item.subtotal.toFixed(2) : 'N/A' }}
              </li>
            </ul>
            <h4>Total: ₱{{ totalCartPrice.toFixed(2) }}</h4>
          </div>

          <div class="modal-actions">
            <button @click="placeOrder" :disabled="isLoading" class="place-order-btn">Place Order</button>
            <button @click="cancelConfirmation" class="modal-cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../stores/global';
import { useCartStore } from '../stores/cart';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

// Router and Pinia Stores
const router = useRouter();
const globalStore = useGlobalStore();
const cartStore = useCartStore();

// Notyf Notification Setup
const notyf = new Notyf({
  duration: 3000,
  position: {
    x: 'right',
    y: 'bottom',
  },
  types: [
    {
      type: 'info',
      background: '#3e8ed0',
      icon: {
        className: 'notyf__icon--info',
        tagName: 'i',
        text: 'i',
      },
    },
  ],
});

// Reactive State
const isLoading = ref(false);
const showConfirmationModal = ref(false);

const address = ref({
  street: '',
  city: '',
  postalCode: '',
  country: '',
  phoneNumber: '',
});
const paymentMethod = ref('');

// Computed Properties from Stores
const cartItems = computed(() => cartStore.cartItems || []);
const isLoggedIn = computed(() => globalStore.isLoggedIn);
const authToken = computed(() => globalStore.token);

const API_BASE_URL = 'http://localhost:4000';

// Product Image Mapping
const defaultImage = new URL('../assets/default.png', import.meta.url).href;
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

// Available products state (fetched from backend)
const availableProducts = ref([]);

/**
 * Derives the correct image URL for a product based on its name.
 * Uses a mapping for specific product images and falls back to a default.
 * @param {string} productName - The name of the product.
 * @returns {string} The URL of the product image.
 */
const getMappedImageUrl = (productName) => {
  const filename = productImageMap[productName];
  if (filename) {
    try {
      // Use import.meta.url for Vite/ESM module resolution
      return new URL(`../assets/product/${filename}`, import.meta.url).href;
    } catch (err) {
      console.warn(`Error loading image for ${productName}: ${filename}. Using default.png.`, err);
      return defaultImage;
    }
  } else {
    console.warn(`No specific image mapped for product: ${productName}. Using default.png.`);
    return defaultImage;
  }
};

/**
 * Retrieves product details including name, price, and mapped image URL.
 * @param {string} productId - The ID of the product.
 * @returns {object} Product details or fallback data if not found.
 */
const getProductDetails = (productId) => {
  const product = availableProducts.value.find(p => String(p._id) === String(productId));
  return product ? {
    name: product.name,
    price: product.price,
    imageUrl: getMappedImageUrl(product.name)
  } : {
    name: `Unknown Product (${productId})`,
    price: 0,
    imageUrl: defaultImage
  };
};

// Computed property for total cart price
const totalCartPrice = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.subtotal || 0), 0);
});

// Computed property to check if the form is valid for submission
const isFormValid = computed(() => {
  return (
    address.value.street &&
    address.value.city &&
    address.value.postalCode &&
    address.value.country &&
    address.value.phoneNumber &&
    paymentMethod.value &&
    cartItems.value.length > 0
  );
});

/**
 * Handles image loading errors by replacing the src with a default image.
 * @param {Event} event - The error event.
 */
const onImageError = (event) => {
  event.target.src = defaultImage;
};

/**
 * Handles unauthorized access (401 status) by logging out the user
 * and redirecting to the login page.
 */
const handleUnauthorized = () => {
  console.error('Authentication failed (401). Clearing session and redirecting.');
  globalStore.logout();
  cartStore.clearCartState();
  notyf.error('Your session has expired. Please log in again.');
  isLoading.value = false;
  router.push('/login');
};

/**
 * Fetches the list of active products from the backend.
 */
const fetchAvailableProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (response.ok) {
      if (Array.isArray(data)) {
        availableProducts.value = data;
      } else {
        console.error('Expected array for available products, received:', data);
        availableProducts.value = [];
      }
    } else {
      console.error('Failed to fetch available products:', data.message || 'Unknown error');
      notyf.error(`Failed to load products: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Network error fetching available products:', error);
    notyf.error(`Network error fetching products: ${error.message}`);
  }
};

/**
 * Fetches the user's cart from the backend.
 * Redirects to login or cart page if not authenticated or cart is empty/invalid.
 */
const fetchCart = async () => {
  if (!isLoggedIn.value || !authToken.value) {
    console.log('CheckoutPage fetchCart: Not logged in or token missing, skipping cart fetch.');
    cartStore.clearCartState();
    router.push('/login');
    return;
  }

  isLoading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/cart/get-cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`,
      },
    });

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    const data = await response.json();
    if (response.ok) {
      if (data.cart && Array.isArray(data.cart.cartItems)) {
        cartStore.setCartItems(data.cart.cartItems);

        if (cartItems.value.length === 0) {
          notyf.open({ type: 'info', message: 'Your cart is empty. Redirecting to cart page.' });
          router.push('/cart');
        }
      } else {
        cartStore.setCartItems([]);
        notyf.error('Cart data structure unexpected, please review your cart.');
        router.push('/cart');
      }
    } else {
      if (response.status === 404 && data.message === 'Cart not found') {
        cartStore.setCartItems([]);
        notyf.open({ type: 'info', message: 'Your cart is empty. Redirecting to cart page.' });
        router.push('/cart');
      } else {
        notyf.error(`Error fetching cart: ${data.message || 'Unknown error'}`);
        router.push('/cart');
      }
    }
  } catch (error) {
    console.error('CheckoutPage Network or parsing error fetching cart:', error);
    notyf.error(`Network error fetching cart: ${error.message}`);
    router.push('/cart');
  } finally {
    isLoading.value = false;
  }
};

/**
 * Shows the order confirmation modal if the form is valid.
 */
const confirmOrder = () => {
  if (!isFormValid.value) {
    notyf.error('Please fill in all required fields (address and payment method).');
    return;
  }
  showConfirmationModal.value = true;
};

/**
 * Hides the order confirmation modal.
 */
const cancelConfirmation = () => {
  showConfirmationModal.value = false;
};

/**
 * Places the order by sending the shipping and payment details to the backend.
 */
const placeOrder = async () => {
  isLoading.value = true;
  try {
    const orderData = {
      shippingAddress: address.value,
      paymentMethod: paymentMethod.value,
      // Backend should ideally fetch cart items based on user ID for security.
      // If your backend *requires* sending cartItems from frontend, uncomment:
      // cartItems: cartItems.value.map(item => ({ productId: item.productId, quantity: item.quantity, size: item.size }))
    };

    const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`,
      },
      body: JSON.stringify(orderData),
    });

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    const data = await response.json();
    console.log('CheckoutPage Backend response for checkout:', data);

    if (response.ok) {
      notyf.success(data.message || 'Order placed successfully! Thank you for your purchase.');
      cartStore.clearCartState(); // Clear frontend cart after successful order
      showConfirmationModal.value = false;
      router.push('/order-confirmation'); // Redirect to a dedicated confirmation page
    } else {
      notyf.error(`Order placement failed: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('CheckoutPage Network or parsing error placing order:', error);
    notyf.error(`Network error placing order: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle Hooks
onMounted(async () => {
  if (!isLoggedIn.value) {
    notyf.open({ type: 'info', message: 'Please log in to access the checkout page.' });
    router.push('/login');
    return;
  }
  await fetchAvailableProducts();
  await fetchCart();
});

// Watchers
watch(cartItems, (newCartItems) => {
  if (newCartItems.length === 0 && !isLoading.value && isLoggedIn.value) {
    notyf.open({ type: 'info', message: 'Your cart is now empty. Redirecting to cart page.' });
    router.push('/cart');
  }
});
</script>

<style scoped>
/* General Styles */
.checkout-container {
  min-height: 100vh;
  background-color: #f8fafc; /* bg-gray-100 */
  display: flex;
  justify-content: center;
  padding: 1rem; /* p-4 */
  font-family: 'Inter', sans-serif;
}

.checkout-content {
  width: 100%;
  max-width: 1000px; /* max-w-4xl */
  background: white;
  padding: 1.5rem; /* p-6 */
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-xl */
}

.checkout-title {
  font-size: 2.25rem; /* text-3xl */
  font-weight: 700; /* font-bold */
  color: #1f2937; /* text-gray-800 */
  text-align: center;
  margin-bottom: 1.5rem; /* mb-6 */
}

/* Loading Section */
.loading-section {
  text-align: center;
  padding: 2rem;
  color: #4b5563; /* text-gray-600 */
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 4px solid #ccc;
  border-top: 4px solid #1f2937;
  border-radius: 50%;
  margin: 1rem auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Order Summary */
.order-summary-section,
.address-section,
.payment-section {
  background-color: #f9fafb; /* bg-gray-50 */
  padding: 1rem; /* p-4 */
  border-radius: 0.5rem; /* rounded-md */
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow-sm */
  margin-bottom: 1.5rem; /* mb-6 */
}

.section-title {
  font-size: 1.5rem; /* text-xl */
  font-weight: 600; /* font-semibold */
  color: #374151; /* text-gray-700 */
  margin-bottom: 1rem; /* mb-4 */
  border-bottom: 1px solid #e5e7eb; /* border-b border-gray-200 */
  padding-bottom: 0.5rem;
}

.empty-cart-message {
  color: #6b7280; /* text-gray-500 */
  text-align: center;
  padding: 1rem;
}

.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* space-y-3 */
}

.order-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #e5e7eb; /* border-b border-dashed border-gray-200 */
}

.order-item-row:last-child {
  border-bottom: none; /* No border for the last item */
}

.order-product-image {
  width: 3rem; /* w-12 */
  height: 3rem; /* h-12 */
  object-fit: cover;
  border-radius: 0.25rem; /* rounded-md */
  margin-right: 0.75rem; /* mr-3 */
  border: 1px solid #d1d5db; /* border border-gray-300 */
  flex-shrink: 0; /* Prevent shrinking */
}

.order-product-info {
  flex-grow: 1;
}

.order-product-name {
  font-weight: 500; /* font-medium */
  color: #1f2937; /* text-gray-900 */
  font-size: 0.95rem;
}

.order-product-qty {
  font-size: 0.85rem;
  color: #6b7280; /* text-gray-500 */
}

.order-product-total {
  font-weight: 600; /* font-semibold */
  color: #1f2937; /* text-gray-900 */
  font-size: 0.95rem;
}

.order-total {
  text-align: right;
  font-size: 1.25rem; /* text-xl */
  font-weight: 700; /* font-bold */
  color: #1f2937; /* text-gray-800 */
  margin-top: 1rem; /* mt-4 */
  padding-top: 0.75rem; /* pt-3 */
  border-top: 2px solid #e5e7eb; /* border-t-2 border-gray-200 */
}

.order-total-value {
  color: #ef4444; /* text-red-500 */
}

/* Forms */
.address-form {
  display: grid;
  gap: 1rem; /* gap-4 */
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .address-form {
    grid-template-columns: 1fr 1fr; /* sm:grid-cols-2 */
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500; /* font-medium */
  color: #374151; /* text-gray-700 */
  margin-bottom: 0.25rem; /* mb-1 */
  font-size: 0.9rem;
}

.form-input {
  padding: 0.6rem 0.8rem; /* py-2 px-3 */
  border: 1px solid #d1d5db; /* border border-gray-300 */
  border-radius: 0.375rem; /* rounded-md */
  font-size: 1rem; /* text-base */
  color: #1f2937; /* text-gray-800 */
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6; /* focus:border-blue-500 */
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25); /* focus:ring-2 focus:ring-blue-500 */
}

/* Payment Options */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* space-y-3 */
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* space-x-2 */
  font-size: 1rem;
  color: #374151; /* text-gray-700 */
  cursor: pointer;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  transition: all 0.2s ease-in-out;
}

.payment-option:hover {
  background-color: #f3f4f6;
}

.payment-option input[type="radio"] {
  accent-color: #3b82f6; /* blue-500 */
  width: 1.15rem;
  height: 1.15rem;
}

/* Action Buttons */
.checkout-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem; /* mt-8 */
  gap: 1rem; /* space-x-4 */
}

.back-to-cart-btn,
.confirm-order-btn,
.place-order-btn {
  font-weight: 700; /* font-bold */
  padding: 0.6rem 1.5rem; /* py-2.5 px-6 */
  border-radius: 9999px; /* rounded-full */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-lg */
  transition: all 0.3s ease-in-out;
  border: none;
  cursor: pointer;
  flex-grow: 1; /* Allow buttons to grow */
  text-align: center;
}

.back-to-cart-btn {
  background-color: #6b7280; /* gray-500 */
  color: white;
}

.back-to-cart-btn:hover {
  background-color: #4b5563; /* gray-600 */
  transform: scale(1.02);
}

.back-to-cart-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.75);
}

.confirm-order-btn {
  background-color: #10b981; /* emerald-500 */
  color: white;
}

.confirm-order-btn:hover:not(:disabled) {
  background-color: #059669; /* emerald-600 */
  transform: scale(1.05);
}

.confirm-order-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-order-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.75);
}

.place-order-btn {
  background-color: #3b82f6; /* blue-500 */
  color: white;
}

.place-order-btn:hover:not(:disabled) {
  background-color: #2563eb; /* blue-600 */
  transform: scale(1.05);
}

.place-order-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.place-order-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.75);
}

/* Modal Styles (reused from CartPage) */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-box {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 28rem;
  width: 100%;
  text-align: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.modal-message {
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.modal-cancel-btn {
  background-color: #d1d5db; /* Light gray for cancel button */
  color: #1f2937; /* Dark text color */
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
  border: none;
}

.modal-cancel-btn:hover {
  background-color: #9ca3af; /* Darker gray on hover */
}

.confirmation-summary {
  background-color: #f3f4f6; /* bg-gray-100 */
  padding: 1rem;
  border-radius: 0.375rem; /* rounded-md */
  margin-bottom: 1.5rem;
  text-align: left;
}

.confirmation-summary h4 {
  font-weight: 600;
  color: #1f2937;
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
}

.confirmation-summary p {
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.confirmation-summary h4:first-child {
  margin-top: 0;
}

.confirmation-items-list {
  list-style: none;
  padding: 0;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  border-top: 1px dashed #e5e7eb;
  padding-top: 0.5rem;
}

.confirmation-items-list li {
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 0.25rem;
  display: flex; /* Make list items flex to align image and text */
  align-items: center;
  gap: 0.5rem; /* Space between image and text */
}

/* New style for product thumbnails in the confirmation modal */
.confirmation-product-thumbnail {
  width: 2rem; /* Smaller size for thumbnails */
  height: 2rem;
  object-fit: cover;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  flex-shrink: 0;
}
</style>