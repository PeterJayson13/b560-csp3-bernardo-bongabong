<template>
  <div class="page-container">
    <div class="main-content">
      <div class="header-container">
        <h1 class="header-title">
          My Orders
        </h1>
        <p class="header-subtitle">
          Track and manage your order history with a professional overview.
        </p>
      </div>

      <div class="filter-buttons">
        <button
          v-for="status in statuses"
          :key="status"
          @click="filterStatus = status"
          :class="{
            'filter-button': true,
            'filter-button--active': filterStatus === status,
          }"
        >
          {{ status }}
        </button>
      </div>

      <div class="orders-card">
        <div v-if="isLoading" class="state-message">
          <span class="loading-text">Loading your orders...</span>
          <div class="loading-spinner"></div>
        </div>

        <div v-else-if="error" class="state-message error-state">
          <p class="error-title">Oops! Something went wrong.</p>
          <pre class="error-details">{{ error }}</pre>
          <p class="error-contact">Please try again or contact support.</p>
        </div>

        <div v-else-if="filteredOrders.length === 0" class="state-message empty-state">
          <p class="empty-title">No orders found</p>
          <p class="empty-details">Try a different filter or check back later.</p>
        </div>

        <div v-else class="orders-table-wrapper">
          <table class="orders-table">
            <thead class="orders-table-header">
              <tr>
                <th class="table-header-cell">Order ID</th>
                <th class="table-header-cell">Item</th>
                <th class="table-header-cell">Qty</th>
                <th class="table-header-cell">Price</th>
                <th class="table-header-cell">Date</th>
                <th class="table-header-cell">Status</th>
              </tr>
            </thead>
            <tbody class="orders-table-body">
              <tr
                v-for="order in filteredOrders"
                :key="order._id"
                class="orders-table-row"
              >
                <td class="table-data-cell font-medium">{{ order._id }}</td>
                <td class="table-data-cell">
                  {{
                    order.productsOrdered.length > 1
                      ? 'Multiple Items'
                      : order.productsOrdered[0]?.productId?.name || 'N/A'
                  }}
                </td>
                <td class="table-data-cell">{{ getTotalQuantity(order.productsOrdered) }}</td>
                <td class="table-data-cell">${{ order.totalPrice?.toFixed(2) || '0.00' }}</td>
                <td class="table-data-cell">{{ new Date(order.orderedOn).toLocaleDateString() }}</td>
                <td class="table-data-cell">
                  <span
                    :class="['status-badge', getStatusStyle(order.status)]"
                  >
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGlobalStore } from '../stores/global';

const orders = ref([]);
const filterStatus = ref('All');
const isLoading = ref(true);
const error = ref(null);
const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const globalStore = useGlobalStore();
const authToken = globalStore.token;

