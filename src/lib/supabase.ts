import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Strict check
export const isConfigured = Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.length > 10 && 
    supabaseUrl.includes('supabase.co')
);

console.log('Supabase check:', { isConfigured, urlExists: !!supabaseUrl });

export const supabase = createClient(
    isConfigured ? supabaseUrl : 'https://placeholder.supabase.co', 
    isConfigured ? supabaseAnonKey : 'placeholder-key'
);
