<script setup>
import { computed } from 'vue';

const props = defineProps({
  allOrders: {
    type: Array,
    required: true
  }
});

const allOrdersSorted = computed(() => {
  return [...props.allOrders].sort((a, b) => new Date(b.orderedOn) - new Date(a.orderedOn));
});

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'badge bg-secondary text-white'; // Gray with black text
    case 'Processing':
      return 'badge bg-warning text-white'; // Yellow with black text
    case 'Shipped':
      return 'badge bg-info text-white'; // Cyan/Blue with black text
    case 'Delivered':
      // Delivered is usually success (green), keeping text-white for contrast
      return 'badge bg-success text-white';
    case 'Cancelled':
      // Cancelled is usually danger (red), keeping text-white for contrast
      return 'badge bg-danger text-white';
    case 'Completed': // If your backend has a 'Completed' status
      return 'badge bg-dark text-white';
    default:
      return 'badge bg-light text-dark border border-secondary'; // Fallback
  }
};
</script>

<template>
  <div class="mt-4">
    <h3>Order History</h3>
    <table class="table table-bordered table-striped align-middle">
      <thead class="table-dark">
        <tr>
          <th class="text-center">Order ID</th>
          <th class="text-center">User</th>
          <th class="text-center">Total Price</th>
          <th class="text-center">Current Status</th>
          <th class="text-center">Ordered On</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="allOrdersSorted.length === 0">
          <td colspan="5" class="text-center text-muted">No orders in history.</td>
        </tr>
        <tr v-for="order in allOrdersSorted" :key="order._id">
          <td>{{ order._id }}</td>
          <td>{{ order.userId?.email || 'Unknown User' }}</td>
          <td>₱{{ order.totalPrice.toFixed(2) }}</td>
          <td class="text-center">
            <span :class="getStatusBadgeClass(order.status)">{{ order.status }}</span>
          </td>
          <td>{{ new Date(order.orderedOn).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Scoped styles for this component, if any */
</style>