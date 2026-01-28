const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Endpoint do servico
const GRPC_SERVER = process.env.GRPC_SERVER || 'ken01.utad.pt:9091';

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
    this.client = new voting.VotingService(
      GRPC_SERVER,
      grpc.credentials.createInsecure()
    );
    console.log(`[EuroMilRegister] Conectado a: ${GRPC_SERVER}`);
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

      // Converter chave EuroMilhoes para ID numerico (simplificado)
      // Em producao, isto seria mais elaborado
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

        console.log(`[EuroMilRegister] Resposta: ${response.message}`);

        resolve({
          success: response.success,
          message: response.success 
            ? `Aposta registada com sucesso! Chave: ${key}`
            : `Falha ao registar aposta: ${response.message}`
        });
      });
    });
  }

  /**
   * Converte chave EuroMilhoes em ID numerico
   * @param {string} key - Chave (ex: "1,2,3,4,5+6,7")
   * @returns {number}
   */
  hashKey(key) {
    // Simplesmente usa o primeiro numero como ID
    // Em producao seria mais sofisticado
    const numbers = key.split('+')[0].split(',');
    return parseInt(numbers[0]) || 1;
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
