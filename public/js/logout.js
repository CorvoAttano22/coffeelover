import { apiFetch } from './apiClient.js';

export async function setupLogoutHandler() {
  const logoutButton = document.getElementById('logout-button');

  if (logoutButton) {
    logoutButton.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        await apiFetch('/api/authentication/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (err) {
        console.error(
          'Server logout failed, proceeding with client-side logout:',
          err,
        );
      }

      localStorage.removeItem('accessToken');

      alert('You have been logged out.');
      window.location.href = '/sign-in.html';
    });
  } else {
    console.warn('Logout button element (id="logout-button") not found.');
  }
}
