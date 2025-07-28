// src/stores/global.js
import { defineStore } from 'pinia';

function getParsedIsAdmin() {
  try {
    const raw = localStorage.getItem('isAdmin');
    return raw ? JSON.parse(raw) : false;
  } catch {
    return false;
  }
}

function getUserId() {
  return localStorage.getItem('userId') || null;
}

function getUserEmail() {
  return localStorage.getItem('userEmail') || null;
}

export const useGlobalStore = defineStore('global', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    isAdmin: getParsedIsAdmin(),
    userId: getUserId(),
    userEmail: getUserEmail(), // <-- New state property for the user's email
  }),
  actions: {
    login(token, isAdmin, userId, userEmail) { // <-- Modified to accept userEmail
      this.token = token;
      this.isAdmin = isAdmin;
      this.userId = userId;
      this.userEmail = userEmail; // <-- Store the email
      localStorage.setItem('token', token);
      localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', userEmail);
    },
    logout() {
      this.token = null;
      this.isAdmin = false;
      this.userId = null;
      this.userEmail = null; // <-- Clear email on logout
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdminUser: (state) => state.isAdmin === true,
    currentUserId: (state) => state.userId,
  }
});