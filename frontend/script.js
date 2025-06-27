// Configuração da API
const API_BASE_URL = '/api';

// Variáveis globais
let idEdicaoAtual = null;
let idLenteEstoqueAtual = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacao();
    carregarTodasLentes();
    configurarEnvioFormulario();
});

// Verificar se o usuário está autenticado
async function verificarAutenticacao() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuario-atual`, {
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = '/login';
            return;
        }

        const userData = await response.json();
        console.log('Usuário logado:', userData.nome);
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        window.location.href = '/login';
    }
}

// Configurar submissão do formulário
function configurarEnvioFormulario() {
    const form = document.getElementById('formularioLente');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (idEdicaoAtual) {
            atualizarLente();
        } else {
            adicionarLente();
        }
    });
}

// Carregar todas as lentes
async function carregarTodasLentes() {
    try {
        mostrarCarregamento();
        const response = await fetch(`${API_BASE_URL}/lentes`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar lentes');
        }
        
        const lentes = await response.json();
        exibirLentes(lentes);
        atualizarResumo(lentes);
    } catch (error) {
        console.error('Erro ao carregar lentes:', error);
        mostrarErro('Erro ao carregar as lentes. Verifique se o servidor está rodando.');
    }
}

// Buscar lentes
async function buscarLentes() {
    const nome = document.getElementById('buscarNome').value;
    const marca = document.getElementById('buscarMarca').value;
    const grau = document.getElementById('buscarGrau').value;
    
    try {
        mostrarCarregamento();
        const params = new URLSearchParams();
        if (nome) params.append('nome', nome);
        if (marca) params.append('marca', marca);
        if (grau) params.append('grau', grau);
        
        const response = await fetch(`${API_BASE_URL}/lentes?${params}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao buscar lentes');
        }
        
        const lentes = await response.json();
        exibirLentes(lentes);
        atualizarResumo(lentes);
    } catch (error) {
        console.error('Erro ao buscar lentes:', error);
        mostrarErro('Erro ao buscar lentes. Tente novamente.');
    }
}

// Adicionar nova lente
async function adicionarLente() {
    const dadosLente = obterDadosFormulario();
    
    if (!validarDados(dadosLente)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/lentes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(dadosLente)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro ao adicionar lente');
        }
        
        mostrarSucesso('Lente adicionada com sucesso!');
        limparFormulario();
        carregarTodasLentes();
    } catch (error) {
        console.error('Erro ao adicionar lente:', error);
        mostrarErro(error.message);
    }
}

// Atualizar lente existente
async function atualizarLente() {
    const dadosLente = obterDadosFormulario();
    
    if (!validarDados(dadosLente)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/lentes/${idEdicaoAtual}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(dadosLente)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro ao atualizar lente');
        }
        
        mostrarSucesso('Lente atualizada com sucesso!');
        cancelarEdicao();
        carregarTodasLentes();
    } catch (error) {
        console.error('Erro ao atualizar lente:', error);
        mostrarErro(error.message);
    }
}

// Excluir lente
async function excluirLente(id) {
    if (!confirm('Tem certeza que deseja excluir esta lente?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/lentes/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro ao excluir lente');
        }
        
        mostrarSucesso('Lente excluída com sucesso!');
        carregarTodasLentes();
    } catch (error) {
        console.error('Erro ao excluir lente:', error);
        mostrarErro(error.message);
    }
}

