let modoAtual = 'login';

  //  Alterna entre Login e Cadastro e atualiza a interface de acordo
function setModo(modo) {
    modoAtual = modo;
    const isCad = modo === 'cadastro';

    document.getElementById('tab-login').classList.toggle('active', !isCad);
    document.getElementById('tab-cadastro').classList.toggle('active', isCad);

    document.querySelectorAll('.only-cadastro').forEach(el => {
    el.style.display = isCad ? 'flex' : 'none';
    });
    document.querySelectorAll('.only-login').forEach(el => {
    el.style.display = isCad ? 'none' : 'block';
    });

    document.getElementById('form-title').textContent = isCad ? 'Criar sua conta' : 'Bem-vindo de volta';
    document.getElementById('form-sub').textContent   = isCad
    ? 'Preencha os dados abaixo para começar gratuitamente.'
    : 'Entre com sua conta para acessar a calculadora.';
    document.getElementById('btn-label').textContent  = isCad ? 'Criar conta e entrar' : 'Entrar na plataforma';
    document.getElementById('auth-switch').innerHTML  = isCad
    ? 'Já tem conta? <a onclick="setModo(\'login\')">Fazer login</a>'
    : 'Não tem uma conta? <a onclick="setModo(\'cadastro\')">Criar conta grátis</a>';

    limparMsg();
}

  //  Tela visibilidade da senha
function toggleSenha(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = 'Ocultar';
    } else {
    inp.type = 'password';
    btn.textContent = 'Mostrar';
    }
}

  //  Mensagens de erro e sucesso para o usuário
function showMsg(texto, tipo = 'erro') {
    const el = document.getElementById('auth-msg');
    el.textContent = texto;
    el.className = 'auth-msg ' + tipo;
}
function limparMsg() {
    const el = document.getElementById('auth-msg');
    el.textContent = '';
    el.className = 'auth-msg';
}

  // ── Estado de carregamento do formulário ──
function setLoading(on) {
    document.getElementById('spinner').style.display    = on ? 'block' : 'none';
    document.getElementById('btn-submit').disabled      = on;
    document.getElementById('btn-label').style.opacity  = on ? '0.5' : '1';
}

  //  Envia formulário
async function submitForm(e) {
    e.preventDefault();
    limparMsg();
    setLoading(true);

    const email = document.getElementById('inp-email').value.trim();
    const senha = document.getElementById('inp-senha').value;

    if (modoAtual === 'login') {
    const { data, error } = await sbSignIn(email, senha);
    if (error) {
        setLoading(false);
        const msg = error.message.includes('Invalid login')
        ? 'E-mail ou senha incorretos. Tente novamente.'
        // descartado essa autenticação
        // : error.message.includes('Email not confirmed')
        // ? 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'
        : 'Erro ao entrar: ' + error.message;
        showMsg(msg, 'erro');
        return;
    }
    window.location.href = 'calculadora.html';

    } else {
      // Cadastro
    const empresa   = document.getElementById('inp-empresa').value.trim();
    const confirmar = document.getElementById('inp-confirmar').value;

    if (!empresa) { setLoading(false); showMsg('Informe o nome da empresa.', 'erro'); return; }
    if (senha.length < 8) { setLoading(false); showMsg('A senha precisa ter no mínimo 8 caracteres.', 'erro'); return; }
    if (senha !== confirmar) { setLoading(false); showMsg('As senhas não coincidem.', 'erro'); return; }

    const { data, error } = await sbSignUp(email, senha, empresa);
    if (error) {
        setLoading(false);
        const msg = error.message.includes('already registered')
        ? 'Este e-mail já possui cadastro. Faça login.'
        : 'Erro ao cadastrar: ' + error.message;
        showMsg(msg, 'erro');
        return;
    }
    setLoading(false);
    showMsg('Conta criada com sucesso.', 'ok');
    }
    setLoading(false);
}

  //  Esqueceu a senha
async function esqueceuSenha(e) {
    e.preventDefault();
    const email = document.getElementById('inp-email').value.trim();
    if (!email) { showMsg('Digite seu e-mail acima para recuperar a senha.', 'erro'); return; }
    const { error } = await _sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/login.html'
    });
    if (error) { showMsg('Erro: ' + error.message, 'erro'); }
    else        { showMsg('✓ Link de recuperação enviado para ' + email, 'ok'); }
}

  //  Se já autenticado, redireciona direto para a calculadora
(async () => {
    const session = await sbGetSession();
    if (session) window.location.href = 'calculadora.html';
})();