import { createClient } from '@supabase/supabase-js';

// Prioritize environment variables, fallback to hardcoded credentials if missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ifqbbardxxowrxkaqbge.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcWJiYXJkeHhvd3J4a2FxYmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDM1OTIsImV4cCI6MjA4OTY3OTU5Mn0.0lQBXQ8vR4LPL76zfIkLsjtDvRXJaqN_iTkUrpKdF5s';

export const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

if (isConfigured) {
    console.log('🚀 Supabase initialized with environment variables.');
} else {
    console.log('⚠️ Supabase initialized with fallback hardcoded credentials.');
}
