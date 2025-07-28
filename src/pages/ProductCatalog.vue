<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">Our Products</h2>
    <div class="row">
      <div class="col-md-4 mb-4" v-for="product in products" :key="product._id || product.id">
        <div class="card h-100 shadow-card d-flex flex-column justify-content-between">
          <img
            :src="getMappedImageUrl(product.name)" class="card-img-top catalog-img"
            loading="lazy"
            :alt="product.name + ' image'"
          />
          <div class="card-body text-center d-flex flex-column justify-content-between">
            <div>
              <h5 class="card-title fw-bold">{{ product.name }}</h5>
              <p class="card-text small">{{ product.description }}</p>
            </div>
            <div class="mt-3">
              <p class="fw-bold fs-5 mb-2 text-dark">₱{{ product.price.toFixed(2) }}</p>
              <router-link
                :to="{
                  name: 'ProductDetails',
                  params: { id: product._id || product.id },
                  state: { product }
                }"
                class="btn btn-outline-primary w-100"
              >
                View Details
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const products = ref([]);

// --- NEW MAPPING OBJECT ---
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

// --- MODIFIED IMAGE URL FUNCTION ---
const getMappedImageUrl = (productName) => {
  const filename = productImageMap[productName]; // Get filename from our map
  
  if (filename) {
    try {
      // Path remains the same to your assets folder
      return new URL(`../assets/product/${filename}`, import.meta.url).href;
    } catch (err) {
      console.warn(`Error loading image for ${productName}: ${filename}. Using default.png.`);
      return new URL('../assets/default.png', import.meta.url).href; // Fallback for specific image load error
    }
  } else {
    // If no mapping found for the product name, use default.png
    console.warn(`No specific image mapped for product: ${productName}. Using default.png.`);
    return new URL('../assets/default.png', import.meta.url).href;
  }
};

const fetchActiveProducts = async () => {
  try {
    const res = await fetch('http://localhost:4000/products/active');
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    products.value = Array.isArray(data) ? data : data.products || [];
    console.log('Fetched products:', products.value);
  } catch (err) {
    console.error('Failed to fetch active products:', err);
    products.value = [];
  }
};

onMounted(() => {
  fetchActiveProducts();
});
</script>

<style scoped>
/* ... (your existing styles remain the same) ... */
.catalog-img {
  height: 160px;
  object-fit: contain;
  padding: 10px;
  transition: transform 0.3s ease;
  margin: 0 auto;
}

.catalog-img:hover {
  transform: scale(1.08);
}

.shadow-card {
  border: 2px solid #ced4da;
  border-radius: 0.75rem;
  background-color: #ffffff;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.shadow-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.3);
  border-color: #0d6efd;
  background-color: #f8f9fa;
}

.card-title {
  font-size: 1.15rem;
}

.card-text {
  font-size: 0.88rem;
  color: #495057;
}
</style>