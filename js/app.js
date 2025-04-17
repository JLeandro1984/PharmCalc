// Gerenciamento de Estado
class MedicamentoManager {
    constructor() {
        this.medicamentos = JSON.parse(localStorage.getItem('medicamentos')) || [];
    }

    salvarMedicamento(medicamento) {
        this.medicamentos.push(medicamento);
        this.salvarNoStorage();
    }

    atualizarMedicamento(id, medicamentoAtualizado) {
        const index = this.medicamentos.findIndex(med => med.id === id);
        if (index !== -1) {
            this.medicamentos[index] = { ...medicamentoAtualizado, id };
            this.salvarNoStorage();
            return true;
        }
        return false;
    }

    excluirMedicamento(id) {
        this.medicamentos = this.medicamentos.filter(med => med.id !== id);
        this.salvarNoStorage();
    }

    obterMedicamentos() {
        return this.medicamentos;
    }

    obterMedicamentoPorId(id) {
        return this.medicamentos.find(med => med.id === id);
    }

    salvarNoStorage() {
        localStorage.setItem('medicamentos', JSON.stringify(this.medicamentos));
    }

    medicamentoExiste(nome, codigoBarras) {
        return this.medicamentos.some(med =>
            med.nome.toLowerCase() === nome.toLowerCase() ||
            med.codigoBarras === codigoBarras
        );
    }

    validarMedicamento(medicamento) {
        if (this.medicamentoExiste(medicamento.nome, medicamento.codigoBarras)) {
            return {
                valido: false,
                mensagem: `Já existe um medicamento cadastrado com este nome ou código de barras.`
            };
        }
        return { valido: true };
    }
}

// Adicione esta nova classe após a classe MedicamentoManager
class TipoVolumeManager {
    constructor() {
        this.tipos = JSON.parse(localStorage.getItem('tiposVolume')) || [
            'Comprimido',
            'Cápsula',
            'Pomada',
            'Líquido'
        ];
        this.salvarNoStorage();
    }

    adicionar(tipo) {
        tipo = tipo.trim();
        if (this.tipos.includes(tipo.toLowerCase())) {
            return false;
        }
        this.tipos.push(tipo);
        this.salvarNoStorage();
        return true;
    }

    remover(tipo) {
        const index = this.tipos.indexOf(tipo);
        if (index > -1) {
            this.tipos.splice(index, 1);
            this.salvarNoStorage();
            return true;
        }
        return false;
    }

    obterTodos() {
        return this.tipos;
    }

    salvarNoStorage() {
        localStorage.setItem('tiposVolume', JSON.stringify(this.tipos));
    }
}

// Adicione esta nova classe após a classe TipoVolumeManager
class TipoUnidadeManager {
    constructor() {
        this.tipos = JSON.parse(localStorage.getItem('tiposUnidade')) || [
            'Comprimido',
            'Cápsula',
            'Mililitro',
            'Grama'
        ];
        this.salvarNoStorage();
    }

    adicionar(tipo) {
        tipo = tipo.trim();
        if (this.tipos.includes(tipo.toLowerCase())) {
            return false;
        }
        this.tipos.push(tipo);
        this.salvarNoStorage();
        return true;
    }

    remover(tipo) {
        const index = this.tipos.indexOf(tipo);
        if (index > -1) {
            this.tipos.splice(index, 1);
            this.salvarNoStorage();
            return true;
        }
        return false;
    }

    obterTodos() {
        return this.tipos;
    }

    salvarNoStorage() {
        localStorage.setItem('tiposUnidade', JSON.stringify(this.tipos));
    }
}

// Inicialização
const medicamentoManager = new MedicamentoManager();
const tipoVolumeManager = new TipoVolumeManager();
const tipoUnidadeManager = new TipoUnidadeManager();

// Elementos DOM
const cadastroLink = document.getElementById('cadastroLink');
const calculoLink = document.getElementById('calculoLink');
const cadastroSection = document.getElementById('cadastroSection');
const calculoSection = document.getElementById('calculoSection');
const medicamentoForm = document.getElementById('medicamentoForm');
const calculoForm = document.getElementById('calculoForm');
const medicamentoSelect = document.getElementById('medicamentoSelect');
const resultado = document.getElementById('resultado');
const scanButton = document.getElementById('scanButton');
const codigoBarrasArea = document.getElementById('codigoBarrasArea');
const codigoBarrasBusca = document.getElementById('codigoBarrasBusca');
const buscarPorCodigo = document.getElementById('buscarPorCodigo');

