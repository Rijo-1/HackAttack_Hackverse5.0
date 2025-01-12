import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmsslszefpymkcvyxxcs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtc3Nsc3plZnB5bWtjdnl4eGNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwNzg1NjYsImV4cCI6MjA1MTY1NDU2Nn0.zKqoyVzUTLDQfBwXM4CW4rNJqacSuyHIxGF442Xjj3U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 