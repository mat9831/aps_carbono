
//  SUPABASE — Configuração e funções compartilhadas

// Urls para o Supabase, incluindo a URL do projeto e a chave anônima (publicável).
const SUPABASE_URL    = 'https://ubudajlmkqwlskyqilqi.supabase.co';
const SUPABASE_ANON   = 'sb_publishable_yehNr-NdV-m7VoPiabmO9g_8CzNLUC5';

// Inicializa o cliente Supabase (carregado via CDN no HTML)
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);


//  Autenticação

/* Cadastra novo usuário */
async function sbSignUp(email, senha, nomeEmpresa) {
  const { data, error } = await _sb.auth.signUp({
    email,
    password: senha,
    options: { data: { nome_empresa: nomeEmpresa } }
  });
  return { data, error };
}

/** Login com email/senha */
async function sbSignIn(email, senha) {
  const { data, error } = await _sb.auth.signInWithPassword({ email, password: senha });
  return { data, error };
}

/** Sair */
async function sbSignOut() {
  await _sb.auth.signOut();
  window.location.href = 'login.html';
}

/** Retorna sessão ativa (ou null) */
async function sbGetSession() {
  const { data } = await _sb.auth.getSession();
  return data.session;
}

/** Retorna usuário atual (ou null) */
async function sbGetUser() {
  const { data } = await _sb.auth.getUser();
  return data.user ?? null;
}


//  CÁLCULOS
// entendimentos dos caculos
/**
 * Salva um cálculo no banco de dados.
 * Tabela esperada no Supabase:
 *
 *   CREATE TABLE calculos (
 *     id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *     user_id       uuid REFERENCES auth.users NOT NULL,
 *     criado_em     timestamptz DEFAULT now(),
 *     nome_empresa  text,
 *     km_empresa    numeric, km_entrega   numeric,
 *     litros_estac  numeric, kwh_empresa  numeric,
 *     km_func       numeric, pessoas      numeric,
 *     kwh_fugit     numeric, creditos     numeric,
 *     kg_total      numeric, toneladas    numeric,
 *     compensamento numeric, lucros       numeric,
 *     saldo         numeric
 *   );
 *
 *   -- RLS: usuário vê apenas seus próprios registros
 *   ALTER TABLE calculos ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "own" ON calculos
 *     USING (auth.uid() = user_id)
 *     WITH CHECK (auth.uid() = user_id);
 */
// salvar dados do calculo
async function sbSalvarCalculo(entradas, resultados) {
  const user = await sbGetUser();
  if (!user) return { error: 'Não autenticado' };

  const { error } = await _sb.from('calculos').insert({
    user_id:      user.id,
    nome_empresa: user.user_metadata?.nome_empresa ?? '',
    ...entradas,
    ...resultados
  });
  return { error };
}

/**
 * Busca os últimos N cálculos do usuário logado.
 */
async function sbListarCalculos(limite = 20) {
  const { data, error } = await _sb
    .from('calculos')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(limite);
  return { data, error };
}

/**
 * Deleta um cálculo pelo id (dono verificado via RLS).
 */
async function sbDeletarCalculo(id) {
  const { error } = await _sb.from('calculos').delete().eq('id', id);
  return { error };
}


// redireciona para login se não autenticado
async function requireAuth(redirSePath = 'login.html') {
  const session = await sbGetSession();
  if (!session) {
    window.location.href = redirSePath;
    return null;
  }
  return session.user;
}