// Navegação
cadastroLink.addEventListener('click', (e) => {
    e.preventDefault();
    cadastroSection.style.display = 'block';
    calculoSection.style.display = 'none';
});

calculoLink.addEventListener('click', (e) => {
    e.preventDefault();
    cadastroSection.style.display = 'none';
    calculoSection.style.display = 'block';
    atualizarSelectMedicamentos();
});

// Adicione esta função no início do arquivo, após a classe MedicamentoManager
function mostrarNotificacao(mensagem, tipo = 'success') {
    const cores = {
        success: 'linear-gradient(to right, #00b09b, #96c93d)',
        error: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        warning: 'linear-gradient(to right, #f7b733, #fc4a1a)'
    };

    Toastify({
        text: mensagem,
        duration: 3000,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: cores[tipo],
        },
        onClick: function () { } // Callback after click
    }).showToast();
}

// Adicione estas funções para gerenciar as imagens
function handleImagemInput(input, previewDiv) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = previewDiv.querySelector('img');
            img.src = e.target.result;
            previewDiv.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewDiv.style.display = 'none';
    }
}

function limparImagem(input, previewDiv) {
    input.value = '';
    previewDiv.style.display = 'none';
    previewDiv.querySelector('img').src = '';
}

// Adicione os event listeners para os inputs de imagem
document.getElementById('imagem').addEventListener('change', function() {
    handleImagemInput(this, document.getElementById('previewImagem'));
});

document.getElementById('editImagem').addEventListener('change', function() {
    handleImagemInput(this, document.getElementById('editPreviewImagem'));
});

document.getElementById('limparImagem').addEventListener('click', function() {
    limparImagem(
        document.getElementById('imagem'),
        document.getElementById('previewImagem')
    );
});

document.getElementById('editLimparImagem').addEventListener('click', function() {
    limparImagem(
        document.getElementById('editImagem'),
        document.getElementById('editPreviewImagem')
    );
});

// Cadastro de Medicamentos
medicamentoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const imagemInput = document.getElementById('imagem');
    let imagemBase64 = null;
    
    if (imagemInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const medicamento = {
                id: Date.now().toString(),
                nome: document.getElementById('nome').value.trim(),
                codigoBarras: document.getElementById('codigoBarras').value.trim(),
                composicao: document.getElementById('composicao').value.trim(),
                tipoVolume: document.getElementById('tipoVolume').value,
                qtdPorEmbalagem: parseInt(document.getElementById('qtdPorEmbalagem').value),
                tipoUnidade: document.getElementById('tipoUnidade').value,
                imagem: e.target.result
            };

            salvarMedicamento(medicamento);
        };
        reader.readAsDataURL(imagemInput.files[0]);
    } else {
        const medicamento = {
            id: Date.now().toString(),
            nome: document.getElementById('nome').value.trim(),
            codigoBarras: document.getElementById('codigoBarras').value.trim(),
            composicao: document.getElementById('composicao').value.trim(),
            tipoVolume: document.getElementById('tipoVolume').value,
            qtdPorEmbalagem: parseInt(document.getElementById('qtdPorEmbalagem').value),
            tipoUnidade: document.getElementById('tipoUnidade').value,
            imagem: null
        };

        salvarMedicamento(medicamento);
    }
});

// Função auxiliar para salvar medicamento
function salvarMedicamento(medicamento) {
    const validacao = medicamentoManager.validarMedicamento(medicamento);
    
    if (!validacao.valido) {
        mostrarNotificacao(validacao.mensagem, 'error');
        return;
    }

    medicamentoManager.salvarMedicamento(medicamento);
    medicamentoForm.reset();
    document.getElementById('previewImagem').style.display = 'none';
    atualizarTabelaMedicamentos();
    atualizarSelectMedicamentos();
    atualizarSelectTiposUnidade();
    atualizarListaTiposUnidade();
    mostrarNotificacao(`✅ Medicamento "${medicamento.nome}" cadastrado com sucesso!`);
}

// Cálculo de Tratamento
function atualizarSelectMedicamentos() {
    medicamentoSelect.innerHTML = '<option value="">Selecione...</option>';
    medicamentoManager.obterMedicamentos().forEach(med => {
        const option = document.createElement('option');
        option.value = med.id;
        option.textContent = med.nome;
        medicamentoSelect.appendChild(option);
    });
}

