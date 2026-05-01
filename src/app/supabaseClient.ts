import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bivmvrgspcjuncjyszsh.supabase.co'
const supabaseKey = 'sb_publishable_F3Wln1IjUlu2yK0HxHGGxw_rT56ioca'

export const supabase = createClient(supabaseUrl, supabaseKey)