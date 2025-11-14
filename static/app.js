document.addEventListener('DOMContentLoaded', () => {
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const authPanel = qs('#auth-panel');
  const panels = qs('#panels');
  const msgEl = qs('#message');
  const userName = qs('#user-name');
  const logoutBtn = qs('#logout-btn');
  const topLogoutBtn = qs('#top-logout-btn');
  const authToggle = qs('#btn-show-auth');
  const navButtons = qsa('.nav-btn');
  let currentUser = null;
  const sidebarNav = document.getElementById('sidebar-nav');
  function renderPanelActions(panelName) {
    if (!currentUser) return '';
    const buttons = [];
    if (panelName === 'produtos') {
      buttons.push(`<button class="btn footer-action" data-action="goto" data-target="pedidos">Ir para Pedidos</button>`);
      buttons.push(`<button class="btn footer-action" data-action="goto" data-target="lojas">Ir para Lojas</button>`);
    } else if (panelName === 'pedidos') {
      buttons.push(`<button class="btn footer-action" data-action="goto" data-target="entregas">Registrar Entrega</button>`);
      buttons.push(`<button class="btn footer-action" data-action="goto" data-target="produtos">Ver Produtos</button>`);
    } else if (panelName === 'entregas') {
      buttons.push(`<button class="btn footer-action" data-action="goto" data-target="pedidos">Ver Pedidos</button>`);
    } else if (panelName === 'lojas') {
      buttons.push(`<button class="btn footer-action" data-action="goto" data-target="produtos">Ver Produtos</button>`);
    }
    if (buttons.length === 0) return '';
    return `<div class="panel-footer" style="margin-top:12px;display:flex;gap:8px;justify-content:center">${buttons.join('')}</div>`;
  }
  function renderFooterButtons() {
    if (!currentUser) return '';
    const buttons = navButtons
      .filter(b => b.style.display !== 'none')
      .map(b => {
        const label = b.textContent.trim();
        const target = b.dataset.target;
        return `<button class="btn secondary footer-nav" data-target="${target}">${label}</button>`;
      }).join('');
    return `<div class="panel-footer" style="margin-top:12px;display:flex;gap:8px;justify-content:center">${buttons}</div>`;
  }
  function updateNavForRole(role) {
    navButtons.forEach(btn => {
      const allowed = btn.dataset.role || 'both';
      if (allowed === 'both' || allowed === role) {
        btn.style.display = '';
      } else {
        btn.style.display = 'none';
        btn.classList.remove('active');
      }
    });
    let active = document.querySelector('.nav-btn.active');
    if (!active || active.style.display === 'none') {
      const firstVisible = navButtons.find(b => b.style.display !== 'none');
      if (firstVisible) {
        navButtons.forEach(b => b.classList.remove('active'));
        firstVisible.classList.add('active');
      }
    }
  }
  function showMessage(text, type = 'success') {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = type === 'success' ? 'card success' : 'card error';
    msgEl.classList.remove('hidden');
    clearTimeout(showMessage._t);
    showMessage._t = setTimeout(() => msgEl.classList.add('hidden'), 3000);
  }
  window.showMessage = showMessage;
  async function api(path, opts = {}) {
    opts.credentials = 'same-origin';
    if (opts.body && typeof opts.body === 'object') {
      opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
      opts.body = JSON.stringify(opts.body);
    }
    const res = await fetch(path, opts);
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) throw { status: res.status, data };
    return data;
  }
  function afterLogin(user) {
    currentUser = user || null;
    if (userName) userName.textContent = user ? `${user.nome} (${user.role})` : 'Autenticado';
    if (sidebarNav) sidebarNav.classList.remove('hidden');
    if (user && user.role) updateNavForRole(user.role);
    else updateNavForRole(undefined);
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (topLogoutBtn) topLogoutBtn.classList.remove('hidden');
    if (authPanel) authPanel.classList.add('hidden');
    if (panels) panels.classList.remove('hidden');
    const active = document.querySelector('.nav-btn.active');
    loadPanel(active ? active.dataset.target : 'produtos');
  }
  function beforeLogout() {
    if (sidebarNav) sidebarNav.classList.add('hidden');
    if (userName) userName.textContent = 'Não autenticado';
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (topLogoutBtn) topLogoutBtn.classList.add('hidden');
    if (authPanel) authPanel.classList.remove('hidden');
    if (panels) { panels.classList.add('hidden'); panels.innerHTML = ''; }
  }
  (async function init() {
    try {
      const me = await api('/api/me');
      if (me && me.usuario) afterLogin(me.usuario);
      else beforeLogout();
    } catch (_) {
      beforeLogout();
    }
  })();
  if (authToggle) authToggle.addEventListener('click', () => {
    authPanel && authPanel.classList.toggle('hidden');
    panels && panels.classList.toggle('hidden');
  });
  const formLogin = qs('#form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target;
      try {
        await api('/api/login', { method: 'POST', body: { email: f.email.value, senha: f.senha.value } });
        let user = null;
        try {
          const me = await api('/api/me');
          user = me && me.usuario ? me.usuario : null;
        } catch (meErr) {
          console.error('Falha ao obter /api/me após login', meErr);
        }
        currentUser = user;
        if (sidebarNav) sidebarNav.classList.remove('hidden');
        afterLogin(user);
        showMessage('Login efetuado', 'success');
        f.reset();
      } catch (err) {
        console.error('Erro no POST /api/login', err);
        showMessage(err.data?.erro || 'Erro no login', 'error');
      }
    });
  }
  const formRegister = qs('#form-register');
  if (formRegister) {
    formRegister.addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target;
      try {
        const body = { nome: f.nome.value, email: f.email.value, senha: f.senha.value, role: f.role ? f.role.value : 'cliente' };
        const data = await api('/api/usuarios', { method: 'POST', body });
        let user = data && data.usuario ? data.usuario : null;
        if (!user) {
          try {
            const me = await api('/api/me');
            user = me && me.usuario ? me.usuario : null;
          } catch (_) {
            user = null;
          }
        }
        currentUser = user;
        if (sidebarNav) sidebarNav.classList.remove('hidden');
        afterLogin(user);
        showMessage('Registro efetuado e autenticado', 'success');
        f.reset();
      } catch (err) {
        showMessage(err.data?.erro || 'Erro no registro', 'error');
      }
    });
  }
  if (logoutBtn) logoutBtn.addEventListener('click', async () => {
    try { await api('/api/logout', { method: 'POST' }); } catch (_) {}
    beforeLogout();
    showMessage('Logout efetuado', 'success');
  });
  if (topLogoutBtn) topLogoutBtn.addEventListener('click', async () => {
    try { await api('/api/logout', { method: 'POST' }); } catch (_) {}
    beforeLogout();
    showMessage('Logout efetuado', 'success');
  });
  navButtons.forEach(btn => btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadPanel(btn.dataset.target);
  }));
  if (panels) {
    panels.addEventListener('click', async (e) => {
    const delBtn = e.target.closest && e.target.closest('.btn-del');
    if (delBtn) {
      console.log('🗑️ Botão de exclusão encontrado:', delBtn);
      const id = delBtn.dataset.id;
      const type = delBtn.dataset.type || (document.querySelector('.nav-btn.active')?.dataset.target || 'produtos');
      console.log(`🔍 ID: ${id}, Tipo: ${type}`);
      if (!id) return showMessage('ID do item inválido', 'error');
      if (!confirm('Confirma exclusão?')) return;
      try {
        console.log(`🚀 Fazendo requisição DELETE para: /api/${type}/${id}`);
        await api(`/api/${type}/${id}`, { method: 'DELETE' });
        console.log('✅ Exclusão bem-sucedida, recarregando painel');
        showMessage('Excluído', 'success');
        loadPanel(type);
      } catch (err) {
        console.error('❌ Erro na exclusão:', err);
        if (err.status === 401) { beforeLogout(); showMessage('Sessão expirada', 'error'); }
        else showMessage(err.data?.erro || 'Erro ao excluir', 'error');
      }
      return;
    }
      const approveBtn = e.target.closest && e.target.closest('.btn-aprovar');
      if (approveBtn) {
        const id = approveBtn.dataset.id;
        if (!id) return showMessage('ID do pedido inválido', 'error');
        if (!confirm('Aprovar este pedido?')) return;
        try {
          await api(`/api/pedidos/${id}/aprovar`, { method: 'POST' });
          showMessage('Pedido aprovado', 'success');
          loadPanel('pedidos');
        } catch (err) {
          if (err.status === 401) { beforeLogout(); showMessage('Sessão expirada', 'error'); }
          else showMessage(err.data?.erro || 'Erro ao aprovar', 'error');
        }
        return;
      }
      const footerNavBtn = e.target.closest && e.target.closest('.footer-nav');
      if (footerNavBtn) {
        const target = footerNavBtn.dataset.target;
        navButtons.forEach(b => b.classList.remove('active'));
        const btn = navButtons.find(b => b.dataset.target === target && b.style.display !== 'none');
        if (btn) btn.classList.add('active');
        loadPanel(target);
        return;
      }
      const footerActionBtn = e.target.closest && e.target.closest('.footer-action');
      if (footerActionBtn) {
        const target = footerActionBtn.dataset.target;
        const action = footerActionBtn.dataset.action;
        if (action === 'goto' && target) {
          navButtons.forEach(b => b.classList.remove('active'));
          const btn = navButtons.find(b => b.dataset.target === target && b.style.display !== 'none');
          if (btn) btn.classList.add('active');
          await loadPanel(target);
          setTimeout(() => {
            const firstInput = panels.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
          }, 100);
        }
        return;
      }
      panels.addEventListener('submit', async (e) => {
        if (!e.target) return;
        e.preventDefault();
        const form = e.target;
        if (form.dataset.submitting === '1') return;
        form.dataset.submitting = '1';
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        try {
          if (form.id === 'form-produto') {
            await api('/api/produtos', { method: 'POST', body: { nome: form.nome.value, preco: form.preco.value } });
            showMessage('Produto criado', 'success'); loadPanel('produtos');
          } else if (form.id === 'form-pedido') {
            await api('/api/pedidos', { method: 'POST', body: { descricao: form.descricao.value, valor: form.valor.value } });
            showMessage('Pedido criado', 'success'); loadPanel('pedidos');
          } else if (form.id === 'form-entrega') {
            await api('/api/entregas', { method: 'POST', body: { destinatario: form.destinatario.value, status: form.status.value } });
            showMessage('Entrega criada', 'success'); loadPanel('entregas');
          } else if (form.id === 'form-loja') {
            await api('/api/lojas', { method: 'POST', body: { nome: form.nome.value, cidade: form.cidade.value } });
            showMessage('Loja criada', 'success'); loadPanel('lojas');
          }
        } catch (err) {
          if (err.status === 401) { beforeLogout(); showMessage('Sessão expirada', 'error'); }
          else if (err.status === 409) { showMessage(err.data?.erro || 'Recurso já existe', 'error'); }
          else showMessage(err.data?.erro || 'Erro ao enviar', 'error');
        } finally {
          delete form.dataset.submitting;
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    });
  }
  async function loadPanel(name) {
    if (!panels) return;
    if (loadPanel._busy) return;
    loadPanel._busy = true;
    panels.innerHTML = '';
    try {
      const html = await api(`/api/painel/${name}`);
      panels.innerHTML = html;
      setupPanelEvents(name);
    } catch (err) {
      panels.innerHTML = `<div class="error">Erro ao carregar painel: ${err.data?.erro || err.message}</div>`;
    } finally {
      loadPanel._busy = false;
    }
  }
  function setupPanelEvents(panelName) {
    if (panelName === 'produtos') {
      setupProdutosEvents();
    } else if (panelName === 'pedidos') {
      setupPedidosEvents();
    } else if (panelName === 'entregas') {
      setupEntregasEvents();
    } else if (panelName === 'lojas') {
      setupLojasEvents();
    } else if (panelName === 'usuarios') {
      setupUsuariosEvents();
    }
  }
  function setupProdutosEvents() {
    const form = document.getElementById('produto-form');
    const itemsContainer = document.getElementById('produtos-items');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('produto-nome').value;
        const preco = document.getElementById('produto-preco').value;
        try {
          const response = await api('/api/produtos', {
            method: 'POST',
            body: { nome, preco: parseFloat(preco) }
          });
          form.reset();
          loadProdutosList();
          showMessage('Produto cadastrado com sucesso!', 'success');
        } catch (error) {
          console.error('Erro ao cadastrar produto:', error);
          showMessage(error.data?.erro || 'Erro ao cadastrar produto', 'error');
        }
      });
    }
    loadProdutosList();
  }
  function setupPedidosEvents() {
    const form = document.getElementById('pedido-form');
    if (form) {
      console.log('✅ Pedidos - Configurando formulário');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Pedidos - Submit');
        const descricao = document.getElementById('pedido-descricao').value;
        const valor = document.getElementById('pedido-valor').value;
        try {
          const response = await api('/api/pedidos', {
            method: 'POST',
            body: { descricao, valor: parseFloat(valor) }
          });
          form.reset();
          loadPedidosList();
          showMessage('Pedido criado com sucesso!', 'success');
        } catch (error) {
          console.error('Erro ao criar pedido:', error);
          showMessage(error.data?.erro || 'Erro ao criar pedido', 'error');
        }
      });
    }
    loadPedidosList();
  }
  function setupEntregasEvents() {
    const form = document.getElementById('entrega-form');
    if (form) {
      console.log('✅ Entregas - Configurando formulário');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Entregas - Submit');
        const destinatario = document.getElementById('entrega-destinatario').value;
        const status = document.getElementById('entrega-status').value;
        try {
          const response = await api('/api/entregas', {
            method: 'POST',
            body: { destinatario, status }
          });
          form.reset();
          loadEntregasList();
          showMessage('Entrega registrada com sucesso!', 'success');
        } catch (error) {
          console.error('Erro ao registrar entrega:', error);
          showMessage(error.data?.erro || 'Erro ao registrar entrega', 'error');
        }
      });
    }
    loadEntregasList();
  }
  function setupLojasEvents() {
    const form = document.getElementById('loja-form');
    if (form) {
      console.log('✅ Lojas - Configurando formulário');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Lojas - Submit');
        const nome = document.getElementById('loja-nome').value;
        const cidade = document.getElementById('loja-cidade').value;
        try {
          const response = await api('/api/lojas', {
            method: 'POST',
            body: { nome, cidade }
          });
          form.reset();
          loadLojasList();
          showMessage('Loja cadastrada com sucesso!', 'success');
        } catch (error) {
          console.error('Erro ao cadastrar loja:', error);
          showMessage(error.data?.erro || 'Erro ao cadastrar loja', 'error');
        }
      });
    }
    loadLojasList();
  }
  function setupUsuariosEvents() {
    loadUsuariosList();
  }
  async function loadProdutosList() {
    try {
      const produtos = await api('/api/produtos');
      const container = document.getElementById('produtos-items');
      if (!container) {
        console.error('Container produtos-items não encontrado!');
        return;
      }
      container.innerHTML = '';
      produtos.forEach((produto, index) => {
        const item = document.createElement('div');
        item.className = 'item card';
        const html = `
          <div class="item-info">
            <h4>${produto.nome}</h4>
            <p>Preço: R$ ${produto.preco.toFixed(2)}</p>
            <small>Criado em: ${new Date(produto.criadoEm).toLocaleDateString()}</small>
          </div>
          <div class="item-actions">
            <button class="btn secondary" onclick="window.deleteProduto('${produto._id}')">Excluir</button>
          </div>
        `;
        item.innerHTML = html;
        container.appendChild(item);
      });
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      throw error;
    }
  }
  async function loadPedidosList() {
    try {
      const pedidos = await api('/api/pedidos');
      const container = document.getElementById('pedidos-items');
      if (!container) return;
      container.innerHTML = '';
      pedidos.forEach(pedido => {
        const item = document.createElement('div');
        item.className = 'item card';
        const statusClass = pedido.status === 'approved' ? 'success' : 'warning';
        item.innerHTML = `
          <div class="item-info">
            <h4>${pedido.descricao}</h4>
            <p>Valor: R$ ${pedido.valor.toFixed(2)}</p>
            <p class="${statusClass}">Status: ${pedido.status}</p>
            <small>Criado em: ${new Date(pedido.criadoEm).toLocaleDateString()}</small>
          </div>
          <div class="item-actions">
            ${pedido.status !== 'approved' ? `<button class="btn primary btn-aprovar" data-id="${pedido._id}" data-type="pedidos">Aprovar</button>` : ''}
            <button class="btn secondary btn-del" data-id="${pedido._id}" data-type="pedidos">Excluir</button>
          </div>
        `;
        container.appendChild(item);
      });
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  }
  async function loadEntregasList() {
    try {
      const entregas = await api('/api/entregas');
      const container = document.getElementById('entregas-items');
      if (!container) return;
      container.innerHTML = '';
      entregas.forEach(entrega => {
        const item = document.createElement('div');
        item.className = 'item card';
        const statusClass = entrega.status === 'entregue' ? 'success' : entrega.status === 'em_transito' ? 'warning' : 'secondary';
        item.innerHTML = `
          <div class="item-info">
            <h4>Destinatário: ${entrega.destinatario}</h4>
            <p class="${statusClass}">Status: ${entrega.status}</p>
            <small>Criado em: ${new Date(entrega.criadoEm).toLocaleDateString()}</small>
          </div>
          <div class="item-actions">
            <button class="btn secondary btn-del" data-id="${entrega._id}" data-type="entregas">Excluir</button>
          </div>
        `;
        container.appendChild(item);
      });
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
    }
  }
  async function loadLojasList() {
    try {
      const lojas = await api('/api/lojas');
      const container = document.getElementById('lojas-items');
      if (!container) return;
      container.innerHTML = '';
      lojas.forEach(loja => {
        const item = document.createElement('div');
        item.className = 'item card';
        item.innerHTML = `
          <div class="item-info">
            <h4>${loja.nome}</h4>
            <p>Cidade: ${loja.cidade}</p>
            <small>Criado em: ${new Date(loja.criadoEm).toLocaleDateString()}</small>
          </div>
          <div class="item-actions">
            <button class="btn secondary btn-del" data-id="${loja._id}" data-type="lojas">Excluir</button>
          </div>
        `;
        container.appendChild(item);
      });
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
    }
  }
  async function loadUsuariosList() {
    try {
      const usuarios = await api('/api/usuarios');
      const container = document.getElementById('usuarios-items');
      if (!container) return;
      container.innerHTML = '';
      usuarios.forEach(usuario => {
        const item = document.createElement('div');
        item.className = 'item card';
        const roleClass = usuario.role === 'vendedor' ? 'primary' : 'secondary';
        item.innerHTML = `
          <div class="item-info">
            <h4>${usuario.nome}</h4>
            <p>Email: ${usuario.email}</p>
            <p class="${roleClass}">Papel: ${usuario.role}</p>
            <small>Criado em: ${new Date(usuario.criadoEm).toLocaleDateString()}</small>
          </div>
        `;
        container.appendChild(item);
      });
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }
  window.deleteProduto = async function(id) {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    try {
      await api(`/api/produtos/${id}`, { method: 'DELETE' });
      showMessage('Produto excluído com sucesso!', 'success');
      setTimeout(async () => {
        try {
          await loadProdutosList();
        } catch (listError) {
          console.error('Erro ao recarregar lista:', listError);
          showMessage('Produto excluído, mas erro ao atualizar lista. Recarregue a página.', 'warning');
        }
      }, 500);
    } catch (error) {
      if (error.status === 404) {
        showMessage('Produto não encontrado', 'error');
      } else if (error.status === 401) {
        showMessage('Sessão expirada. Faça login novamente.', 'error');
        beforeLogout();
      } else {
        showMessage(`Erro ao excluir produto: ${error.data?.erro || error.message || 'Erro desconhecido'}`, 'error');
      }
    }
  };
});