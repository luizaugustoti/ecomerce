// Configuração do Supabase (Project Settings → API).
// A chave "anon" é pública por design: a segurança vem das políticas RLS em supabase/schema.sql.
// NUNCA coloque a chave "service_role" no front-end.
const SUPABASE_URL = 'https://njskjvydpokxhpxmakcc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GbH-bWWJqdqvFx1V4LjEqQ_CkDlpNq7';

window.sbClient = window.supabase && !SUPABASE_URL.includes('SEU-PROJETO')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
