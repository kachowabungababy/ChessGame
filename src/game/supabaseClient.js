import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vgwymiuduzijrvguxslf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_IiV2gXTDl4Mtl7PC2NXXYg_DkMppOED';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
