import { useState, useEffect } from 'react';
import api from '../api/axios';

let cachedSettings = null;
let fetchPromise = null;

export function useSiteSettings() {
  const [settings, setSettings] = useState(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    let cancelled = false;

    // 防止并发重复请求
    if (!fetchPromise) {
      fetchPromise = api.get('/settings').then((res) => res.data.settings);
    }

    fetchPromise
      .then((data) => {
        if (!cancelled) {
          cachedSettings = data;
          setSettings(data);
          setLoading(false);
          fetchPromise = null;
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
        fetchPromise = null;
      });

    return () => { cancelled = true; };
  }, []);

  // 清除缓存（例如更新设置后调用）
  const refresh = () => {
    cachedSettings = null;
    fetchPromise = null;
    setLoading(true);
    api.get('/settings')
      .then((res) => {
        cachedSettings = res.data.settings;
        setSettings(cachedSettings);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  return { settings, loading, error, refresh };
}