// Adicione esta função para atualizar a imagem do medicamento
function atualizarImagemMedicamento(medicamento, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (medicamento && medicamento.imagem) {
        container.innerHTML = `
            <img src="${medicamento.imagem}" 
                 alt="${medicamento.nome}" 
                 class="img-thumbnail" 
                 style="max-height: 150px; width: auto;">`;
    } else {
        container.innerHTML = `
            <div class="text-muted p-3 bg-light rounded">
                <i class="fas fa-image"></i>
                <br>
                <small>Sem imagem cadastrada</small>
            </div>`;
    }
}

// Modifique o event listener do select de medicamentos
medicamentoSelect.addEventListener('change', function() {
    const medicamentoId = this.value;
    const previewDiv = document.getElementById('previewMedicamento');
    
    if (medicamentoId) {
        const medicamento = medicamentoManager.obterMedicamentoPorId(medicamentoId);
        previewDiv.style.display = 'block';
        
        // Atualizar a imagem e informações do medicamento
        const imagemDiv = document.getElementById('imagemMedicamentoPreview');
        if (medicamento.imagem) {
            imagemDiv.innerHTML = `
                <img src="${medicamento.imagem}" 
                     alt="${medicamento.nome}" 
                     class="img-thumbnail" 
                     style="max-height: 150px; width: auto;">`;
        } else {
            imagemDiv.innerHTML = `
                <div class="text-muted p-3 bg-light rounded">
                    <i class="fas fa-image"></i>
                    <br>
                    <small>Sem imagem cadastrada</small>
                </div>`;
        }

        // Adicionar informações do medicamento
        document.getElementById('previewInfo').innerHTML = `
            <h6 class="mb-2">${medicamento.nome}</h6>
            <p class="mb-1 text-muted small">
                <strong>Composição:</strong><br>
                ${medicamento.composicao}
            </p>
        `;
    } else {
        previewDiv.style.display = 'none';
    }
});

// Modifique o event listener do formulário de cálculo
calculoForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const medicamentoId = medicamentoSelect.value;
    const medicamento = medicamentoManager.obterMedicamentoPorId(medicamentoId);
    const qtdPorDose = parseInt(document.getElementById('qtdPorDose').value);
    const frequencia = parseInt(document.getElementById('frequencia').value);
    const duracao = parseInt(document.getElementById('duracao').value);

    // Cálculos
    const dosesPerDay = 24 / frequencia;
    const totalDoses = dosesPerDay * duracao;
    const totalUnidades = totalDoses * qtdPorDose;
    const totalEmbalagens = Math.ceil(totalUnidades / medicamento.qtdPorEmbalagem);

    // Exibir resultado
    resultado.style.display = 'block';
    
    // Atualizar a imagem no resultado
    atualizarImagemMedicamento(medicamento, 'imagemMedicamento');

    document.getElementById('resultadoConteudo').innerHTML = `
        <p><strong>Medicamento:</strong> ${medicamento.nome}</p>
        <p><strong>Composição:</strong> ${medicamento.composicao}</p>
        <hr>
        <p><strong>Total de doses necessárias:</strong> ${totalDoses}</p>
        <p><strong>Total de unidades necessárias:</strong> ${totalUnidades} ${medicamento.tipoVolume}(s)</p>
        <p><strong>Embalagens necessárias:</strong> ${totalEmbalagens} ${totalEmbalagens === 1 ? 'embalagem' : 'embalagens'}</p>
    `;
});

