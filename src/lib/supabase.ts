import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials to ensure immediate functionality
const supabaseUrl = 'https://ifqbbardxxowrxkaqbge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcWJiYXJkeHhvd3J4a2FxYmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDM1OTIsImV4cCI6MjA4OTY3OTU5Mn0.0lQBXQ8vR4LPL76zfIkLsjtDvRXJaqN_iTkUrpKdF5s';

export const isConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

console.log('🚀 Supabase initialized with hardcoded credentials.');
