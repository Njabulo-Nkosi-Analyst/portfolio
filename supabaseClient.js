import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://tafkbiwvxewddlkocysq.supabase.co';
const supabaseKey = 'sb_publishable_0ZB23W5Ni4cogAzKpd5Uyg_R38i_KAP';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,  // ← Supabase will auto-exchange the code
        persistSession: true,
        autoRefreshToken: true,
        storage: window.localStorage
    }
});