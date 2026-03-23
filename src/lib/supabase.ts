import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isConfigured = Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('http')
);

// Detailed logging for debugging (safe - doesn't leak keys)
if (!isConfigured) {
    console.warn('⚠️ Supabase Config Diagnostic:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        urlValid: supabaseUrl.startsWith('http'),
        urlValue: supabaseUrl ? supabaseUrl.substring(0, 10) + '...' : 'none'
    });
} else {
    console.log('🚀 Supabase initialized successfully.');
}

export const supabase = createClient(
    isConfigured ? supabaseUrl : 'https://placeholder.supabase.co', 
    isConfigured ? supabaseAnonKey : 'placeholder-key'
);
