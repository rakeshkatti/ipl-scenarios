// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wnynuevwnopsqxcqtdji.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueW51ZXZ3bm9wc3F4Y3F0ZGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ3NjE1OTgsImV4cCI6MjAzMDMzNzU5OH0.y2f5yvNRKFRq6IBIMbeaeQRPTM5FX6oPHenrRTpRjak";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
