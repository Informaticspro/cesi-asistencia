import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jsovuliafimiyxqtsnya.supabase.co' // <-- reemplaza con tu URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzb3Z1bGlhZmltaXl4cXRzbnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTMxNzAsImV4cCI6MjA2NzA2OTE3MH0.ijHfXdRLX_i7puzHQ6LaAB3TZBfjB9FbjFH03883I5E'    // <-- reemplaza con tu clave

export const supabase = createClient(supabaseUrl, supabaseKey)