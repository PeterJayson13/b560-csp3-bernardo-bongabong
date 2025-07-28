<template>
  <footer class="bg-light py-5 mt-auto" id="footer">
    <div class="container">
      <div class="row">
        <div class="col-lg-4 mb-4 mb-lg-0">
          <h4 class="fw-bold text-primary">Urban Steps</h4>
          <p class="text-muted mb-2">Your journey in style starts here.</p>
          <p class="text-muted small">
            Proudly serving Paranaque City and the Philippines.
          </p>
          <div class="social-icons mt-3">
            <a href="https://www.facebook.com/" class="text-secondary me-3" title="Facebook"><i class="fab fa-facebook-f fa-lg"></i></a>
            <a href="https://www.instagram.com/" class="text-secondary me-3" title="Instagram"><i class="fab fa-instagram fa-lg"></i></a>
            <a href="https://x.com/" class="text-secondary" title="Twitter"><i class="fab fa-twitter fa-lg"></i></a>
          </div>
        </div>

        <div class="col-lg-3 mb-4 mb-lg-0">
          <h6 class="fw-bold text-uppercase text-muted mb-3">Shop</h6>
          <ul class="list-unstyled">
            <li><router-link to="/products" class="text-decoration-none text-secondary">Sneakers</router-link></li>
            <li><router-link to="/products" class="text-decoration-none text-secondary">Casual Shoes</router-link></li>
            <li><router-link to="/products" class="text-decoration-none text-secondary">Sale</router-link></li>
          </ul>
        </div>

        <div class="col-lg-3 mb-4 mb-lg-0">
          <h6 class="fw-bold text-uppercase text-muted mb-3">Information</h6>
          <ul class="list-unstyled">
            <li><a href="#footer" class="text-decoration-none text-secondary">About Us</a></li>
            <li><a href="#footer" class="text-decoration-none text-secondary">Contact Us</a></li>
            <li><a href="#footer" class="text-decoration-none text-secondary">Privacy Policy</a></li>
            <li><a href="#footer" class="text-decoration-none text-secondary">Terms of Service</a></li>
          </ul>
        </div>

        <div class="col-lg-2">
          <h6 class="fw-bold text-uppercase text-muted mb-3">Contact</h6>
          <ul class="list-unstyled">
            <li class="text-secondary small">Tel: (02) 8XXXXXXX</li>
            <li class="text-secondary small">Email: support@urbansteps.com.ph</li>
            <li class="text-secondary small">Paranaque City, Metro Manila</li>
          </ul>
        </div>
      </div>
      <hr class="my-4">
      <div class="row align-items-center justify-content-between small text-muted">
        <div class="col-md-6 order-md-2 text-md-end">
          Payment Options:
          <i class="fab fa-cc-visa ms-2"></i>
          <i class="fab fa-cc-mastercard ms-2"></i>
          <i class="fab fa-cc-paypal ms-2"></i>
        </div>
        <div class="col-md-6 order-md-1">
          © {{ currentYear }} Urban Steps. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue';

const currentYear = ref(new Date().getFullYear());
</script>

<style scoped>
.text-decoration-none {
  transition: color 0.3s ease;
}

.text-decoration-none:hover {
  color: #0d6efd !important; /* Bootstrap primary blue */
}

.social-icons a {
  color: #6c757d !important; /* Bootstrap secondary gray */
  transition: color 0.3s ease;
}

.social-icons a:hover {
  color: #0d6efd !important;
}
</style>