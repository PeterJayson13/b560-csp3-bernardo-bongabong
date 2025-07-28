<script setup>
import { ref } from 'vue';
import { useGlobalStore } from '../../stores/global';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import * as bootstrap from 'bootstrap';

import AddProductModal from './AddProductModal.vue';

const globalStore = useGlobalStore();
const notyf = new Notyf({
  duration: 3000,
  position: { x: 'center', y: 'top' }
});

const token = globalStore.token;
const products = ref([]);
const newProduct = ref({ name: '', description: '', price: null });
const defaultImage = new URL('../../assets/default.png', import.meta.url).href; // Path remains relative to this file

// --- YOUR COMPLETE productImageMap (PASTED HERE) ---
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

// --- REPLACED getImageUrl with getMappedImageUrl ---
const getMappedImageUrl = (productName) => {
  const filename = productImageMap[productName];
  if (filename) {
    try {
      // Corrected path: ../../assets/product/
      // This path goes up two levels from components/admin/ to src/, then into assets/product/
      return new URL(`../../assets/product/${filename}`, import.meta.url).href;
    } catch (err) {
      console.warn(`Error loading image for ${productName}: ${filename}. Using default.png.`);
      return defaultImage; // Use your locally defined defaultImage
    }
  } else {
    console.warn(`No specific image mapped for product: ${productName}. Using default.png.`);
    return defaultImage; // Use your locally defined defaultImage
  }
};

// --- MODIFIED onImageError to use defaultImage ---
const onImageError = (event) => {
  event.target.src = defaultImage;
};

const fetchProducts = async () => {
  try {
    const res = await fetch('http://localhost:4000/products/all', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    products.value = Array.isArray(data) ? data : (data.products || []);
  } catch (err) {
    console.error('[AdminProductManagement] fetchProducts error:', err);
  }
};

const createProduct = async () => {
  if (!newProduct.value.name || !newProduct.value.description || newProduct.value.price === null) {
    notyf.error('Please complete all product fields.');
    return;
  }

  try {
    const res = await fetch('http://localhost:4000/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newProduct.value)
    });

    const data = await res.json();

    if (res.status === 201 || res.ok) {
      newProduct.value = { name: '', description: '', price: null };
      await fetchProducts();
      notyf.success('Product created successfully!');

      const modalEl = document.getElementById('addProductModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }

    } else {
      notyf.error(data.message || 'Failed to create product.');
    }
  } catch (err) {
    notyf.error(err.message || 'An unexpected error occurred.');
  }
};

const updateProduct = async (product) => {
  try {
    const res = await fetch(`http://localhost:4000/products/${product._id}/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        price: product.price,
        // Since you can't change backend, we're not sending 'image' back.
        // The frontend will handle displaying based on product.name.
        // If your backend expects 'image' and errors without it,
        // you might need to send an empty string or null for it.
        // For now, removing it assuming the backend doesn't strictly require it for PATCH
        // image: product.image // Removed this line as it's not from API and could cause issues
      })
    });

    const data = await res.json();

    if (res.status === 200 || res.ok) {
      await fetchProducts();
      notyf.success('Product updated successfully!');
    } else {
      notyf.error(data.message || 'Failed to update product.');
    }
  } catch (err) {
    notyf.error(err.message || 'An error occurred while updating the product.');
  }
};

const toggleProductStatus = async (product) => {
  try {
    const endpoint = product.isActive ? 'archive' : 'activate';
    const res = await fetch(`http://localhost:4000/products/${product._id}/${endpoint}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      await fetchProducts();
      notyf.success(product.isActive ? 'Product archived!' : 'Product reactivated!');
    } else {
      const error = await res.json();
      notyf.error(error.message || 'Failed to change product status.');
    }
  } catch (err) {
    notyf.error('An error occurred while changing product status.');
  }
};

defineExpose({
  fetchProducts
});
</script>

<template>
  <div>
    <div class="text-end mb-3">
      <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addProductModal">
        + Add Product
      </button>
    </div>

    <table class="table table-bordered table-striped align-middle">
      <thead class="table-dark">
        <tr>
          <th class="text-center">Image</th>
          <th class="text-center">Name</th>
          <th class="text-center">Description</th>
          <th class="text-center">Price (₱)</th>
          <th class="text-center">Status</th>
          <th class="text-center" style="width: 200px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product._id">
          <td>
            <div class="d-flex justify-content-center align-items-center" style="height: 100px;">
              <img
                :src="getMappedImageUrl(product.name)" :alt="product.name + ' Image'" style="max-height: 80px; object-fit: contain;"
                @error="onImageError"
              />
            </div>
          </td>
          <td><input v-model="product.name" class="form-control" /></td>
          <td><input v-model="product.description" class="form-control" /></td>
          <td><input v-model.number="product.price" type="number" class="form-control" /></td>
          <td class="text-center">
            <span :class="product.isActive ? 'text-success' : 'text-danger'">
              {{ product.isActive ? 'Active' : 'Archived' }}
            </span>
          </td>
          <td class="text-center">
            <button class="btn btn-sm btn-success me-2" @click="updateProduct(product)">Update</button>
            <button
              class="btn btn-sm"
              :class="product.isActive ? 'btn-danger' : 'btn-secondary'"
              @click="toggleProductStatus(product)"
            >
              {{ product.isActive ? 'Archive' : 'Reactivate' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <AddProductModal v-model="newProduct" @create-product="createProduct" />
  </div>
</template>

<style scoped>
/* Any specific styles for product management table, etc. can go here */
</style>