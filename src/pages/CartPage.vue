<template>
  <div class="cart-container">
    <div class="cart-content">
      <h1 class="cart-title">Your Shopping Cart</h1>

      <div v-if="!isLoggedIn" class="auth-warning">
        <p>Please log in to view and manage your cart.</p>
        <router-link to="/login" class="login-btn">Go to Login</router-link>
      </div>

      <div v-if="isLoading" class="loading-section">
        <p>Loading cart data...</p>
        <div class="spinner"></div>
      </div>

      <div v-else-if="isLoggedIn">
        <div class="cart-table">
          <div class="cart-table-header">
            <div>Item</div>
            <div>Price</div>
            <div></div>
            <div>Qty</div>
            <div></div>
            <div>Total</div>
            <div>Actions</div>
          </div>
          <div v-for="item in cartItems" :key="item._id + (item.size || '')" class="cart-table-row">
            <div class="cart-item">
              <img
                :src="getMappedImageUrl(getProductDetails(item.productId).name)"
                alt="Product"
                class="product-image"
                @error="onImageError"
              />
              <span>{{ getProductDetails(item.productId).name }}</span>
              <span v-if="item.size" class="item-size">({{ item.size }})</span>
            </div>
            <div>₱{{ (getProductDetails(item.productId).price || 0).toFixed(2) }}</div>
            <div class="quantity-minus-cell">
              <button class="qty-btn circle-btn" @click="updateQuantity(item.productId, item.quantity - 1, item.size)">−</button>
            </div>
            <div class="quantity-display-cell">
              <span class="qty-display">{{ item.quantity }}</span>
            </div>
            <div class="quantity-plus-cell">
              <button class="qty-btn circle-btn" @click="updateQuantity(item.productId, item.quantity + 1, item.size)">+</button>
            </div>
            <div>₱{{ ((getProductDetails(item.productId).price || 0) * item.quantity).toFixed(2) }}</div>
            <div>
              <button class="remove-item-btn" @click="confirmRemoval(item)">Remove</button>
            </div>
          </div>
        </div>

        <div class="summary-section">
          <button class="clear-btn" @click="clearCart" :disabled="isLoading || cartItems.length === 0">
            Clear Cart
          </button>
          <div class="summary-box">
            <div>Subtotal: ₱{{ (totalCartPrice || 0).toFixed(2) }}</div>
            <div class="grand-total">Grand Total: ₱{{ (totalCartPrice || 0).toFixed(2) }}</div>
            <button class="checkout-btn" @click="proceedToCheckout" :disabled="isLoading || cartItems.length === 0">Proceed to Checkout</button>
          </div>
        </div>
      </div>

      <div v-if="showConfirmModal" class="modal-overlay">
        <div class="modal-box">
          <h2>Confirm Removal</h2>
          <p>Are you sure you want to remove "{{ itemToDelete.name }}"<span v-if="itemToDelete.size"> (Size: {{ itemToDelete.size }})</span> from your cart?</p>
          <div class="modal-actions">
            <button class="modal-remove" @click="removeFromCart(itemToDelete.productId, itemToDelete.size)">Yes, Remove</button>
            <button class="modal-cancel" @click="cancelRemoval">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../stores/global';
import { useCartStore } from '../stores/cart';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const router = useRouter();
const globalStore = useGlobalStore();
const cartStore = useCartStore();

const cartItems = computed(() => cartStore.cartItems || []);
const isLoggedIn = computed(() => globalStore.isLoggedIn);
const isLoading = ref(false);
const defaultImage = new URL('../assets/default.png', import.meta.url).href;
const totalCartPrice = computed(() => cartItems.value.reduce((sum, item) => sum + (item.subtotal || 0), 0));
const showConfirmModal = ref(false);
const itemToDelete = ref(null);
const availableProducts = ref([]);
const API_BASE_URL = 'http://localhost:4000';
const authToken = computed(() => globalStore.token);

const notyf = new Notyf({ duration: 3000, position: { x: 'right', y: 'bottom' } });

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

const onImageError = (event) => {
  event.target.src = defaultImage;
};

const getMappedImageUrl = (productName) => {
  const filename = productImageMap[productName];
  if (filename) {
    try {
      return new URL(`../assets/product/${filename}`, import.meta.url).href;
    } catch (err) {
      console.warn(`Error loading image for ${productName}: ${filename}. Using default.png.`);
      return defaultImage;
    }
  } else {
    console.warn(`No specific image mapped for product: ${productName}. Using default.png.`);
    return defaultImage;
  }
};

const getProductDetails = (productId) => {
  const product = availableProducts.value.find(p => String(p._id) === String(productId));
  if (!product) return { name: 'Unknown', price: 0, image: defaultImage };
  return { ...product, image: getMappedImageUrl(product.name) };
};

const updateQuantity = async (productId, quantity, size) => {
  if (!isLoggedIn.value || !authToken.value) {
    notyf.error('Please log in to update cart quantity.');
    return;
  }
  if (quantity < 1) {
    notyf.error('Quantity cannot be less than 1.');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/cart/update-cart-quantity`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`
      },
      body: JSON.stringify({ productId, newQuantity: quantity, size })
    });
    const data = await response.json();

    if (response.ok) {
      await fetchCart();
      notyf.success('Quantity updated');
    } else {
      console.error('Failed to update quantity:', data.message || 'Unexpected response');
      notyf.error(data.message || 'Failed to update quantity.');
    }
  } catch (err) {
    console.error('Network error updating quantity:', err);
    notyf.error('Network error updating quantity.');
  }
};

