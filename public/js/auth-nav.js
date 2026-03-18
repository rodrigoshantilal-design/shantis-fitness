(function () {
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const btn = document.querySelector('.nav-login-btn');
  if (!btn) return;

  if (user) {
    const name = user.name || user.email.split('@')[0];
    btn.outerHTML = `
      <div style="position:fixed;top:1rem;left:1.5rem;z-index:101;display:flex;align-items:center;gap:8px;">
        <span style="color:white;font-size:13px;font-weight:700;background:rgba(168,85,247,0.2);border:1px solid rgba(168,85,247,0.4);padding:6px 12px;border-radius:8px;">${name}</span>
        <button onclick="logout()" style="color:#9ca3af;font-size:12px;font-weight:700;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:6px 12px;border-radius:8px;cursor:pointer;">Logout</button>
      </div>`;
  }

  window.logout = function () {
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
  };
})();