// Adicionar após o evento de submit do medicamentoForm
function atualizarTabelaMedicamentos() {
    const tbody = document.getElementById('medicamentosTable');
    tbody.innerHTML = '';

    medicamentoManager.obterMedicamentos().forEach(med => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${med.nome}</td>
            <td>${med.codigoBarras}</td>
            <td>${med.composicao}</td>
            <td>${med.tipoVolume}</td>
            <td>${med.tipoUnidade}</td>
            <td>${med.qtdPorEmbalagem}</td>
            <td class="actions-column">
                <button class="btn btn-sm btn-primary btn-action edit-btn" data-id="${med.id}">
                    <i>✏️</i><span>Editar</span>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${med.id}">
                    <i>🗑️</i><span>Excluir</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Adicionar event listeners para os botões
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}

// Variável para armazenar o ID do medicamento a ser excluído
let medicamentoParaExcluir = null;

// Função para lidar com exclusão
function handleDelete(e) {
    const id = e.target.dataset.id;
    const medicamento = medicamentoManager.obterMedicamentoPorId(id);
    
    // Armazena o ID do medicamento para exclusão
    medicamentoParaExcluir = id;
    
    // Atualiza o nome do medicamento no modal
    document.getElementById('deleteMedicamentoNome').textContent = medicamento.nome;
    
    // Abre o modal de confirmação
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

// Adicione o event listener para o botão de confirmação de exclusão
document.getElementById('confirmDelete').addEventListener('click', () => {
    if (medicamentoParaExcluir) {
        const medicamento = medicamentoManager.obterMedicamentoPorId(medicamentoParaExcluir);
        medicamentoManager.excluirMedicamento(medicamentoParaExcluir);
        
        // Fecha o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
        
        // Atualiza a interface
        atualizarTabelaMedicamentos();
        atualizarSelectMedicamentos();
        atualizarSelectTiposUnidade();
        atualizarListaTiposUnidade();
        
        // Mostra notificação
        mostrarNotificacao(`🗑️ Medicamento "${medicamento.nome}" excluído com sucesso!`, 'warning');
        
        // Limpa o ID armazenado
        medicamentoParaExcluir = null;
    }
});

// Função para lidar com edição
function handleEdit(e) {
    const id = e.target.dataset.id;
    const medicamento = medicamentoManager.obterMedicamentoPorId(id);
    
    document.getElementById('editId').value = id;
    document.getElementById('editNome').value = medicamento.nome;
    document.getElementById('editCodigoBarras').value = medicamento.codigoBarras;
    document.getElementById('editComposicao').value = medicamento.composicao;
    document.getElementById('editTipoVolume').value = medicamento.tipoVolume;
    document.getElementById('editQtdPorEmbalagem').value = medicamento.qtdPorEmbalagem;
    document.getElementById('editTipoUnidade').value = medicamento.tipoUnidade;

    const previewDiv = document.getElementById('editPreviewImagem');
    if (medicamento.imagem) {
        const img = previewDiv.querySelector('img');
        img.src = medicamento.imagem;
        previewDiv.style.display = 'block';
    } else {
        previewDiv.style.display = 'none';
    }

    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

// Adicionar evento para salvar edições
document.getElementById('saveEdit').addEventListener('click', () => {
    const id = document.getElementById('editId').value;
    const imagemInput = document.getElementById('editImagem');
    
    const salvarEdicao = (imagemBase64) => {
        const medicamentoAtualizado = {
            nome: document.getElementById('editNome').value.trim(),
            codigoBarras: document.getElementById('editCodigoBarras').value.trim(),
            composicao: document.getElementById('editComposicao').value.trim(),
            tipoVolume: document.getElementById('editTipoVolume').value,
            qtdPorEmbalagem: parseInt(document.getElementById('editQtdPorEmbalagem').value),
            tipoUnidade: document.getElementById('editTipoUnidade').value,
            imagem: imagemBase64
        };

        if (medicamentoManager.atualizarMedicamento(id, medicamentoAtualizado)) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            modal.hide();
            atualizarTabelaMedicamentos();
            atualizarSelectMedicamentos();
            atualizarSelectTiposUnidade();
            atualizarListaTiposUnidade();
            mostrarNotificacao(`✏️ Medicamento "${medicamentoAtualizado.nome}" atualizado com sucesso!`, 'success');
        }
    };

    if (imagemInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            salvarEdicao(e.target.result);
        };
        reader.readAsDataURL(imagemInput.files[0]);
    } else {
        const medicamentoAtual = medicamentoManager.obterMedicamentoPorId(id);
        salvarEdicao(medicamentoAtual.imagem);
    }
});

// Função para atualizar o select de tipos de volume
function atualizarSelectTiposVolume() {
    const selects = [
        document.getElementById('tipoVolume'),
        document.getElementById('editTipoVolume')
    ];

    selects.forEach(select => {
        if (select) {
            const valorAtual = select.value;
            select.innerHTML = '<option value="">Selecione...</option>';
            tipoVolumeManager.obterTodos().forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo;
                option.textContent = tipo;
                select.appendChild(option);
            });
            if (valorAtual) {
                select.value = valorAtual;
            }
        }
    });
}