const fetchOrders = async () => {
  isLoading.value = true;
  error.value = null;

  if (!authToken) {
    error.value = 'You must be logged in to view orders.';
    isLoading.value = false;
    return;
  }

  try {
    const res = await fetch('http://localhost:4000/orders/my-orders', {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      const errMsg = contentType.includes('json')
        ? (await res.json()).message
        : (await res.text()).slice(0, 300);
      throw new Error(errMsg);
    }

    const data = await res.json();
    orders.value = data.orders;
  } catch (err) {
    error.value = err.message || 'An unexpected error occurred.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchOrders);

const filteredOrders = computed(() =>
  filterStatus.value === 'All'
    ? orders.value
    : orders.value.filter(order => order.status === filterStatus.value)
);

const getTotalQuantity = items => items.reduce((sum, item) => sum + item.quantity, 0);

const getStatusStyle = status => {
  const styleMap = {
    Delivered: 'status-delivered',
    Shipped: 'status-shipped',
    Processing: 'status-processing',
    Pending: 'status-pending',
    Cancelled: 'status-cancelled'
  };
  return styleMap[status] || 'status-pending';
};
</script>

<style scoped>
/* Page Layout */
.page-container {
  min-height: 100vh;
  background-color: #f9fafb; /* bg-gray-50 */
  padding: 3rem 1rem; /* py-12 px-4 */
  color: #374151; /* text-gray-800 */
}

@media (min-width: 640px) { /* sm */
  .page-container {
    padding-left: 1.5rem; /* sm:px-6 */
    padding-right: 1.5rem; /* sm:px-6 */
  }
}

@media (min-width: 1024px) { /* lg */
  .page-container {
    padding-left: 2rem; /* lg:px-8 */
    padding-right: 2rem; /* lg:px-8 */
  }
}

.main-content {
  max-width: 80rem; /* max-w-7xl */
  margin-left: auto;
  margin-right: auto;
  animation: fadeIn 0.5s ease-out both;
}

/* Header */
.header-container {
  text-align: center;
  margin-bottom: 2rem; /* space-y-8, so margin-bottom 2rem, 3rem */
}

.header-title {
  font-size: 2.25rem; /* text-4xl */
  line-height: 2.5rem; /* leading-10 */
  font-weight: 800; /* font-extrabold */
  color: #111827; /* text-gray-900 */
}

.header-subtitle {
  margin-top: 0.5rem; /* mt-2 */
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem; /* leading-5 */
  color: #6b7280; /* text-gray-500 */
}

/* Filter Buttons */
.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem; /* gap-3 */
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* gap-2 */
  padding: 0.625rem 1.25rem; /* px-5 py-2.5 */
  border-radius: 0.5rem; /* rounded-lg */
  border: 1px solid #d1d5db; /* border-gray-300 */
  font-weight: 600; /* font-semibold */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem; /* leading-5 */
  background-color: #ffffff; /* bg-white */
  color: #4b5563; /* text-gray-700 */
}

.filter-button:hover {
  background-color: #f3f4f6; /* hover:bg-gray-100 */
}

.filter-button--active {
  background-color: #4f46e5; /* bg-indigo-600 */
  color: #ffffff; /* text-white */
  border-color: transparent;
}

.filter-button--active:hover {
  background-color: #4338ca; /* hover:bg-indigo-700 */
}

/* Main Content Card */
.orders-card {
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow */
  overflow: hidden;
  border-radius: 0.5rem; /* sm:rounded-lg */
  border: 1px solid #e5e7eb; /* border-gray-200 */
  margin-top: 2rem;
  margin-bottom: 2rem;
}

/* State Messages */
.state-message {
  text-align: center;
  padding: 5rem 0; /* py-20 */
}

.loading-text {
  display: block;
  font-size: 1.25rem; /* text-xl */
  line-height: 1.75rem; /* leading-7 */
  font-weight: 600; /* font-semibold */
  margin-bottom: 1rem; /* mb-4 */
  color: #6366f1; /* text-indigo-500 */
}

.loading-spinner {
  display: inline-block;
  height: 2.5rem; /* h-10 */
  width: 2.5rem; /* w-10 */
  margin-left: auto;
  margin-right: auto;
  border-width: 4px; /* border-4 */
  border-style: solid;
  border-color: #6366f1; /* border-indigo-500 */
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  max-width: 42rem; /* max-w-2xl */
  margin-left: auto;
  margin-right: auto;
  padding: 1.5rem; /* p-6 */
  background-color: #fef2f2; /* bg-red-50 */
  border-radius: 0.5rem; /* rounded-lg */
  border: 1px solid #fca5a5; /* border-red-300 */
  color: #b91c1c; /* text-red-700 */
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow */
}

.error-title {
  font-size: 1.25rem; /* text-xl */
  font-weight: 600; /* font-semibold */
  margin-bottom: 0.75rem; /* mb-3 */
}

.error-details {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem;
}

.error-contact {
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem;
  color: #ef4444; /* text-red-500 */
  margin-top: 1rem; /* mt-4 */
}

.empty-state {
  text-align: center;
  color: #6b7280; /* text-gray-500 */
  padding: 2.5rem; /* p-10 */
  background-color: #f9fafb; /* bg-gray-50 */
}

.empty-title {
  font-size: 1.125rem; /* text-lg */
  font-weight: 500; /* font-medium */
}

.empty-details {
  font-size: 0.875rem; /* text-sm */
}

/* Orders Table */
.orders-table-wrapper {
  overflow-x: auto;
}

.orders-table {
  min-width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
}

.orders-table-header {
  background-color: #f3f4f6; /* bg-gray-100 */
}

.table-header-cell {
  padding: 0.75rem 1.5rem; /* px-6 py-3 */
  text-align: left;
  font-size: 0.75rem; /* text-xs */
  font-weight: 700; /* font-bold */
  color: #6b7280; /* text-gray-500 */
  text-transform: uppercase;
  letter-spacing: 0.05em; /* tracking-wider */
  border-bottom: 1px solid #e5e7eb;
}

.orders-table-body {
  background-color: #ffffff;
  color: #4b5563;
}

.orders-table-row {
  transition-property: background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.orders-table-row:hover {
  background-color: #f9fafb; /* hover:bg-gray-50 */
}

.table-data-cell {
  padding: 1rem 1.5rem; /* px-6 py-4 */
  white-space: nowrap;
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem; /* px-3 py-1 */
  font-size: 0.75rem; /* text-xs */
  font-weight: 600; /* font-semibold */
  border-radius: 9999px; /* rounded-full */
}

.status-delivered {
  background-color: #d1fae5; /* bg-green-100 */
  color: #065f46; /* text-green-800 */
}
.status-shipped {
  background-color: #dbeafe; /* bg-blue-100 */
  color: #1e40af; /* text-blue-800 */
}
.status-processing {
  background-color: #fffbeb; /* bg-yellow-100 */
  color: #92400e; /* text-yellow-800 */
}
.status-pending {
  background-color: #e5e7eb; /* bg-gray-200 */
  color: #4b5563; /* text-gray-800 */
}
.status-cancelled {
  background-color: #fee2e2; /* bg-red-100 */
  color: #991b1b; /* text-red-800 */
}

/* Fade In Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>