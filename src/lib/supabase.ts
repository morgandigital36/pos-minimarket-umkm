import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://raytmpwwpcuihbjxfcgt.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJheXRtcHd3cGN1aWhianhmY2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMjAyNDQsImV4cCI6MjA3Nzg5NjI0NH0.6rGweY9hF_bkNTKU7gFVRnMs51m6ry4grb467H4JNwE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)