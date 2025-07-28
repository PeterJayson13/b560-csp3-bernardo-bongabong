<script setup>
import { ref, watch } from 'vue';

// Change prop name from 'newProduct' to 'modelValue'
const props = defineProps({
  modelValue: { // This is the default prop for v-model
    type: Object,
    required: true
  }
});

// Emit 'update:modelValue' when the form data changes
const emit = defineEmits(['create-product', 'update:modelValue']);

// Local ref for form inputs, initialized from modelValue
const productForm = ref({ ...props.modelValue });

// Watch for changes in the prop to keep localForm in sync (e.g., when parent resets it)
watch(() => props.modelValue, (newVal) => {
  productForm.value = { ...newVal };
}, { deep: true });

// Watch for changes in localForm and emit them back to the parent immediately
watch(productForm, (newVal) => {
  emit('update:modelValue', newVal); // Emit changes back to parent
}, { deep: true });

const submitForm = () => {
  emit('create-product', productForm.value);
};
</script>

<template>
  <div class="modal fade" id="addProductModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <form @submit.prevent="submitForm">
          <div class="modal-header">
            <h5 class="modal-title">Add New Product</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-4">
                <input v-model="productForm.name" class="form-control" placeholder="Product Name" required />
              </div>
              <div class="col-md-4">
                <input v-model="productForm.description" class="form-control" placeholder="Description" required />
              </div>
              <div class="col-md-4">
                <input v-model.number="productForm.price" type="number" class="form-control" placeholder="Price" required />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Product</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* No specific styles here, assuming Bootstrap handles most of it */
</style>