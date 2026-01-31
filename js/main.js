/**
 * js/main.js
 * Client-Side Logic using Store.js
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. ANALYTICS & THEME
  Store.trackVisit();

  // Apply Theme
  const config = Store.loadData('shreek_config');
  if (config && config.theme === 'dark') {
    document.body.classList.add('dark-mode');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
  }

  /* ----------------------------------------------------
     2. DYNAMIC CONTENT RENDERING
     ---------------------------------------------------- */

  // RENDER PROJECTS
  const projectContainer = document.querySelector('#projects .row');
  const projects = Store.loadData('shreek_projects') || [];
  if (projectContainer && projects.length > 0) {
    projectContainer.innerHTML = projects.map(p => `
            <div class="col-md-4 mb-3">
              <div class="card h-100 project-card shadow-sm">
                <img src="${p.img}" alt="${p.title}" class="card-img-top">
                <div class="card-body">
                  <h6 class="card-title">${p.title}</h6>
                  <p class="small text-muted mb-0 text-truncate">${p.desc}</p>
                  <button class="btn btn-sm btn-outline-primary mt-2" onclick="viewProjectDetails('${p.id}')">View Details</button>
                </div>
              </div>
            </div>
         `).join('');
  }

  window.viewProjectDetails = function (id) {
    const projs = Store.loadData('shreek_projects');
    const p = projs.find(x => x.id === id);
    if (p) {
      document.getElementById('clientProjTitle').textContent = p.title;
      document.getElementById('clientProjDesc').textContent = p.desc;
      document.getElementById('clientProjImg').src = p.img;
      new bootstrap.Modal(document.getElementById('modalClientProject')).show();
    }
  };

  // ... (rest of filtering) ...

  // SERVICE SUBMISSION
  const serviceForm = document.querySelector('.service-form');
  if (serviceForm) {
    serviceForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const address = document.getElementById('address').value;
      const service = document.getElementById('service').value;
      const reqDate = document.getElementById('reqDate').value;
      const msg = document.getElementById('message').value;

      const requests = Store.loadData('shreek_requests') || [];
      const newReq = {
        id: Store.uid(),
        clientName: name,
        clientContact: phone + ' / ' + email,
        clientAddress: address,
        service: service,
        reqDate: reqDate,
        details: msg,
        timestamp: new Date().toISOString(),
        status: 'Pending'
      };

      requests.push(newReq);
      Store.saveData('shreek_requests', requests);

      // Also update user history if logged in or email matches
      const clients = Store.loadData('shreek_clients_v2');
      const matchedClient = clients.find(c => c.email === email);
      if (matchedClient) {
        matchedClient.history.push(`${new Date().toLocaleDateString()}: Requested ${service} for ${address}`);
        Store.saveData('shreek_clients_v2', clients);
      }

      alert('Service Request Submitted! We will contact you shortly.');
      serviceForm.reset();
      document.getElementById('serviceModal').style.display = 'none';

      // If client was logged in, refresh dashboard if open
      if (sessionStorage.getItem(SESSION_KEY)) {
        const u = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        const c = Store.loadData('shreek_clients_v2').find(user => user.id === u.id);
        if (c) updateDashboardUI(c);
      }
    });
  }

  // Modal Helpers
  const svcModal = document.getElementById("serviceModal");
  if (svcModal) {
    document.getElementById("openServiceForm").addEventListener("click", () => {
      svcModal.style.display = "flex";
      // Auto-fill if logged in
      const s = sessionStorage.getItem(SESSION_KEY);
      if (s) {
        const uSession = JSON.parse(s);
        const allClients = Store.loadData('shreek_clients_v2');
        const u = allClients.find(c => c.id === uSession.id);
        if (u) {
          document.getElementById('name').value = u.name;
          document.getElementById('email').value = u.email;
          document.getElementById('phone').value = u.phone;
          // Address isn't stored in basic user profile in this mock, but if we had it we'd fill it.
        }
      }
    });
    document.getElementById("closeModal").addEventListener("click", () => svcModal.style.display = "none");

    // Scroll to Top
    const scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) scrollBtn.style.display = 'flex';
        else scrollBtn.style.display = 'none';
      });
      scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    window.addEventListener("click", (e) => { if (e.target === svcModal) svcModal.style.display = "none"; });
  }

  // Modal Openers
  if (document.getElementById('openRegister'))
    document.getElementById('openRegister').addEventListener('click', () => new bootstrap.Modal(document.getElementById('modalRegister')).show());
  if (document.getElementById('openLogin'))
    document.getElementById('openLogin').addEventListener('click', () => new bootstrap.Modal(document.getElementById('modalLogin')).show());

  // Join Buttons
  ['joinBasic', 'joinSilver', 'joinGold'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        const plan = btn.getAttribute('data-plan');
        document.getElementById('regPlan').value = plan;
        new bootstrap.Modal(document.getElementById('modalRegister')).show();
      });
    }
  });

  // Dashboard Logout
  document.getElementById('logoutClient').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });

});

function showClientDashboard(userId) {
  const clients = Store.loadData('shreek_clients_v2');
  const user = clients.find(c => c.id === userId);
  if (user) {
    updateDashboardUI(user);
    new bootstrap.Modal(document.getElementById('modalClientDashboard')).show();
  }
}

function updateDashboardUI(user) {
  document.getElementById('dashName').textContent = user.name;
  document.getElementById('dashEmail').textContent = user.email;
  document.getElementById('dashPhone').textContent = user.phone;

  // Plan Badge
  const planEl = document.getElementById('dashPlan');
  planEl.textContent = (user.plan || 'No Plan').toUpperCase();
  if (user.plan === 'gold') planEl.className = 'badge bg-warning text-dark';
  else if (user.plan === 'silver') planEl.className = 'badge bg-secondary text-white';
  else if (user.plan === 'basic') planEl.className = 'badge bg-info text-dark';
  else planEl.className = 'badge bg-light text-dark border';

  // Discount
  const discount = (user.plan === 'silver') ? 10 : (user.plan === 'gold' ? 15 : (user.plan === 'basic' ? 5 : 0));
  document.getElementById('dashDiscountVal').textContent = discount + '%';

  // History
  const list = document.getElementById('dashHistory');
  if (!user.history || !user.history.length) {
    list.innerHTML = '<p class="text-muted small text-center my-4">No service requests yet.</p>';
  } else {
    list.innerHTML = user.history.slice().reverse().map(h => `
            <div class="alert alert-light border mb-2 py-2 px-3 small">
                ${h}
            </div>
        `).join('');
  }
}