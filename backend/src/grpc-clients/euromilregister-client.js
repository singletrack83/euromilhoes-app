const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Endpoint do servico
const GRPC_SERVER = process.env.GRPC_SERVER || 'localhost:9091';
const USE_TLS = process.env.GRPC_USE_TLS === 'true';

// Carregar proto
const PROTO_PATH = path.join(__dirname, '../../proto/voting.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const voting = protoDescriptor.voting;

/**
 * Cliente EuroMilRegister - Regista apostas EuroMilhoes
 */
class EuroMilRegisterClient {
  constructor() {
    const credentials = USE_TLS 
      ? grpc.credentials.createSsl()
      : grpc.credentials.createInsecure();

    this.client = new voting.VotingService(
      GRPC_SERVER,
      credentials
    );
    console.log(`[EuroMilRegister] Conectado a: ${GRPC_SERVER} (TLS: ${USE_TLS})`);
  }

  /**
   * Regista uma aposta EuroMilhoes
   * @param {string} digitalCheque - Cheque digital de 10 creditos
   * @param {string} key - Chave EuroMilhoes (formato: "1,2,3,4,5+6,7")
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async registerBet(digitalCheque, key) {
    return new Promise((resolve, reject) => {
      console.log(`[EuroMilRegister] Registando aposta: ${key}`);
      console.log(`[EuroMilRegister] Cheque: ${digitalCheque}`);

      // Converter chave EuroMilhoes para ID numerico (modulo 3 para evitar erros)
      const keyHash = this.hashKey(key);

      const request = {
        voting_credential: digitalCheque,
        candidate_id: keyHash
      };

      this.client.Vote(request, (error, response) => {
        if (error) {
          console.error('[EuroMilRegister] Erro:', error.message);
          reject({
            success: false,
            message: `Erro ao contactar EuroMilRegister: ${error.message}`
          });
          return;
        }

        console.log(`[EuroMilRegister] Resposta do servidor: ${response.message}`);

        // Traduzir resposta do sistema de votacao para sistema de apostas
        let userMessage;
        if (response.success) {
          // Extrair identificador do candidato (A, B ou C) e converter para numero de registo
          const candidateMatch = response.message.match(/Candidato ([ABC])/);
          const registroId = candidateMatch ? candidateMatch[1] : 'confirmado';
          userMessage = `Aposta registada com sucesso! Chave: ${key} | Numero de registo: ${registroId}`;
        } else {
          userMessage = `Falha ao registar aposta: ${response.message}`;
        }

        resolve({
          success: response.success,
          message: userMessage
        });
      });
    });
  }

  /**
   * Converte chave EuroMilhoes em ID numerico (1-3)
   * @param {string} key - Chave (ex: "1,2,3,4,5+6,7")
   * @returns {number}
   */
  hashKey(key) {
    // Usa modulo 3 para garantir ID entre 1-3
    const numbers = key.split('+')[0].split(',');
    const firstNumber = parseInt(numbers[0]) || 1;
    return ((firstNumber - 1) % 3) + 1;
  }

  /**
   * Obter lista de apostas registadas (se disponivel)
   */
  async getResults() {
    return new Promise((resolve, reject) => {
      this.client.GetResults({}, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response.results);
      });
    });
  }

  close() {
    grpc.closeClient(this.client);
  }
}

module.exports = EuroMilRegisterClient;