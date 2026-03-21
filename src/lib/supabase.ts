import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail-safe initialization to prevent hard crash on Vercel
const isConfigured = supabaseUrl && supabaseUrl.startsWith('http');

if (!isConfigured) {
  console.error('CRITICAL: Supabase environment variables are missing or invalid.');
}

export const supabase = createClient(
    isConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co', 
    isConfigured ? supabaseAnonKey : 'placeholder-key'
);

export const checkConfig = () => isConfigured;
