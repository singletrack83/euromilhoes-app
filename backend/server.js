const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const CrediBankClient = require('./grpc-clients/credibank-client');
const EuroMilRegisterClient = require('./grpc-clients/euromilregister-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));

// Clientes gRPC
const crediBankClient = new CrediBankClient();
const euroMilRegisterClient = new EuroMilRegisterClient();

console.log('='.repeat(60));
console.log('SISTEMA DE APOSTAS EUROMILHOES');
console.log('='.repeat(60));

/**
 * POST /api/bet
 * Regista uma aposta EuroMilhoes
 * 
 * Body:
 * {
 *   "accountId": "123456789",
 *   "numbers": [1, 2, 3, 4, 5],
 *   "stars": [6, 7]
 * }
 */
app.post('/api/bet', async (req, res) => {
  try {
    const { accountId, numbers, stars } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log('NOVA APOSTA RECEBIDA');
    console.log('='.repeat(60));
    console.log(`Conta: ${accountId}`);
    console.log(`Numeros: ${numbers.join(', ')}`);
    console.log(`Estrelas: ${stars.join(', ')}`);

    // Validar input
    if (!accountId || !numbers || !stars) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos. Forneca accountId, numbers e stars.'
      });
    }

    // Validar chave EuroMilhoes
    if (numbers.length !== 5 || stars.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Chave invalida. Deve ter 5 numeros e 2 estrelas.'
      });
    }

    // Validar numeros (1-50)
    if (numbers.some(n => n < 1 || n > 50)) {
      return res.status(400).json({
        success: false,
        message: 'Numeros devem estar entre 1 e 50.'
      });
    }

    // Validar estrelas (1-12)
    if (stars.some(s => s < 1 || s > 12)) {
      return res.status(400).json({
        success: false,
        message: 'Estrelas devem estar entre 1 e 12.'
      });
    }

    // PASSO 1: Contactar CrediBank para obter cheque digital de 10 creditos
    console.log('\nPASSO 1: Contactando CrediBank...');
    const chequeResult = await crediBankClient.requestDigitalCheque(accountId);

    if (!chequeResult.success) {
      console.log('Falha ao obter cheque');
      return res.status(402).json({
        success: false,
        step: 'credibank',
        message: chequeResult.message
      });
    }

    console.log('Cheque digital obtido!');
    console.log(`   Cheque: ${chequeResult.cheque}`);
    console.log(`   Valor: 10 creditos`);

    // PASSO 2: Contactar EuroMilRegister para registar aposta
    console.log('\nPASSO 2: Contactando EuroMilRegister...');
    const key = `${numbers.join(',')}+${stars.join(',')}`;
    const betResult = await euroMilRegisterClient.registerBet(
      chequeResult.cheque,
      key
    );

    if (!betResult.success) {
      console.log('Falha ao registar aposta');
      return res.status(400).json({
        success: false,
        step: 'euromilregister',
        message: betResult.message
      });
    }

    console.log('Aposta registada com sucesso!');
    console.log('='.repeat(60) + '\n');

    // Sucesso!
    res.json({
      success: true,
      message: 'Aposta registada com sucesso!',
      details: {
        accountId,
        key,
        cheque: chequeResult.cheque,
        cost: '10 creditos'
      }
    });

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.',
      error: error.message
    });
  }
});

/**
 * GET /api/results
 * Obtem resultados/estatisticas
 */
app.get('/api/results', async (req, res) => {
  try {
    const results = await euroMilRegisterClient.getResults();
    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter resultados.',
      error: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'EuroMilhoes Betting System',
    grpcServer: process.env.GRPC_SERVER || 'ken01.utad.pt:9091'
  });
});

// Servir frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor a correr em: http://localhost:${PORT}`);
  console.log(`Endpoint gRPC: ${process.env.GRPC_SERVER || 'ken01.utad.pt:9091'}`);
  console.log('='.repeat(60) + '\n');
});

// Fechar clientes ao terminar
process.on('SIGINT', () => {
  console.log('\n\nA encerrar servidor...');
  crediBankClient.close();
  euroMilRegisterClient.close();
  process.exit(0);
});
