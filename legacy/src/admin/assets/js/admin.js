document.addEventListener('DOMContentLoaded', function () {
  const menuBtn = document.querySelector('[data-menu-btn]');
  const sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Highlight active link
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.endsWith(path)) {
      a.classList.add('active');
    }
  });
});