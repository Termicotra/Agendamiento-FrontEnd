import { useEffect, useState } from 'react';

export default function useUser() {
  const [user, setUser] = useState({ username: '', authenticated: false });

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.username || payload.user_id, authenticated: true });
      } catch {
        setUser({ username: '', authenticated: false });
      }
    } else {
      setUser({ username: '', authenticated: false });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('refresh_token');
    setUser({ username: '', authenticated: false });
  };

  const login = (token) => {
    localStorage.setItem('jwt', token);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ username: payload.username || payload.user_id, authenticated: true });
    } catch {
      setUser({ username: '', authenticated: false });
    }
  };

  return { ...user, logout, login };
}
