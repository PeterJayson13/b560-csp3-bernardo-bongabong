<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'; // Import 'nextTick' here
import { useGlobalStore } from '../stores/global';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import * as bootstrap from 'bootstrap';

// Import new components
import AdminProductManagement from '../components/admin/AdminProductManagement.vue';
import AdminPendingOrders from '../components/admin/AdminPendingOrders.vue';
import AdminOrderHistory from '../components/admin/AdminOrderHistory.vue';
import OrderDetailsModal from '../components/admin/OrderDetailsModal.vue';

const globalStore = useGlobalStore();
const notyf = new Notyf({
  duration: 3000,
  position: { x: 'center', y: 'top' }
});

const token = globalStore.token;
const isAdmin = globalStore.isAdmin;

const allOrders = ref([]);
const locallyApprovedOrders = ref(new Set());
const selectedOrder = ref(null);
const adminView = ref('products');

// Ref for child components to call their methods
const adminProductManagementRef = ref(null);

const fetchAllOrders = async () => {
  try {
    const res = await fetch('http://localhost:4000/orders/all-orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('Fetched orders:', data.orders);
    allOrders.value = Array.isArray(data.orders) ? data.orders : [];
  } catch (err) {
    console.error('[AdminPage] fetchAllOrders error:', err);
  }
};

const openOrderModal = (order) => {
  selectedOrder.value = order;
  const modalElement = document.getElementById('orderModal');
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
  modalInstance.show();
};

const handleOrderStatusUpdated = () => {
  fetchAllOrders();
};

watch(adminView, (newView) => {
  // Use nextTick to ensure component is mounted and ref is available
  nextTick(() => {
    if (newView === 'products' && adminProductManagementRef.value) {
      adminProductManagementRef.value.fetchProducts();
    } else if (newView === 'pending' || newView === 'history') {
      fetchAllOrders();
    }
  });
});

onMounted(() => {
  if (token && isAdmin) {
    // Ensure product fetch on initial mount, even if the watcher handles subsequent changes
    // Use nextTick to ensure adminProductManagementRef is available
    nextTick(() => {
      if (adminProductManagementRef.value) {
        adminProductManagementRef.value.fetchProducts();
      }
    });

    fetchAllOrders(); // Always fetch orders initially
  }
});
</script>

<template>
  <div class="container mt-5">
    <template v-if="token && isAdmin">
      <h2 class="text-center mb-4">Admin Dashboard</h2>

      <div class="d-flex justify-content-end gap-2 mb-3">
        <button
          class="btn"
          :class="adminView === 'products' ? 'btn-primary' : 'btn-outline-primary'"
          @click="adminView = 'products'"
        >
          View Products
        </button>
        <button
          class="btn"
          :class="adminView === 'pending' ? 'btn-primary' : 'btn-outline-primary'"
          @click="adminView = 'pending'"
        >
          Pending Orders
        </button>
        <button
          class="btn"
          :class="adminView === 'history' ? 'btn-primary' : 'btn-outline-primary'"
          @click="adminView = 'history'"
        >
          Order History
        </button>
      </div>

      <div v-if="adminView === 'products'">
        <AdminProductManagement ref="adminProductManagementRef" />
      </div>

      <div v-if="adminView === 'pending'">
        <AdminPendingOrders
          :allOrders="allOrders"
          :locallyApprovedOrders="locallyApprovedOrders"
          @open-order-modal="openOrderModal"
        />
      </div>

      <div v-if="adminView === 'history'">
        <AdminOrderHistory :allOrders="allOrders" />
      </div>

      <OrderDetailsModal
        :selectedOrder="selectedOrder"
        :token="token"
        @order-status-updated="handleOrderStatusUpdated"
      />

    </template>

    <template v-else>
      <div class="alert alert-danger text-center mt-5">
        You are not authorized to view this page.
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ... existing styles ... */
</style>