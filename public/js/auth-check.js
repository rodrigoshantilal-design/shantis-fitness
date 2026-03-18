(function () {
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!user) {
    window.location.href = '/login.html';
  }
})();
