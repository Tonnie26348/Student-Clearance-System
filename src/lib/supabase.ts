import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Aggressively cleans strings of all whitespace, newlines, and hidden characters 
 * (like zero-width spaces) which frequently cause fetch "Invalid value" errors.
 */
const clean = (str: string | undefined) => str ? str.replace(/[\s\u200B-\u200D\uFEFF]/g, '') : '';

const supabaseUrl = clean(rawUrl);
const supabaseAnonKey = clean(rawKey);

export const isConfigured = Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.length > 10 && 
    supabaseUrl.startsWith('http') &&
    supabaseUrl.includes('.supabase.co')
);

// Diagnostic logging for debugging "Invalid value" fetch errors
if (isConfigured) {
    console.log('🚀 Supabase client initialized:', {
        urlLength: supabaseUrl.length,
        keyLength: supabaseAnonKey.length,
        urlValid: supabaseUrl.startsWith('https://')
    });
} else {
    console.warn('⚠️ Supabase configuration missing or invalid.');
}

export const supabase = createClient(
    isConfigured ? supabaseUrl : 'https://placeholder.supabase.co', 
    isConfigured ? supabaseAnonKey : 'placeholder-key',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);
