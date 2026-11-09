/**
 * Bearilly Migration: Replaces Supabase client with a proxy-based Bearilly API client.
 * All requests are routed through the same-origin /api/v1/ proxy.
 */

const apiClient = {
  get: async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Request failed');
    return { data: await res.json() };
  },
  post: async (url, data) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Request failed');
    return { data: await res.json() };
  },
};

export const createClient = () => {
  return {
    auth: {
      getUser: async () => {
        try {
          const response = await apiClient.get('/api/v1/auth/me');
          return { data: { user: response.data.data }, error: null };
        } catch (err) {
          return { data: { user: null }, error: err };
        }
      },
      signInWithPassword: async ({ email, password }) => {
        try {
          await fetch('/api/bearilly-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          return { data: { user: true }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      signUp: async ({ email, password, options }) => {
        try {
          const response = await apiClient.post('/api/v1/auth/register', {
            email,
            password,
            full_name: options?.data?.full_name,
            invite_code: options?.data?.invite_code,
          });
          return { data: { user: response.data.data }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
    },
    from: (table) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: new Error('Database access restricted. Use Bearilly API.') }),
        }),
      }),
    }),
  };
};