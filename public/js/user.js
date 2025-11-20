import { apiFetch } from './apiClient.js';

export async function checkUserStatus() {
  const loginItem = document.getElementById('login-nav-item');
  const logoutItem = document.getElementById('logout-nav-item');

  if (!loginItem || !logoutItem) {
    console.warn(
      'Login/Logout navigation items not found. Skipping user status check.',
    );
    return;
  }

  try {
    const res = await apiFetch('/api/authentication/me');

    if (res.ok) {
      loginItem.classList.add('d-none');
      logoutItem.classList.remove('d-none');
    } else {
      throw new Error();
    }
  } catch (e) {
    loginItem.classList.remove('d-none');
    logoutItem.classList.add('d-none');
  }
}
