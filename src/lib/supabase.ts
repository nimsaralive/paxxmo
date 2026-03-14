import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mkgjboaecnhamjijwogq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZ2pib2FlY25oYW1qaWp3b2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NjY1NjQsImV4cCI6MjA4ODM0MjU2NH0.meIt2RCHSuAcZFWnX2JBAu0xFyjf60NAEeG-Dz00VbE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  budget: string | null;
  message: string;
  created_at: string;
}
