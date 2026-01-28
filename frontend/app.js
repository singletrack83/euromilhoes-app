// Estado da aplicação
const state = {
    selectedNumbers: [],
    selectedStars: [],
    accountId: ''
};

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    initializeNumbersGrid();
    initializeStarsGrid();
    setupEventListeners();
});

/**
 * Criar grid de números (1-50)
 */
function initializeNumbersGrid() {
    const grid = document.getElementById('numbersGrid');
    
    for (let i = 1; i <= 50; i++) {
        const btn = document.createElement('button');
        btn.className = 'number-btn';
        btn.textContent = i;
        btn.onclick = () => toggleNumber(i, btn);
        grid.appendChild(btn);
    }
}

/**
 * Criar grid de estrelas (1-12)
 */
function initializeStarsGrid() {
    const grid = document.getElementById('starsGrid');
    
    for (let i = 1; i <= 12; i++) {
        const btn = document.createElement('button');
        btn.className = 'star-btn';
        btn.textContent = i;
        btn.onclick = () => toggleStar(i, btn);
        grid.appendChild(btn);
    }
}

/**
 * Toggle seleção de número
 */
function toggleNumber(number, btn) {
    const index = state.selectedNumbers.indexOf(number);
    
    if (index > -1) {
        // Remover
        state.selectedNumbers.splice(index, 1);
        btn.classList.remove('selected');
    } else {
        // Adicionar (máximo 5)
        if (state.selectedNumbers.length < 5) {
            state.selectedNumbers.push(number);
            state.selectedNumbers.sort((a, b) => a - b);
            btn.classList.add('selected');
        } else {
            showTempMessage('Já selecionou 5 números!');
        }
    }
    
    updateSelectedDisplay();
}

/**
 * Toggle seleção de estrela
 */
function toggleStar(star, btn) {
    const index = state.selectedStars.indexOf(star);
    
    if (index > -1) {
        // Remover
        state.selectedStars.splice(index, 1);
        btn.classList.remove('selected');
    } else {
        // Adicionar (máximo 2)
        if (state.selectedStars.length < 2) {
            state.selectedStars.push(star);
            state.selectedStars.sort((a, b) => a - b);
            btn.classList.add('selected');
        } else {
            showTempMessage('Já selecionou 2 estrelas!');
        }
    }
    
    updateSelectedDisplay();
}

/**
 * Atualizar display de números/estrelas selecionados
 */
function updateSelectedDisplay() {
    // Números
    const numbersDiv = document.getElementById('selectedNumbers');
    numbersDiv.innerHTML = state.selectedNumbers.length === 0
        ? '<span style="color: #999;">Nenhum número selecionado</span>'
        : state.selectedNumbers.map(n => 
            `<span class="badge">${n} <button onclick="removeNumber(${n})">×</button></span>`
          ).join('');
    
    // Estrelas
    const starsDiv = document.getElementById('selectedStars');
    starsDiv.innerHTML = state.selectedStars.length === 0
        ? '<span style="color: #999;">Nenhuma estrela selecionada</span>'
        : state.selectedStars.map(s => 
            `<span class="badge star">⭐ ${s} <button onclick="removeStar(${s})">×</button></span>`
          ).join('');
}

/**
 * Remover número selecionado
 */
function removeNumber(number) {
    const index = state.selectedNumbers.indexOf(number);
    if (index > -1) {
        state.selectedNumbers.splice(index, 1);
        
        // Atualizar botão no grid
        const buttons = document.querySelectorAll('.number-btn');
        buttons.forEach(btn => {
            if (parseInt(btn.textContent) === number) {
                btn.classList.remove('selected');
            }
        });
        
        updateSelectedDisplay();
    }
}

/**
 * Remover estrela selecionada
 */
function removeStar(star) {
    const index = state.selectedStars.indexOf(star);
    if (index > -1) {
        state.selectedStars.splice(index, 1);
        
        // Atualizar botão no grid
        const buttons = document.querySelectorAll('.star-btn');
        buttons.forEach(btn => {
            if (parseInt(btn.textContent) === star) {
                btn.classList.remove('selected');
            }
        });
        
        updateSelectedDisplay();
    }
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    document.getElementById('btnBet').addEventListener('click', submitBet);
}

/**
 * Submeter aposta
 */
async function submitBet() {
    // Obter ID da conta
    const accountId = document.getElementById('accountId').value.trim();
    
    // Validações
    if (!accountId) {
        showFeedback('error', 'Por favor, insira o ID da conta CrediBank.');
        return;
    }
    
    if (state.selectedNumbers.length !== 5) {
        showFeedback('error', 'Por favor, selecione exatamente 5 números.');
        return;
    }
    
    if (state.selectedStars.length !== 2) {
        showFeedback('error', 'Por favor, selecione exatamente 2 estrelas.');
        return;
    }
    
    // Mostrar loading
    showLoading(true);
    hideFeedback();
    
    try {
        // Chamar API
        const response = await fetch('/api/bet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountId: accountId,
                numbers: state.selectedNumbers,
                stars: state.selectedStars
            })
        });
        
        const data = await response.json();
        
        showLoading(false);
        
        if (data.success) {
            // Sucesso!
            showFeedback('success', `
                <h3>Aposta Registada com Sucesso!</h3>
                <ul>
                    <li><strong>Chave:</strong> ${state.selectedNumbers.join(', ')} + ${state.selectedStars.join(', ')}</li>
                    <li><strong>Conta:</strong> ${accountId}</li>
                    <li><strong>Cheque Digital:</strong> ${data.details.cheque}</li>
                    <li><strong>Custo:</strong> ${data.details.cost}</li>
                </ul>
                <p style="margin-top: 10px;">Boa sorte!</p>
            `);
            
            // Limpar seleção
            resetSelection();
        } else {
            // Erro
            let errorMessage = data.message;
            
            if (data.step === 'credibank') {
                errorMessage = `Erro no CrediBank: ${data.message}`;
            } else if (data.step === 'euromilregister') {
                errorMessage = `Erro no EuroMilRegister: ${data.message}`;
            }
            
            showFeedback('error', errorMessage);
        }
        
    } catch (error) {
        showLoading(false);
        showFeedback('error', `Erro de conexão: ${error.message}`);
    }
}

/**
 * Mostrar/esconder loading
 */
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('btnBet').disabled = show;
}

/**
 * Mostrar feedback
 */
function showFeedback(type, message) {
    const feedback = document.getElementById('feedback');
    feedback.className = `feedback ${type}`;
    feedback.innerHTML = message;
    feedback.style.display = 'block';
    
    // Scroll para o feedback
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Esconder feedback
 */
function hideFeedback() {
    document.getElementById('feedback').style.display = 'none';
}

/**
 * Mostrar mensagem temporária
 */
function showTempMessage(message) {
    const feedback = document.getElementById('feedback');
    feedback.className = 'feedback error';
    feedback.textContent = message;
    feedback.style.display = 'block';
    
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 3000);
}

/**
 * Limpar seleção
 */
function resetSelection() {
    // Limpar arrays
    state.selectedNumbers = [];
    state.selectedStars = [];
    
    // Limpar classes dos botões
    document.querySelectorAll('.number-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.querySelectorAll('.star-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Atualizar display
    updateSelectedDisplay();
}
