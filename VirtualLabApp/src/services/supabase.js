import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variables for Supabase configuration
const SUPABASE_URL = "https://zvkelfhmrjfvveembihp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2VsZmhtcmpmdnZlZW1iaWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NTQxOTIsImV4cCI6MjA3NjIzMDE5Mn0.pYNKv2BwrWwG2eJDrPBlXr8S3lLptoVph9Ql0y4IIO0";

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});