// Função para atualizar a lista de tipos no modal
function atualizarListaTiposVolume() {
    const lista = document.getElementById('listaTiposVolume');
    lista.innerHTML = '';

    tipoVolumeManager.obterTodos().forEach(tipo => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${tipo}</span>
            <button class="btn btn-sm btn-danger remove-tipo" data-tipo="${tipo}">
                🗑️ Remover
            </button>
        `;
        lista.appendChild(item);
    });

    // Adicionar event listeners para os botões de remover
    document.querySelectorAll('.remove-tipo').forEach(btn => {
        btn.addEventListener('click', handleRemoverTipo);
    });
}

// Handler para remover tipo
function handleRemoverTipo(e) {
    const tipo = e.target.dataset.tipo;
    if (confirm(`Tem certeza que deseja remover o tipo "${tipo}"?`)) {
        if (tipoVolumeManager.remover(tipo)) {
            atualizarListaTiposVolume();
            atualizarSelectTiposVolume();
            mostrarNotificacao(`Tipo de volume "${tipo}" removido com sucesso!`, 'warning');
        }
    }
}

// Adicionar evento para o formulário de novo tipo
document.getElementById('tipoVolumeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('novoTipoVolume');
    const novoTipo = input.value.trim();

    if (tipoVolumeManager.adicionar(novoTipo)) {
        atualizarListaTiposVolume();
        atualizarSelectTiposVolume();
        mostrarNotificacao(`Tipo de volume "${novoTipo}" adicionado com sucesso!`);
        input.value = '';
    } else {
        mostrarNotificacao('Este tipo de volume já existe!', 'error');
    }
});

// Função para atualizar o select de tipos de unidade
function atualizarSelectTiposUnidade() {
    const selects = [
        document.getElementById('tipoUnidade'),
        document.getElementById('editTipoUnidade')
    ];

    selects.forEach(select => {
        if (select) {
            const valorAtual = select.value;
            select.innerHTML = '<option value="">Selecione...</option>';
            tipoUnidadeManager.obterTodos().forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo;
                option.textContent = tipo;
                select.appendChild(option);
            });
            if (valorAtual) {
                select.value = valorAtual;
            }
        }
    });
}

// Função para atualizar a lista de tipos de unidade no modal
function atualizarListaTiposUnidade() {
    const lista = document.getElementById('listaTiposUnidade');
    lista.innerHTML = '';

    tipoUnidadeManager.obterTodos().forEach(tipo => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${tipo}</span>
            <button class="btn btn-sm btn-danger remove-tipo-unidade" data-tipo="${tipo}">
                🗑️ Remover
            </button>
        `;
        lista.appendChild(item);
    });

    // Adicionar event listeners para os botões de remover
    document.querySelectorAll('.remove-tipo-unidade').forEach(btn => {
        btn.addEventListener('click', handleRemoverTipoUnidade);
    });
}

// Handler para remover tipo de unidade
function handleRemoverTipoUnidade(e) {
    const tipo = e.target.dataset.tipo;
    if (confirm(`Tem certeza que deseja remover o tipo de unidade "${tipo}"?`)) {
        if (tipoUnidadeManager.remover(tipo)) {
            atualizarListaTiposUnidade();
            atualizarSelectTiposUnidade();
            mostrarNotificacao(`Tipo de unidade "${tipo}" removido com sucesso!`, 'warning');
        }
    }
}

// Adicionar evento para o formulário de novo tipo de unidade
document.getElementById('tipoUnidadeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('novoTipoUnidade');
    const novoTipo = input.value.trim();

    if (tipoUnidadeManager.adicionar(novoTipo)) {
        atualizarListaTiposUnidade();
        atualizarSelectTiposUnidade();
        mostrarNotificacao(`Tipo de unidade "${novoTipo}" adicionado com sucesso!`);
        input.value = '';
    } else {
        mostrarNotificacao('Este tipo de unidade já existe!', 'error');
    }
});

// Adicione os event listeners
scanButton.addEventListener('click', () => {
    codigoBarrasArea.style.display = codigoBarrasArea.style.display === 'none' ? 'block' : 'none';
});

buscarPorCodigo.addEventListener('click', () => {
    const codigo = codigoBarrasBusca.value.trim();
    if (codigo) {
        const medicamento = medicamentoManager.obterMedicamentos()
            .find(med => med.codigoBarras === codigo);
        
        if (medicamento) {
            medicamentoSelect.value = medicamento.id;
            // Dispara o evento change para atualizar o preview
            medicamentoSelect.dispatchEvent(new Event('change'));
            codigoBarrasArea.style.display = 'none';
            codigoBarrasBusca.value = '';
        } else {
            mostrarNotificacao('Medicamento não encontrado com este código de barras', 'error');
        }
    }
});

// Adicione também a busca ao pressionar Enter no campo de código de barras
codigoBarrasBusca.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        buscarPorCodigo.click();
    }
});

// Carregar a tabela inicial
document.addEventListener('DOMContentLoaded', () => {
    atualizarTabelaMedicamentos();
    atualizarSelectTiposVolume();
    atualizarListaTiposVolume();
    atualizarSelectTiposUnidade();
    atualizarListaTiposUnidade();
}); 