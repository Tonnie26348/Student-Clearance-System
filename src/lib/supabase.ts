import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Trim whitespace which often causes fetch "Invalid value" errors
const supabaseUrl = rawUrl?.trim();
const supabaseAnonKey = rawKey?.trim();

// Enhanced check
export const isConfigured = Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.length > 10 && 
    supabaseUrl.startsWith('http') &&
    supabaseUrl.includes('.supabase.co')
);

if (!isConfigured) {
    console.warn('Supabase configuration is missing or invalid. Check your .env file.');
    console.log('Configuration details:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseAnonKey,
        validUrlFormat: supabaseUrl?.startsWith('http')
    });
}

export const supabase = createClient(
    isConfigured ? supabaseUrl : 'https://placeholder.supabase.co', 
    isConfigured ? supabaseAnonKey : 'placeholder-key'
);
