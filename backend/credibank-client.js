const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Endpoint do servico
const GRPC_SERVER = process.env.GRPC_SERVER || 'ken01.utad.pt:9091';

// Carregar proto
const PROTO_PATH = path.join(__dirname, '../../proto/voter.proto');
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
 * Cliente CrediBank - Emite cheques digitais de 10 creditos
 */
class CrediBankClient {
  constructor() {
    this.client = new voting.VoterRegistrationService(
      GRPC_SERVER,
      grpc.credentials.createInsecure()
    );
    console.log(`[CrediBank] Conectado a: ${GRPC_SERVER}`);
  }

  /**
   * Solicita cheque digital de 10 creditos
   * @param {string} accountId - ID da conta CrediBank
   * @returns {Promise<{success: boolean, cheque: string, message: string}>}
   */
  async requestDigitalCheque(accountId) {
    return new Promise((resolve, reject) => {
      console.log(`[CrediBank] Solicitando cheque para conta: ${accountId}`);

      const request = { citizen_card_number: accountId };

      this.client.IssueVotingCredential(
        request,
        (error, response) => {
          if (error) {
            console.error('[CrediBank] Erro:', error.message);
            reject({
              success: false,
              cheque: null,
              message: `Erro ao contactar CrediBank: ${error.message}`
            });
            return;
          }

          // Verificar se recebeu cheque valido
          const isValid = response.voting_credential && 
                         response.voting_credential.startsWith('CRED-');

          if (isValid) {
            console.log(`[CrediBank] Cheque emitido: ${response.voting_credential}`);
            resolve({
              success: true,
              cheque: response.voting_credential,
              message: 'Cheque digital de 10 creditos emitido com sucesso!'
            });
          } else {
            console.log(`[CrediBank] Cheque invalido: ${response.voting_credential}`);
            resolve({
              success: false,
              cheque: response.voting_credential,
              message: 'Conta sem creditos suficientes ou invalida.'
            });
          }
        }
      );
    });
  }

  close() {
    grpc.closeClient(this.client);
  }
}

module.exports = CrediBankClient;
