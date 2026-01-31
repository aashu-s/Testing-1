/**
 * js/store.js
 * Centralized localStorage management for the application.
 * Handles Clients, Requests, Projects, Offers, FAQs, Analytics, and Config.
 */

const STORAGE_KEYS = {
  CLIENTS: 'shreek_clients_v2',
  REQUESTS: 'shreek_requests',
  PROJECTS: 'shreek_projects',
  OFFERS: 'shreek_offers',
  FAQS: 'shreek_faqs',
  ANALYTICS: 'shreek_analytics',
  CONFIG: 'shreek_config'
};

const Store = {
  // --- Core CRUD ---

  loadData: function(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Error loading data for key ${key}:`, e);
      return null;
    }
  },

  saveData: function(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      // Dispatch a custom event for cross-tab/same-page sync updates if needed
      window.dispatchEvent(new CustomEvent('shreek_data_updated', { detail: { key } }));
    } catch (e) {
      console.error(`Error saving data for key ${key}:`, e);
    }
  },

  // --- Defaults & Seeding ---

  seedDefaults: function() {
    // 1. Config
    if (!this.loadData(STORAGE_KEYS.CONFIG)) {
      this.saveData(STORAGE_KEYS.CONFIG, {
        theme: 'light',
        plans: {
          basic: { discount: 5, price: 0, name: 'Basic' },
          silver: { discount: 10, price: 2000, name: 'Silver' },
          gold: { discount: 15, price: 5000, name: 'Gold' },
          platinum: { discount: 20, price: 10000, name: 'Platinum' } // Admin created
        }
      });
    }

    // 2. Projects (Default content if empty)
    if (!this.loadData(STORAGE_KEYS.PROJECTS)) {
      this.saveData(STORAGE_KEYS.PROJECTS, [
        { id: 'p1', title: 'Samsung Washing Machine Repair', desc: 'Motor replacement & testing — Kirtipur', img: 'img/project1.jpeg' },
        { id: 'p2', title: 'Whirlpool Top Load', desc: 'Servicing — completed in Boudhaa', img: 'img/project2.jpeg' },
        { id: 'p3', title: 'LG Washing Machine', desc: 'Minor glitch with major repair — completed in Thamel', img: 'img/project3.jpeg' }
      ]);
    }

    // 3. Offers (Empty by default or sample)
    if (!this.loadData(STORAGE_KEYS.OFFERS)) {
      this.saveData(STORAGE_KEYS.OFFERS, [
        // Example: { id: 'o1', title: 'Dashain Special', discount: 25, end: '2026-10-20T00:00:00', active: true }
      ]);
    }

    // 4. FAQs (Chatbot defaults)
    if (!this.loadData(STORAGE_KEYS.FAQS)) {
      this.saveData(STORAGE_KEYS.FAQS, [
        { id: 'f1', question: 'What are your service charges?', answer: 'Our inspection charge is Rs. 500 inside Ringroad. Repair costs depend on the issue.' },
        { id: 'f2', question: 'Do you offer warranty?', answer: 'Yes, we provide 3 months warranty on replaced parts and service.' },
        { id: 'f3', question: 'How do I become a member?', answer: 'You can register on our website and choose a Silver or Gold plan to get up to 15% discount.' }
      ]);
    }

    // 5. Analytics (Initialize if not present)
    if (!this.loadData(STORAGE_KEYS.ANALYTICS)) {
      this.saveData(STORAGE_KEYS.ANALYTICS, {
        visitors: 0,
        visitsByDate: {} // 'YYYY-MM-DD': count
      });
    }
    
    // 6. Requests (Init Array)
    if (!this.loadData(STORAGE_KEYS.REQUESTS)) {
       this.saveData(STORAGE_KEYS.REQUESTS, []);
    }
    
    // 7. Clients (Init Array)
    if (!this.loadData(STORAGE_KEYS.CLIENTS)) {
       this.saveData(STORAGE_KEYS.CLIENTS, []);
    }
  },

  // --- Helpers ---
  
  // Generate simple UID
  uid: function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Analytics Tracker
  trackVisit: function() {
    const data = this.loadData(STORAGE_KEYS.ANALYTICS) || { visitors: 0, visitsByDate: {} };
    data.visitors++;
    
    const today = new Date().toISOString().split('T')[0];
    if (!data.visitsByDate[today]) data.visitsByDate[today] = 0;
    data.visitsByDate[today]++;

    this.saveData(STORAGE_KEYS.ANALYTICS, data);
  }
};

// Initialize seeding immediately when script loads
Store.seedDefaults();
window.Store = Store; // Expose globally
