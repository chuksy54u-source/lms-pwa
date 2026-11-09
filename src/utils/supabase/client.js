import axios from 'axios';

/**
 * Bearilly Migration: Replaces Supabase client with a proxy-based Bearilly API client.
 * All requests are routed through the same-origin /api/v1/ proxy.
 */

const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createClient = () => {
  return {
    auth: {
      getUser: async () => {
        try {
          const response = await apiClient.get('/auth/me');
          return { data: { user: response.data.data }, error: null };
        } catch (err) {
          return { data: { user: null }, error: err };
        }
      },
      signInWithPassword: async ({ email, password }) => {
        try {
          // Redirects to server-side login route as per contract
          await axios.post('/api/bearilly-login', { email, password });
          return { data: { user: true }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      signUp: async ({ email, password, options }) => {
        try {
          const response = await apiClient.post('/auth/register', {
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
    // Stub for legacy database calls; logic must be migrated to Bearilly API endpoints
    from: (table) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: new Error('Database access restricted. Use Bearilly API.') }),
        }),
      }),
    }),
  };
};