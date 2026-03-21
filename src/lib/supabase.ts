import { createClient } from '@supabase/supabase-js';

const env = import.meta.env;
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// diagnostic: Log keys to see what Vite actually detected
console.log('Vite detected keys:', Object.keys(env).filter(k => k.startsWith('VITE_')));
console.log('System Check: URL present?', !!supabaseUrl);
console.log('System Check: Key present?', !!supabaseAnonKey);

const isConfigured = Boolean(supabaseUrl && supabaseUrl.startsWith('http'));

export const supabase = createClient(
    isConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co', 
    isConfigured ? supabaseAnonKey : 'placeholder-key'
);

export const checkConfig = () => isConfigured;
