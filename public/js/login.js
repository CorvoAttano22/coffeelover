import { apiFetch, deleteCookie } from './apiClient.js';

const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.querySelector('input[name="email"]').value;
  const password = form.querySelector('input[name="password"]').value;

  try {
    const res = await apiFetch('/api/authentication/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Login failed');
    }

    const data = await res.json();

    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      deleteCookie('guest_id');
      
      alert('Login successful!');
      form.reset();
      window.location.href = '/index.html'; 
    } else {
      throw new Error('Access token not found in response');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Error: ' + err.message);
  }
});
