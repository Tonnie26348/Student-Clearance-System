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
        urlType: typeof import.meta.env.VITE_SUPABASE_URL,
        keyType: typeof import.meta.env.VITE_SUPABASE_ANON_KEY,
        urlLength: supabaseUrl.length,
        keyLength: supabaseAnonKey.length,
        urlPrefix: supabaseUrl.substring(0, 5),
        allEnvKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
    });
} else {
    console.log('🚀 Supabase initialized successfully.');
}

export const supabase = createClient(
    isConfigured ? supabaseUrl : 'https://placeholder.supabase.co', 
    isConfigured ? supabaseAnonKey : 'placeholder-key'
);
