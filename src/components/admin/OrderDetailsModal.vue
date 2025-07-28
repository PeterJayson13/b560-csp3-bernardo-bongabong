<script setup>
import { ref, watch } from 'vue';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import * as bootstrap from 'bootstrap';

const notyf = new Notyf({
  duration: 3000,
  position: { x: 'center', y: 'top' }
});

const props = defineProps({
  selectedOrder: {
    type: Object,
    default: null
  },
  token: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['order-status-updated']);

const tempStatus = ref('');
const orderModalRef = ref(null);

watch(() => props.selectedOrder, (newOrder) => {
  if (newOrder) {
    tempStatus.value = newOrder.status;
  }
}, { immediate: true });

const updateOrderStatus = async () => {
  if (!props.selectedOrder) return;

  console.log('--- Attempting to update order status ---');
  console.log('Token being sent:', props.token ? props.token.substring(0, 10) + '...' : 'No token');
  console.log('Selected Order ID:', props.selectedOrder?._id);
  console.log('New status to send:', tempStatus.value);
  console.log('Full API URL:', `http://localhost:4000/orders/update-status/${props.selectedOrder._id}`);

  try {
    const res = await fetch(`http://localhost:4000/orders/update-status/${props.selectedOrder._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${props.token}`
      },
      body: JSON.stringify({ status: tempStatus.value })
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Order update successful:', data);
      notyf.success('Order status updated successfully!'); // Success notification

      // Emit the event BEFORE hiding the modal, allowing parent to react
      emit('order-status-updated');

      // Add a small delay before hiding the modal to ensure notification is seen
      setTimeout(() => {
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
        if (modalInstance) {
          modalInstance.hide();
        }
      }, 300); // 300ms delay, adjust if needed

    } else {
      let errorMessage = 'Failed to update order status.';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${res.status} ${res.statusText || ''}. Please check network or server logs.`;
        console.error('Failed to parse error response as JSON:', e, await res.text());
      }
      notyf.error(errorMessage);
      console.error('Order update failed (non-2xx response):', res.status, errorMessage);
    }
  } catch (error) {
    console.error('[OrderDetailsModal] Network or unhandled error during fetch:', error);
    notyf.error('An unexpected error occurred. Please check your network connection or server.');
  }
};
</script>

<template>
  <div class="modal fade" id="orderModal" tabindex="-1" ref="orderModalRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Order Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body" v-if="selectedOrder">
          <p><strong>User:</strong> {{ selectedOrder.userId?.email || 'Unknown user' }}</p>
          <p><strong>Total:</strong> ₱{{ selectedOrder.totalPrice.toFixed(2) }}</p>
          <p><strong>Ordered On:</strong> {{ new Date(selectedOrder.orderedOn).toLocaleString() }}</p>
          <hr />
          <p><strong>Items Ordered:</strong></p>
          <ul class="mb-3">
            <li v-for="item in selectedOrder.productsOrdered" :key="item.productId._id">
              {{ item.productId.name }} (x{{ item.quantity }})
            </li>
          </ul>

          <div>
            <label class="form-label">Status</label>
            <select
              v-model="tempStatus"
              class="form-select"
            >
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <button class="btn btn-primary" @click="updateOrderStatus()">
            Update Order
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* No specific styles here, assuming Bootstrap handles most of it */
</style>