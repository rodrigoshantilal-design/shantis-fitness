/* ============================================================
   MOBILE-NAV.JS
   Gere o comportamento do menu hamburger em dispositivos móveis.
   Este ficheiro é partilhado por todas as páginas internas.
   ============================================================ */

// Abre/fecha o menu mobile ao clicar no botão hamburger
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-container .nav-links');
    const btn = document.getElementById('hamburgerBtn');
    if (!navLinks || !btn) return;
    navLinks.classList.toggle('mobile-open');
    btn.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', function () {
    // Fecha o menu ao clicar num link de navegação
    document.querySelectorAll('.nav-container .nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            const navLinks = document.querySelector('.nav-container .nav-links');
            const btn = document.getElementById('hamburgerBtn');
            if (navLinks) navLinks.classList.remove('mobile-open');
            if (btn) btn.classList.remove('active');
        });
    });

    // Fecha o menu ao clicar fora da navbar
    document.addEventListener('click', function (e) {
        const navbar = document.querySelector('.navbar');
        const btn = document.getElementById('hamburgerBtn');
        const navLinks = document.querySelector('.nav-container .nav-links');
        if (navbar && !navbar.contains(e.target)) {
            if (navLinks) navLinks.classList.remove('mobile-open');
            if (btn) btn.classList.remove('active');
        }
    });
});
