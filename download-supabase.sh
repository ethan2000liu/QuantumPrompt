#!/bin/bash

# Create lib directory if it doesn't exist
mkdir -p lib

# Download Supabase client
curl -L https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js -o lib/supabase-js.js 