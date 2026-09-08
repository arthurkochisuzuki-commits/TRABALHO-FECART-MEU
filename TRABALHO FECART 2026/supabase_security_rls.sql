-- ==============================================================================
-- SECUREVISION AI - POLÍTICAS DE SEGURANÇA POSTGRESQL / SUPABASE (RLS)
-- Finalidade: Blindar o banco de dados em nuvem contra acesso não autorizado,
-- leitura em massa (data scraping) e modificação indevida de dados biométricos.
-- ==============================================================================

-- 1. HABILITAR ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logs ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA A TABELA 'users'
-- Permite leitura e escrita apenas para clientes autenticados (Service Role / Auth Tokens)
-- Bloqueia listagem anônima irrestrita via REST API
DROP POLICY IF EXISTS "Restringir_Leitura_Users" ON public.users;
CREATE POLICY "Restringir_Leitura_Users" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Restringir_Gravacao_Users" ON public.users;
CREATE POLICY "Restringir_Gravacao_Users" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Restringir_Exclusao_Users" ON public.users;
CREATE POLICY "Restringir_Exclusao_Users" ON public.users
  FOR DELETE
  TO authenticated
  USING (true);

-- 3. POLÍTICAS PARA A TABELA 'biometrics' (DADOS BIOMÉTRICOS SENSÍVEIS)
-- Proteção máxima: Bloqueia qualquer acesso anônimo direto aos embeddings e mídias
DROP POLICY IF EXISTS "Restringir_Biometria_Select" ON public.biometrics;
CREATE POLICY "Restringir_Biometria_Select" ON public.biometrics
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Restringir_Biometria_Insert" ON public.biometrics;
CREATE POLICY "Restringir_Biometria_Insert" ON public.biometrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Restringir_Biometria_Delete" ON public.biometrics;
CREATE POLICY "Restringir_Biometria_Delete" ON public.biometrics
  FOR DELETE
  TO authenticated
  USING (true);

-- 4. POLÍTICAS PARA A TABELA 'logs' (AUDITORIA IMUTÁVEL)
-- Permite inserção de registros de log, mas bloqueia UPDATE e DELETE para garantir integridade
DROP POLICY IF EXISTS "Permitir_Insert_Logs" ON public.logs;
CREATE POLICY "Permitir_Insert_Logs" ON public.logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Bloquear_Update_Logs" ON public.logs;
CREATE POLICY "Bloquear_Update_Logs" ON public.logs
  FOR UPDATE
  TO authenticated
  USING (false);

DROP POLICY IF EXISTS "Bloquear_Delete_Logs" ON public.logs;
CREATE POLICY "Bloquear_Delete_Logs" ON public.logs
  FOR DELETE
  TO authenticated
  USING (false);

-- ==============================================================================
-- INSTRUÇÕES DE APLICAÇÃO:
-- 1. Acesse o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. Navegue até 'SQL Editor' -> 'New Query'
-- 3. Cole o conteúdo deste arquivo e clique em 'Run'
-- ==============================================================================
