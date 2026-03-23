import { createClient } from '@supabase/supabase-js';

// Aggressively strip any character that isn't valid in a URL or Key (handles hidden Vercel/IDE characters)
const scrub = (val: string | undefined) => (val || '').replace(/[^\x21-\x7E]/g, '').trim();

const supabaseUrl = scrub(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = scrub(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isConfigured = Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('http') &&
    supabaseUrl.length > 20
);

if (!isConfigured) {
    console.warn('⚠️ Supabase Configuration Error:', {
        urlValid: supabaseUrl.startsWith('http'),
        urlLen: supabaseUrl.length,
        keyLen: supabaseAnonKey.length
    });
}

// Ensure createClient never receives an empty string for URL to avoid 'fetch' Invalid Value errors
export const supabase = createClient(
    supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true
        }
    }
);
