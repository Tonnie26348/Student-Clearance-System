import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Diagnostic logs (visible in browser console F12)
console.log('System Check: URL present?', !!supabaseUrl);
console.log('System Check: Key present?', !!supabaseAnonKey);

const isConfigured = Boolean(supabaseUrl && supabaseUrl.startsWith('http'));

export const supabase = createClient(
    isConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co', 
    isConfigured ? supabaseAnonKey : 'placeholder-key'
);

export const checkConfig = () => isConfigured;
