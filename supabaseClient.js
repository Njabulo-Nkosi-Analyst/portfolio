import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tafkbiwvxewddlkocysq.supabase.co'
const supabaseKey = 'sb_publishable_0ZB23W5Ni4cogAzKpd5Uyg_R38i_KAP'

export const supabase = createClient(supabaseUrl, supabaseKey)

