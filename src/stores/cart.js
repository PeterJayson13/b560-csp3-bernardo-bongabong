// stores/cart.js
import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: [], // Holds cart items
  }),
  getters: {
    cartItemCount: (state) => {
      // Total quantity of items in cart
      return state.cartItems.reduce((count, item) => count + item.quantity, 0);
    },
    totalCartPrice: (state) => {
      return state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }
  },
  actions: {
    setCartItems(items) {
      this.cartItems = items;
    },
    clearCartState() {
      this.cartItems = [];
    },
    addToCart(product, quantity = 1) {
      const existingItem = this.cartItems.find(item => item._id === product._id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.cartItems.push({
          ...product,
          quantity
        });
      }
    },
    removeFromCart(productId) {
      this.cartItems = this.cartItems.filter(item => item._id !== productId);
    },
    updateQuantity(productId, newQuantity) {
      const item = this.cartItems.find(item => item._id === productId);
      if (item) {
        item.quantity = newQuantity;
      }
    }
  },
});