const clearCart = async () => {
  if (!isLoggedIn.value || !authToken.value) {
    notyf.error('Please log in to clear your cart.');
    return;
  }
  if (!confirm('Are you sure you want to clear your entire cart?')) {
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/cart/clear-cart`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      cartStore.setCartItems([]);
      notyf.success('Cart cleared successfully!');
    } else {
      console.error('Failed to clear cart:', data.message || 'Unexpected response');
      notyf.error(data.message || 'Failed to clear cart.');
    }
  } catch (err) {
    console.error('Network error clearing cart:', err);
    notyf.error('Network error clearing cart.');
  }
};

const removeFromCart = async (productId, size) => {
  if (!isLoggedIn.value || !authToken.value) {
    notyf.error('Please log in to remove items from cart.');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/cart/${productId}/remove-from-cart`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`
      },
      body: JSON.stringify({ size })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to remove item (Server Response):', response.status, errorText);
      notyf.error(`Failed to remove item: ${response.statusText || 'Unknown error'}. Details: ${errorText.substring(0, 100)}...`);
      return;
    }

    const data = await response.json();
    notyf.success(data.message || 'Item removed from cart successfully!');
    await fetchCart();
  } catch (err) {
    console.error('Network error or JSON parsing error removing item:', err);
    notyf.error(`Network error or unexpected response: ${err.message}. Please check server logs.`);
  } finally {
    showConfirmModal.value = false;
    itemToDelete.value = null;
  }
};

const confirmRemoval = (item) => {
  itemToDelete.value = { ...item, name: getProductDetails(item.productId).name }; // Include product name for modal
  showConfirmModal.value = true;
};

const cancelRemoval = () => {
  showConfirmModal.value = false;
  itemToDelete.value = null;
};

const fetchAvailableProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/active`);
    const data = await response.json();
    availableProducts.value = Array.isArray(data) ? data : data.products || [];
  } catch (error) {
    console.error('Error loading products:', error);
  }
};

const fetchCart = async () => {
  if (!isLoggedIn.value) {
    cartStore.clearCartState();
    return;
  }
  isLoading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/cart/get-cart`, {
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
      console.error('Unexpected cart response format or empty cart:', data);
      cartStore.setCartItems([]);
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    notyf.error('Failed to load cart. Please try again.');
    cartStore.setCartItems([]);
  } finally {
    isLoading.value = false;
  }
};

const proceedToCheckout = () => {
  if (!isLoggedIn.value) {
    notyf.error('Please log in to proceed with checkout.');
    router.push('/login');
    return;
  }
  if (cartItems.value.length === 0) {
    notyf.open({ type: 'info', message: 'Your cart is empty. Add items before checking out.' });
    return;
  }
  router.push('/checkout');
};

watch(isLoggedIn, async (val) => {
  if (val) {
    await fetchAvailableProducts();
    await fetchCart();
  } else {
    cartStore.clearCartState();
    availableProducts.value = [];
  }
}, { immediate: true });

onMounted(() => {
  if (!isLoggedIn.value) isLoading.value = false;
});
</script>

<style scoped>
/* Scoped styles ensure they only apply to this component */

.cart-table-header,
.cart-table-row {
  display: grid;
  /* Item | Price | -Btn | Qty | +Btn | Total | Actions */
  grid-template-columns: 2fr 1fr 0.4fr 0.6fr 0.4fr 1fr 0.8fr; /* Removed 0.8fr for Size */
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.cart-table-header {
  font-weight: bold;
  background-color: #000000;
  color: #ffffff;
  padding: 1rem;
  border-radius: 8px 8px 0 0;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-size {
  font-size: 0.9em;
  color: #666;
  margin-left: 5px;
}

.product-image {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #d1d5db;
}

.qty-btn {
  padding: 0.2rem 0.6rem;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  cursor: pointer;
  font-weight: normal;
  transition: all 0.3s ease;
}

.qty-btn:hover {
  background-color: #f3f4f6;
}

.qty-display {
  display: inline-block;
  width: auto;
  min-width: 40px;
  text-align: center;
  font-weight: bold;
  font-size: 1rem;
  padding: 0 5px;
}

.circle-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: white;
  color: black;
  font-size: 1.2rem;
  cursor: pointer;
}

.circle-btn:hover {
  background-color: #f0f0f0;
}

.remove-item-btn {
  background-color: #dc3545;
  color: white;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s ease;
}

.remove-item-btn:hover {
  background-color: #c82333;
}

/* Main Layout Styles */
.cart-container {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  justify-content: center;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.cart-content {
  width: 100%;
  max-width: 1000px;
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.cart-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  text-align: center;
  margin-bottom: 2rem;
}

.auth-warning {
  text-align: center;
  margin-bottom: 2rem;
}

.login-btn {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 999px;
  text-decoration: none;
}

.loading-section {
  text-align: center;
  padding: 1.5rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #ccc;
  border-top: 3px solid #111;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.summary-box {
  text-align: right;
  line-height: 1.6;
}

.grand-total {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.clear-btn {
  background-color: white;
  color: #ef4444;
  font-weight: normal;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #ef4444;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background-color: #ef4444;
  color: white;
}

.checkout-btn {
  background-color: white;
  color: #10b981;
  font-weight: normal;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  cursor: pointer;
  border: 2px solid #10b981;
  transition: all 0.3s ease;
}

.checkout-btn:hover {
  background-color: #10b981;
  color: white;
}

/* Modal Styles */
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
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-remove {
  background-color: #b91c1c;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
}

.modal-cancel {
  background-color: #e5e7eb;
  color: #111827;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
}
</style>