// Editar lente
function editarLente(lente) {
    idEdicaoAtual = lente.id;
    
    // Preencher formulário
    document.getElementById('nome').value = lente.nome;
    document.getElementById('marca').value = lente.marca;
    document.getElementById('grauEsferico').value = lente.grau_esferico;
    document.getElementById('grauCilindrico').value = lente.grau_cilindrico || '';
    document.getElementById('eixo').value = lente.eixo || '';
    document.getElementById('quantidade').value = lente.quantidade;
    document.getElementById('preco').value = lente.preco;
    document.getElementById('descricao').value = lente.descricao || '';
    
    // Atualizar interface
    document.getElementById('tituloFormulario').textContent = '✏️ Editar Lente';
    document.getElementById('btnSalvar').textContent = '💾 Atualizar Lente';
    
    // Rolar para o formulário
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Cancelar edição
function cancelarEdicao() {
    idEdicaoAtual = null;
    limparFormulario();
    document.getElementById('tituloFormulario').textContent = '➕ Adicionar Nova Lente';
    document.getElementById('btnSalvar').textContent = '💾 Salvar Lente';
}

// Abrir modal de ajuste de estoque
function abrirModalEstoque(lente) {
    idLenteEstoqueAtual = lente.id;
    document.getElementById('nomelenteEstoque').textContent = lente.nome;
    document.getElementById('estoqueAtual').textContent = lente.quantidade;
    document.getElementById('quantidadeMovimento').value = '';
    document.getElementById('tipoMovimento').value = 'entrada';
    document.getElementById('modalEstoque').style.display = 'flex';
}

// Fechar modal de estoque
function fecharModalEstoque() {
    document.getElementById('modalEstoque').style.display = 'none';
    idLenteEstoqueAtual = null;
}

// Confirmar ajuste de estoque
async function confirmarAjusteEstoque() {
    const tipo = document.getElementById('tipoMovimento').value;
    const quantidade = parseInt(document.getElementById('quantidadeMovimento').value);
    
    if (!quantidade || quantidade <= 0) {
        mostrarErro('Por favor, informe uma quantidade válida.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/lentes/${idLenteEstoqueAtual}/ajustar-estoque`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                tipo: tipo,
                quantidade: quantidade
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro ao ajustar estoque');
        }
        
        const tipoTexto = tipo === 'entrada' ? 'adicionadas' : 'removidas';
        mostrarSucesso(`${quantidade} unidades ${tipoTexto} com sucesso!`);
        fecharModalEstoque();
        carregarTodasLentes();
    } catch (error) {
        console.error('Erro ao ajustar estoque:', error);
        mostrarErro(error.message);
    }
}

// Obter dados do formulário
function obterDadosFormulario() {
    return {
        nome: document.getElementById('nome').value.trim(),
        marca: document.getElementById('marca').value.trim(),
        grau_esferico: document.getElementById('grauEsferico').value.trim(),
        grau_cilindrico: document.getElementById('grauCilindrico').value.trim(),
        eixo: document.getElementById('eixo').value.trim(),
        quantidade: parseInt(document.getElementById('quantidade').value),
        preco: parseFloat(document.getElementById('preco').value),
        descricao: document.getElementById('descricao').value.trim()
    };
}

// Validar dados
function validarDados(dados) {
    if (!dados.nome || !dados.marca || !dados.grau_esferico) {
        mostrarErro('Por favor, preencha todos os campos obrigatórios.');
        return false;
    }
    
    if (dados.quantidade < 0) {
        mostrarErro('A quantidade não pode ser negativa.');
        return false;
    }
    
    if (dados.preco < 0) {
        mostrarErro('O preço não pode ser negativo.');
        return false;
    }
    
    return true;
}

// Limpar formulário
function limparFormulario() {
    document.getElementById('formularioLente').reset();
}

// Exibir lentes
function exibirLentes(lentes) {
    const container = document.getElementById('listaLentes');
    container.innerHTML = '';
    
    if (lentes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <h3>Nenhuma lente encontrada</h3>
                <p>Adicione uma nova lente ou ajuste os filtros de busca.</p>
            </div>
        `;
        return;
    }
    
    lentes.forEach(lente => {
        const statusEstoque = obterStatusEstoque(lente.quantidade);
        const valorTotal = (lente.quantidade * lente.preco).toFixed(2);
        
        const lenseCard = document.createElement('div');
        lenseCard.className = 'lens-card';
        lenseCard.innerHTML = `
            <div class="lens-header">
                <div>
                    <div class="lens-name">${lente.nome}</div>
                    <div class="lens-brand">${lente.marca}</div>
                </div>
                <div class="stock-status ${statusEstoque.classe}">
                    ${statusEstoque.texto}
                </div>
            </div>
            
            <div class="lens-details">
                <div class="lens-detail">
                    <span class="lens-detail-label">Grau Esférico:</span>
                    <span class="lens-detail-value">${lente.grau_esferico}</span>
                </div>
                ${lente.grau_cilindrico ? `
                    <div class="lens-detail">
                        <span class="lens-detail-label">Grau Cilíndrico:</span>
                        <span class="lens-detail-value">${lente.grau_cilindrico}</span>
                    </div>
                ` : ''}
                ${lente.eixo ? `
                    <div class="lens-detail">
                        <span class="lens-detail-label">Eixo:</span>
                        <span class="lens-detail-value">${lente.eixo}</span>
                    </div>
                ` : ''}
                <div class="lens-detail">
                    <span class="lens-detail-label">Quantidade:</span>
                    <span class="lens-detail-value">${lente.quantidade} unidades</span>
                </div>
                <div class="lens-detail">
                    <span class="lens-detail-label">Preço Unitário:</span>
                    <span class="lens-detail-value">R$ ${lente.preco.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="lens-detail">
                    <span class="lens-detail-label">Valor Total:</span>
                    <span class="lens-detail-value">R$ ${valorTotal.replace('.', ',')}</span>
                </div>
                ${lente.descricao ? `
                    <div class="lens-detail">
                        <span class="lens-detail-label">Descrição:</span>
                        <span class="lens-detail-value">${lente.descricao}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="lens-actions">
                <button class="btn btn-primary" onclick="editarLente(${JSON.stringify(lente).replace(/"/g, '&quot;')})">
                    ✏️ Editar
                </button>
                <button class="btn btn-warning" onclick="abrirModalEstoque(${JSON.stringify(lente).replace(/"/g, '&quot;')})">
                    ⚖️ Estoque
                </button>
                <button class="btn btn-danger" onclick="excluirLente(${lente.id})">
                    🗑️ Excluir
                </button>
            </div>
        `;
        
        container.appendChild(lenseCard);
    });
    
    ocultarCarregamento();
}

// Obter status do estoque
function obterStatusEstoque(quantidade) {
    if (quantidade === 0) {
        return { classe: 'stock-out', texto: 'Sem Estoque' };
    } else if (quantidade < 5) {
        return { classe: 'stock-low', texto: 'Estoque Baixo' };
    } else {
        return { classe: 'stock-normal', texto: 'Em Estoque' };
    }
}

// Atualizar resumo
function atualizarResumo(lentes) {
    const totalTipos = lentes.length;
    const totalUnidades = lentes.reduce((sum, lente) => sum + lente.quantidade, 0);
    const valorTotal = lentes.reduce((sum, lente) => sum + (lente.quantidade * lente.preco), 0);
    
    document.getElementById('totalTipos').textContent = totalTipos;
    document.getElementById('totalUnidades').textContent = totalUnidades;
    document.getElementById('valorTotalEstoque').textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
}

// Mostrar carregamento
function mostrarCarregamento() {
    document.getElementById('carregamento').style.display = 'block';
    document.getElementById('listaLentes').innerHTML = '';
}

// Ocultar carregamento
function ocultarCarregamento() {
    document.getElementById('carregamento').style.display = 'none';
}

// Mostrar mensagem de sucesso
function mostrarSucesso(mensagem) {
    mostrarAlerta(mensagem, 'success');
}

// Mostrar mensagem de erro
function mostrarErro(mensagem) {
    mostrarAlerta(mensagem, 'error');
}

// Mostrar alerta
function mostrarAlerta(mensagem, tipo) {
    // Remover alertas existentes
    const alertasExistentes = document.querySelectorAll('.alert');
    alertasExistentes.forEach(alerta => alerta.remove());
    
    // Criar novo alerta
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensagem;
    
    // Inserir no topo da página
    const main = document.querySelector('main');
    main.insertBefore(alerta, main.firstChild);
    
    // Rolar para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.remove();
        }
    }, 5000);
}

// Logout
async function logout() {
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    } finally {
        window.location.href = '/login';
    }
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modalEstoque');
    if (event.target === modal) {
        fecharModalEstoque();
    }
}

