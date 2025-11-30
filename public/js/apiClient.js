export async function apiFetch(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;

  const token = localStorage.getItem('accessToken');

  const baseHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  //token check to avoid refresh loop
  if (token) {
    baseHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(fullUrl, {
    ...options,
    headers: baseHeaders,
  });
  
  if (res.status === 401) {
    if (!token) {
      localStorage.removeItem('accessToken');
      return res;
    }

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
      console.error('Failed to refresh token. Redirecting to login.');
      localStorage.removeItem('accessToken');
      window.location.href = '/sign-in.html';
      return refreshRes;
    }

    const { accessToken: newAccessToken } = await refreshRes.json();
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
      console.log('Token refreshed successfully.');
    } else {
      console.error('Refresh response did not contain a new access token.');
      localStorage.removeItem('accessToken');
      window.location.href = '/sign-in.html';
      return refreshRes;
    }

    return apiFetch(url, options);
  }

  return res;
}

export function deleteCookie(name) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}
