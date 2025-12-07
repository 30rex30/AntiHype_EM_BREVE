// Newsletter form submission (AJAX/Fetch)
document.getElementById('newsletterForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('📧 Iniciando processo de pré-registo...');
    
    const emailInput = this.querySelector('.newsletter-input');
    const messageEl = document.getElementById('newsletterMessage');
    const submitButton = document.getElementById('submitButton');
    const loadingDots = document.getElementById('loadingDots');
    
    const email = emailInput.value.trim();
    
    console.log('📝 Email inserido:', email);
    
    messageEl.textContent = '';
    
    if (!email || !validateEmail(email)) {
        console.log('❌ Email inválido');
        messageEl.textContent = 'POR FAVOR, INSIRA UM EMAIL VÁLIDO.';
        messageEl.style.color = '#ffffff';
        messageEl.style.opacity = '0.7';
        return;
    }
    
    // 1. Prepara e desativa o formulário
    console.log('⏳ Preparando envio...');
    loadingDots.style.display = 'flex';
    submitButton.disabled = true;
    submitButton.textContent = 'PROCESSANDO...';
    submitButton.style.opacity = '0.7';

    try {
        // Cria os dados do formulário para envio
        const formData = new FormData(this);
        
        // Adiciona um campo de contexto para saber que é um Pré-Registo
        formData.append('assunto', 'Novo Pré-Registo Anti Hype');
        formData.append('_subject', '🎯 Novo Pré-Registo Anti Hype');
        formData.append('data', new Date().toLocaleString('pt-PT'));
        
        console.log('📤 Enviando dados para Formspree...');
        console.log('🔗 Endpoint:', FORMSPREE_ENDPOINT);
        console.log('📄 Dados enviados:');
        for (let pair of formData.entries()) {
            console.log(`  ${pair[0]}: ${pair[1]}`);
        }

        // 2. Envia para o Formspree
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log('✅ Resposta recebida do servidor');
        console.log('📊 Status:', response.status);
        console.log('📊 OK?', response.ok);

        // 3. Trata a resposta
        if (response.ok) {
            console.log('🎉 Formspree respondeu com sucesso!');
            
            // Armazenamento local
            const subscribers = JSON.parse(localStorage.getItem('antiHypeSubscribers') || '[]');
            
            if (!subscribers.some(sub => sub.email === email)) {
                subscribers.push({ 
                    email: email, 
                    date: new Date().toISOString(), 
                    status: 'preregistered',
                    timestamp: Date.now()
                });
                localStorage.setItem('antiHypeSubscribers', JSON.stringify(subscribers));
                console.log('💾 Email guardado no localStorage:', email);
                console.log('📊 Total de pré-registados:', subscribers.length);
                
                messageEl.textContent = 'PRÉ-REGISTO CONCLUÍDO! Receberá a DM de confirmação e o código de desconto no lançamento.';
                messageEl.style.color = '#ffffff';
            } else {
                console.log('⚠️ Email já está registado:', email);
                messageEl.textContent = 'ESTE EMAIL JÁ ESTÁ PRÉ-REGISTADO. Fique atento!';
                messageEl.style.color = '#ffffff';
            }

            emailInput.value = ''; // Limpa o campo
            
        } else {
            // Tratar erros do servidor
            console.log('❌ Erro na resposta do servidor');
            const errorData = await response.json().catch(() => ({}));
            console.log('📄 Detalhes do erro:', errorData);
            
            messageEl.textContent = `ERRO: Não foi possível registar. ${errorData.error || 'Tente novamente.'}`;
            messageEl.style.color = '#FF4444'; 
        }

    } catch (error) {
        // Tratar erros de rede
        console.log('🚨 ERRO DE CONEXÃO:', error);
        messageEl.textContent = 'ERRO DE CONEXÃO. Por favor, verifique a sua internet.';
        messageEl.style.color = '#FF4444';
        console.error('🔧 Detalhes técnicos:', error);

    } finally {
        // 4. Reset do estado
        console.log('🏁 Finalizando processo...');
        loadingDots.style.display = 'none';
        
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'PRÉ-REGISTAR';
            submitButton.style.opacity = '1';
            console.log('🔄 Botão resetado');
        }, 3000);
    }
});

// Função para ver pré-registados no console
function mostrarPreRegistados() {
    const subscribers = JSON.parse(localStorage.getItem('antiHypeSubscribers') || '[]');
    console.log('📊 === LISTA DE PRÉ-REGISTADOS ===');
    console.log('📈 Total:', subscribers.length);
    subscribers.forEach((sub, index) => {
        const date = new Date(sub.date).toLocaleString('pt-PT');
        console.log(`${index + 1}. ${sub.email} - ${date}`);
    });
}

// Verificar pré-registados ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Verificando pré-registados existentes...');
    mostrarPreRegistados();
    
    // Adicionar atalho de teclado para ver pré-registados (Shift + P)
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key === 'P') {
            e.preventDefault();
            mostrarPreRegistados();
        }
    });
});