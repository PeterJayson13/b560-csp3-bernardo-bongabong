<script setup>
import { computed } from 'vue';

const props = defineProps({
  allOrders: {
    type: Array,
    required: true
  },
  locallyApprovedOrders: {
    type: Set,
    required: true
  }
});

const emit = defineEmits(['open-order-modal']);

const pendingProcessingShippedOrders = computed(() => {
  return props.allOrders.filter(order =>
    ['Pending', 'Processing', 'Shipped'].includes(order.status)
  ).sort((a, b) => new Date(a.orderedOn) - new Date(b.orderedOn)); // Optional: sort by oldest first
});

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'badge bg-secondary text-white'; // Gray with white text
    case 'Processing':
      return 'badge bg-warning text-white'; // Yellow with white text (Note: may need custom CSS if not visible)
    case 'Shipped':
      return 'badge bg-info text-white'; // Cyan/Blue with white text
    default:
      return 'badge bg-light text-white border border-secondary'; // Fallback (white text on light bg might be poor)
  }
};

const handleOpenOrderModal = (order) => {
  emit('open-order-modal', order);
};
</script>

<template>
  <div class="mt-4">
    <h3>Pending Orders</h3>
    <table class="table table-bordered table-striped align-middle">
      <thead class="table-dark">
        <tr>
          <th class="text-center">Order ID</th>
          <th class="text-center">User</th>
          <th class="text-center">Total Price</th>
          <th class="text-center">Current Status</th>
          <th class="text-center">Ordered On</th>
          <th class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="pendingProcessingShippedOrders.length === 0">
          <td colspan="6" class="text-center text-muted">No pending, processing, or shipped orders.</td>
        </tr>
        <tr v-for="order in pendingProcessingShippedOrders" :key="order._id">
          <td>{{ order._id }}</td>
          <td>{{ order.userId?.email || 'Unknown User' }}</td>
          <td>₱{{ order.totalPrice.toFixed(2) }}</td>
          <td class="text-center">
            <span :class="getStatusBadgeClass(order.status)">{{ order.status }}</span>
          </td>
          <td>{{ new Date(order.orderedOn).toLocaleString() }}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-primary" @click="handleOpenOrderModal(order)">
              View Order
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Scoped styles for this component, if any */
</style>