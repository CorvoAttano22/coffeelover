import { initializeCartFeatures, loadCartPage } from './cart.js';
import { checkUserStatus } from './user.js';
import { setupLogoutHandler } from './logout.js';
import { loadAllCoffees, loadProductDetail } from './product.js';

async function loadGlobalComponents() {
  try {
    const navRes = await fetch('navbar.html');
    const navHtml = await navRes.text();
    const navbarPlaceholder = document.getElementById('navbar-placeholder');

    if (navbarPlaceholder) {
      navbarPlaceholder.innerHTML = navHtml;

      initializeCartFeatures();
      checkUserStatus();
      setupLogoutHandler();

      const footerRes = await fetch('footer.html');
      const footerHtml = await footerRes.text();
      const footerPlaceholder = document.getElementById('footer-placeholder');

      if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHtml;
      }

      if (window.location.pathname.endsWith('/cart.html')) {
        await loadCartPage();
      } else if (window.location.pathname.endsWith('/menu.html')) {
        await loadAllCoffees();
      } else if (window.location.pathname.endsWith('/product-single.html')) {
        await loadProductDetail();
      }
    }
  } catch (err) {
    console.error('Error loading global components:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadGlobalComponents);
