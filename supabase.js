import { createClient } from '@supabase/supabase-js'
import { config } from './config.js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY) 