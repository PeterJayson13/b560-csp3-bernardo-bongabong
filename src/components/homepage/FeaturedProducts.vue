<template>
  <div class="featured-section container mt-5">
    <h2 class="section-title">Featured Products</h2>
    <div class="row">
      <div class="col-md-4" v-for="product in featuredProducts" :key="product._id">
        <div class="card mb-4 shadow-sm featured-card">
          <img :src="product.image" class="card-img-top" :alt="product.name" />
          <div class="card-body">
            <h5 class="card-title">{{ product.name }}</h5>
            <p class="card-text">₱{{ product.price }}</p>
            <router-link :to="`/products/${product._id}`" class="btn btn-outline-primary btn-sm">
              View Details
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

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

const getMappedImageUrl = (productName) => {
  const filename = productImageMap[productName];
  if (filename) {
    try {
      return new URL(`../../assets/product/${filename}`, import.meta.url).href;
    } catch (err) {
      console.warn(`Error loading image for ${productName}: ${filename}`);
    }
  }
  return new URL('../../assets/default.png', import.meta.url).href;
};

const featuredProducts = ref([]);

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:4000/products/active'); // adjust if needed
    const data = await response.json();
    // Get only the top 3 for featured
    featuredProducts.value = data.slice(0, 3).map(product => ({
  ...product,
  image: getMappedImageUrl(product.name)
}));
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
  }
});
</script>

<style scoped>
.featured-section {
  text-align: center;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.featured-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
}

.card-text {
  font-size: 1rem;
  color: #444;
}
</style>
