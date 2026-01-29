EuroMilhoes - Sistema de Apostas Online

Tarefa 7 - Atividade III**  
Integracao de Sistemas - 2025/2026**

Sistema de apostas EuroMilhoes online que integra com servicos gRPC:
- CrediBank**: Sistema de creditos (emite cheques digitais de 10 creditos)
- EuroMilRegister**: Sistema de registo de apostas

---

Nota sobre Endpoints

O endpoint especificado no enunciado (`ken01.utad.pt:9091`) nao estava disponivel durante o desenvolvimento. Foi utilizado um servidor alternativo disponibilizado por um colega da turma, hospedado no Google Cloud Platform:

Endpoint utilizado:** `grpc-voting-mock-837732060165.europe-west1.run.app:443`

Este servidor implementa os mesmos servicos gRPC especificados (VoterRegistrationService e VotingService) e permite testar a integracao completa do sistema.

Nota: O servidor alternativo utiliza terminologia de "votacao" nas respostas (ex: "Voto registado para o Candidato B") porque e baseado no sistema mockup original. O sistema funciona corretamente apesar desta diferenca terminologica.

---

Funcionalidades

- Interface web intuitiva para apostas
- Selecao visual de numeros (1-50) e estrelas (1-12)
- Integracao com CrediBank via gRPC (emissao de cheques digitais)
- Integracao com EuroMilRegister via gRPC (registo de apostas)
- Suporte para conexoes TLS/SSL
- Validacao completa de dados
- Feedback em tempo real

---

Como Executar

Pre-requisitos:
- Node.js 18+ instalado
- Acesso a internet (para conectar ao servidor gRPC)

Passo 1: Clonar Repositorio

```bash
git clone https://github.com/singletrack83/euromilhoes-app.git
cd euromilhoes-app
```

Passo 2: Instalar Dependencias

```bash
cd backend
npm install
```

Passo 3: Configurar Endpoint

O ficheiro `backend/.env` ja vem configurado com o endpoint alternativo:

```
PORT=3000
GRPC_SERVER=grpc-voting-mock-837732060165.europe-west1.run.app:443
GRPC_USE_TLS=true
```

Nota:Se o endpoint do professor (`ken01.utad.pt:9091`) ficar disponivel, basta atualizar estas variaveis.

Passo 4: Iniciar Servidor

```bash
npm start
```

O servidor arranca em: http://localhost:3000

Passo 5: Abrir no Browser

Abre o browser e vai a: http://localhost:3000

---

 Como Fazer uma Aposta

1. Inserir ID da Conta CrediBank
   - Exemplo: `123456789`

2. Selecionar 5 Numeros (1-50)
   - Clica nos numeros pretendidos no grid
   - Maximo 5 numeros

3. Selecionar 2 Estrelas (1-12)
   - Clica nas estrelas pretendidas
   - Maximo 2 estrelas

4. Clicar em "Registar Aposta"

5. Sistema processa automaticamente:
   - Contacta CrediBank via gRPC
   - Solicita cheque digital de 10 creditos
   - Se aprovado, contacta EuroMilRegister
   - Regista a aposta com o cheque emitido
   - Mostra resultado (sucesso ou erro)

Nota sobre credenciais: O sistema mockup tem uma probabilidade 70/30:
- 70% das vezes emite cheque valido (CRED-ABC-123, CRED-DEF-456, CRED-GHI-789)
- 30% das vezes emite cheque invalido (INVALID-xxxxxx)

---

Arquitetura

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │ HTTP REST (porta 3000)
       ▼
┌─────────────┐
│   Express   │
│  (Backend)  │
└──────┬──────┘
       │ gRPC + TLS (porta 443)
       ▼
