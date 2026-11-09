import { cookies } from 'next/headers';

/**
 * Bearilly Migration: Server-side proxy client.
 * This utility provides a unified interface for server-side routes to interact
 * with the Bearilly API via the authenticated session cookie.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return {
    /**
     * Bearilly API Proxy Helper
     * Routes requests through the internal proxy to the Bearilly backend.
     * @param {string} endpoint - The relative path (e.g., '/api/v1/auth/me')
     * @param {RequestInit} options - Fetch options
     */
    async fetch(endpoint, options = {}) {
      const session = cookieStore.get('bearilly-session');
      
      const headers = new Headers(options.headers || {});
      if (session) {
        headers.set('x-bearilly-session', session.value);
      }
      headers.set('Content-Type', 'application/json');

      const response = await fetch(`${process.env.BEARILLY_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Bearilly API error: ${response.statusText}`);
      }

      const result = await response.json();
      // Unwrap Bearilly success JSON structure
      return result.data;
    },

    /**
     * TODO: Retain legacy Supabase logic as a safe stub if required by 
     * non-migrated modules, otherwise prefer Bearilly API calls.
     */
    async getLegacyUser() {
      return null;
    }
  };
}