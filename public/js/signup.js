import { apiFetch } from './apiClient.js';

const form = document.getElementById('signupForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value;

  if (!email) {
    alert('Email is required.');
    return;
  }
  if (password.length < 10) {
    alert('Password must be at least 10 characters.');
    return;
  }

  try {
    const res = await apiFetch('/api/authentication/sign-up', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let errorMsg;
      try {
        const errData = await res.json();
        errorMsg = errData.message || 'Request failed';
      } catch {
        errorMsg = await res.text();
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    console.log('Response:', data);
    alert('Sign-up successful! You can now log in.');
    form.reset();
  } catch (err) {
    console.error('Error:', err);
    alert('Error: ' + err.message);
  }
});