┌────────────────────────────────────────────────┐
│  grpc-voting-mock...europe-west1.run.app:443  │
│  ┌───────────────┐    ┌──────────────────┐    │
│  │  CrediBank    │    │  EuroMilRegister │    │
│  │  (AR Service) │    │  (AV Service)    │    │
│  └───────────────┘    └──────────────────┘    │
└────────────────────────────────────────────────┘
```

---

Estrutura do Projeto

```
euromilhoes-app/
├── backend/
│   ├── src/
│   │   ├── grpc-clients/
│   │   │   ├── credibank-client.js       # Cliente gRPC CrediBank
│   │   │   └── euromilregister-client.js # Cliente gRPC EuroMilRegister
│   │   └── server.js                     # Servidor Express (API REST)
│   ├── proto/
│   │   ├── voter.proto                   # Definicao Protocol Buffers (CrediBank)
│   │   └── voting.proto                  # Definicao Protocol Buffers (EuroMilRegister)
│   ├── package.json
│   └── .env                              # Configuracao de ambiente
├── frontend/
│   ├── index.html                        # Interface principal
│   ├── style.css                         # Estilos CSS
│   └── app.js                            # Logica JavaScript (fetch API)
├── README.md
└── .gitignore
```

---

Tecnologias Utilizadas

Backend:
- Node.js + Express (servidor HTTP)
- @grpc/grpc-js (cliente gRPC)
- @grpc/proto-loader (carregamento de ficheiros .proto)
- dotenv (gestao de variaveis de ambiente)
- CORS (Cross-Origin Resource Sharing)

Frontend:
- HTML5
- CSS3 (Grid Layout, Flexbox, Gradients)
- JavaScript Vanilla (Fetch API para chamadas REST)

Protocolo:
- gRPC (comunicacao com servicos backend)
- Protocol Buffers (serializacao de dados)
- TLS/SSL (encriptacao de comunicacao)

---

Detalhes de Implementacao

Mapeamento de Conceitos

O sistema adapta a terminologia do sistema de votacao para o contexto de apostas:

| Sistema Votacao | Sistema Apostas |
|-----------------|-----------------|
| Cartao Cidadao | ID Conta CrediBank |
| Credencial de Voto | Cheque Digital (10 creditos) |
| Candidato | Identificador de Aposta |
| Votar | Registar Aposta |

Conversao de Chave EuroMilhoes

A chave EuroMilhoes (5 numeros + 2 estrelas) e convertida num ID numerico usando modulo 3:

```javascript
hashKey(key) {
  const numbers = key.split('+')[0].split(',');
  const firstNumber = parseInt(numbers[0]) || 1;
  return ((firstNumber - 1) % 3) + 1;  // Sempre retorna 1, 2 ou 3
}
```

Isto garante compatibilidade com o sistema mockup que apenas suporta 3 candidatos.

---

Executar Servicos Localmente (Alternativa)

Caso pretenda executar os servicos gRPC localmente em vez de usar o servidor remoto:

Requisitos:
- .NET SDK instalado
- Repositorio VotingSystem do professor

Terminal 1 - Servico CrediBank (AR):
```bash
cd C:\Projetos\VotingSystem-master\VotingSystem.RegistrationService
dotnet run --urls http://localhost:9093
```

Terminal 2 - Servico EuroMilRegister (AV):
```bash
cd C:\Projetos\VotingSystem-master\VotingSystem.VotingSevice
dotnet run --urls http://localhost:9091
```

Atualizar configuracao:

Editar `backend/.env`:
```
PORT=3000
GRPC_SERVER=localhost:9091
GRPC_USE_TLS=false
```

Nota: Para servicos locais, TLS deve ser desativado (`GRPC_USE_TLS=false`).

---

Testar Manualmente com grpcurl

Instalar grpcurl:
- Windows: `choco install grpcurl`
- Linux/Mac: `brew install grpcurl`

Obter Cheque Digital (CrediBank):
```bash
echo '{"citizen_card_number":"123456789"}' | \
  grpcurl -proto backend/proto/voter.proto -d "@" \
  grpc-voting-mock-837732060165.europe-west1.run.app:443 \
  voting.VoterRegistrationService/IssueVotingCredential
```

Registar Aposta (EuroMilRegister):
```bash
echo '{"voting_credential":"CRED-ABC-123","candidate_id":1}' | \
  grpcurl -proto backend/proto/voting.proto -d "@" \
  grpc-voting-mock-837732060165.europe-west1.run.app:443 \
  voting.VotingService/Vote
```

Nota: O servidor no Google Cloud usa TLS por padrao, por isso nao e necessario o flag `-insecure`.

---

Resolucao de Problemas

Erro: "Cannot find module"
Solucao:
```bash
cd backend
npm install
```

Erro: "Port 3000 already in use"
Solucao:
Mudar porta no `backend/.env`:
```
PORT=3001
```

Erro: "Cheque invalido" (INVALID-xxxxxx)
Causa:Comportamento normal do sistema mockup (30% de probabilidade)

Solucao:Tentar novamente - na proxima tentativa pode emitir cheque valido

Erro: "Candidato inexistente"
Causa: Sistema mockup apenas suporta 3 candidatos

Solucao:Ja implementado - o sistema usa modulo 3 para garantir IDs validos

---

Limitacoes Conhecidas

1. Terminologia do servidor:** O servidor alternativo utiliza terminologia de "votacao" em vez de "apostas" porque e baseado no sistema original.

2. Numero de candidatos:** O sistema mockup apenas suporta 3 candidatos (A, B, C), pelo que a chave EuroMilhoes e convertida usando modulo 3.

---

Autor

Pedro Pires  
Integracao de Sistemas - 2025/2026  
UAB/UTAD

---

Licenca

MIT License - Projeto Academico

---

Agradecimentos

- Professor pela disponibilizacao do sistema mockup base
- Colega Henrique Crachat pela disponibilizacao do servidor alternativo no Google Cloud
