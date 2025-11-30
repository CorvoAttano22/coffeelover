import { initializeCartFeatures, loadCartPage } from './cart.js';
import { checkUserStatus } from './user.js';
import { setupLogoutHandler } from './logout.js';
import { loadAllCoffees, loadProductDetail } from './product.js';

async function loadGlobalComponents() {
  try {
    const res = await fetch('navbar.html');
    const html = await res.text();
    const path = window.location.pathname;

    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
      navbarPlaceholder.innerHTML = html;
      
      initializeCartFeatures();
      checkUserStatus();
      setupLogoutHandler();

      if (window.location.pathname.endsWith('/cart.html')) {
        await loadCartPage();
      }
      else if (window.location.pathname.endsWith('/menu.html')) {
        await loadAllCoffees()
      }
      else if (window.location.pathname.endsWith('/product-single.html')) {
        await loadProductDetail()
      }
    }
  } catch (err) {
    console.error('Error loading global components:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadGlobalComponents);
