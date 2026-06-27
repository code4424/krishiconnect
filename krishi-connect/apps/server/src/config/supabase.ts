import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { env } from './env.js';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  realtime: { transport: ws },
});

export const SUPABASE_BUCKET = 'Krishiconnect';
