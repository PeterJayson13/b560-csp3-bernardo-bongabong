<template>
  <div class="hero-section container">
    <div class="row align-items-center">
      <div class="col-md-6 col-lg-7 p-0">
        <img :src="homepageHeroImage" alt="Background Image" class="img-fluid hero-image-left">
      </div>

      <div class="col-md-6 col-lg-5 hero-text-right">
        <div class="text-content">
          <div class="welcome-with-logo">
            <h2><i>Welcome to</i></h2><br>
            <img :src="logoImage" alt="UrbanSteps Logo" class="logo-inline">
          </div>
          <p class="lead">Your one-stop shop for the latest and greatest footwear.</p>
          <p>Discover our amazing collection of shoes and accessories.</p>
          <router-link to="/products" class="btn btn-primary btn-lg custom-btn">Shop Our Products Now</router-link>
        </div>
      </div>
    </div>
  </div>
  
  <FeaturedProducts />
</template>

<script setup>
import homepageHeroImage from '../assets/product/BG-1.jpg';
import logoImage from '../assets/product/logo.png'; 
import FeaturedProducts from '../components/homepage/FeaturedProducts.vue';
</script>

<style scoped>
  .welcome-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0;
}

.welcome-stack h1 {
  font-size: 2.8rem;
  margin: 0; /* Remove all margin */
  padding: 0; /* Remove all padding */
  line-height: 1; /* Tight spacing */
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.logo-stacked {
  max-width: 240px;
  height: auto;
  margin: 0; /* Ensure no margin between h1 and image */
  padding: 0;
  display: block;
}
/* Hero Section Container */
.hero-section {
  padding: 0;
  min-height: 500px;
  display: flex;
  align-items: stretch;

  margin-top: 50px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); /* Slightly more prominent shadow */
}

/* Image Column */
.hero-image-left {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Text Column */
.hero-text-right {
  background-color: rgba(0, 0, 0, 0.8); /* Slightly less transparent black for better contrast */
  color: white;
  padding: 50px 45px; /* Slightly adjusted padding for horizontal spacing */
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.hero-text-right .text-content {
  max-width: 500px;
  display: flex; /* Added for stacking h1 and logo */
  flex-direction: column; /* Stack "Welcome" and the logo */
  align-items: flex-start; /* Align items to the left */
}

/* General Text Styling */
.hero-text-right h1 {
  font-size: 3.5rem;
  margin-bottom: 0.5rem; /* Reduced margin below "Welcome" to bring logo closer */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  line-height: 1.1;
}

.logo-image {
  max-width: 300px; /* Adjust this value for desired logo size */
}

.hero-text-right p.lead {
  font-size: 1.3rem;
  margin-top: 1rem;
  margin-bottom: 0.75rem;
  text-align: center;
}

.hero-text-right p {
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
  text-align: center;
}


/* Custom Button Styling for Hover Effect */
.hero-text-right .custom-btn {
  padding: 15px 30px;
  font-size: 1.1rem;
  white-space: nowrap;
  transition: all 0.3s ease; /* Smooth transition for hover effects */
}

.hero-text-right .custom-btn:hover {
  transform: translateY(-3px); /* Lifts the button slightly */
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3); /* Adds a stronger shadow on hover */
  background-color: #0056b3; /* Darker blue on hover */
  border-color: #0056b3;
}

/* Responsive Adjustments */
@media (max-width: 992px) {
  .hero-text-right h1 {
    font-size: 2.8rem;
  }
  .logo-image {
    max-width: 150px; /* Adjusted for medium screens */
  }
  .hero-text-right p.lead {
    font-size: 1.3rem;
  }
  .hero-text-right p {
    font-size: 0.95rem;
  }
}

@media (max-width: 767.98px) {
  .hero-section {
    min-height: auto;
    flex-direction: column;
    margin-top: 30px;
  }

  .hero-image-left {
    height: 300px;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .hero-text-right {
    padding: 30px 20px;
    height: auto;
    text-align: center; /* Center overall text content */
    align-items: center; /* Center flex items for mobile */
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    background-color: rgba(0, 0, 0, 0.9); /* Darker on mobile for better visibility */
  }

  .hero-text-right .text-content {
    max-width: 100%;
    align-items: center; /* Center align "Welcome" and logo */
  }

  .hero-text-right h1 {
    font-size: 2.5rem;
    text-align: center; /* Ensure "Welcome" is centered */
  }
  .logo-image {
    max-width: 120px; /* Adjusted for mobile */
    margin-bottom: 0.75rem; /* Reduced margin for mobile */
  }
  .hero-text-right p.lead {
    font-size: 1.1rem;
    text-align: center;
  }
  .hero-text-right p {
    font-size: 0.9rem;
    text-align: center;
  }
}

@media (max-width: 575.98px) {
  .hero-image-left {
    height: 250px;
  }
  .hero-text-right h1 {
    font-size: 2rem;
  }
  .logo-image {
    max-width: 100px; /* Further adjusted for very small screens */
  }
  .hero-text-right p.lead {
    font-size: 1rem;
  }
  .hero-text-right .custom-btn {
    font-size: 0.9rem;
    padding: 10px 20px;
  }
}
</style>