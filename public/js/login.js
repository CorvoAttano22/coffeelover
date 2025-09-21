// login.js
import { apiFetch } from './apiClient.js';

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
    console.log('Response:', data);

    alert('Login successful!');
    form.reset();
  } catch (err) {
    console.error('Error:', err);
    alert('Error: ' + err.message);
  }
});
