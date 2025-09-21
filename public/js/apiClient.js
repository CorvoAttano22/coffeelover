// apiClient.js
export async function apiFetch(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;

  const res = await fetch(fullUrl, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 401) {
    if (
      fullUrl.includes('/sign-in') ||
      fullUrl.includes('/sign-up') ||
      fullUrl.includes('/refresh-tokens')
    ) {
      return res;
    }

    console.warn('Access token expired, refreshing...');

    const refreshRes = await fetch(
      'http://localhost:3000/api/authentication/refresh-tokens',
      {
        method: 'POST',
        credentials: 'include',
      },
    );

    if (!refreshRes.ok) {
      throw new Error('Refresh token expired. Please log in again.');
    }

    return apiFetch(url, options);
  }

  return res;
}

//add redirect to login in case of no token
