# EuroMilhoes - Sistema de Apostas Online

**Tarefa 7 - Atividade III**  
**Integracao de Sistemas - 2025/2026**

Sistema de apostas EuroMilhoes online que integra com:
- **CrediBank**: Sistema de creditos (emite cheques digitais de 10 creditos)
- **EuroMilRegister**: Sistema de registo de apostas

---

## Funcionalidades

- Interface web intuitiva para apostas
- Selecao visual de numeros (1-50) e estrelas (1-12)
- Integracao com CrediBank via gRPC
- Integracao com EuroMilRegister via gRPC
- Validacao completa de dados
- Feedback em tempo real

---

## Como Executar

### Pre-requisitos:
- Node.js 18+ instalado
- Acesso ao endpoint gRPC: `ken01.utad.pt:9091` (ou executar servicos localmente)

### Passo 1: Instalar Dependencias

```bash
cd backend
npm install
```

### Passo 2: Configurar Endpoint (Opcional)

Editar `backend/.env` se necessario:
```
GRPC_SERVER=ken01.utad.pt:9091
PORT=3000
```

Para testes locais:
```
GRPC_SERVER=localhost:9091
PORT=3000
```

### Passo 3: Iniciar Servidor

```bash
cd backend
npm start
```

O servidor arranca em: **http://localhost:3000**

### Passo 4: Abrir no Browser

Abre o browser e vai a: **http://localhost:3000**

---

## Como Fazer uma Aposta

1. **Inserir ID da Conta CrediBank**
   - Exemplo: `123456789`

2. **Selecionar 5 Numeros (1-50)**
   - Clica nos numeros pretendidos
   - Maximo 5 numeros

3. **Selecionar 2 Estrelas (1-12)**
   - Clica nas estrelas pretendidas
   - Maximo 2 estrelas

4. **Clicar em "Registar Aposta"**

5. **Sistema processa automaticamente:**
   - Contacta CrediBank -> Emite cheque digital de 10 creditos
   - Contacta EuroMilRegister -> Regista aposta com o cheque
   - Mostra resultado (sucesso ou erro)

---

## Arquitetura

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │ HTTP REST
       ▼
┌─────────────┐
│   Express   │
│  (Backend)  │
└──────┬──────┘
       │ gRPC
       ▼
┌─────────────────────────────┐
│  ken01.utad.pt:9091         │
│  ┌───────────┐ ┌──────────┐ │
│  │ CrediBank │ │ EuroMil  │ │
│  │    (AR)   │ │Register  │ │
│  │           │ │   (AV)   │ │
│  └───────────┘ └──────────┘ │
└─────────────────────────────┘
```

---

## Estrutura do Projeto

```
euromilhoes-app/
├── backend/
│   ├── src/
│   │   ├── grpc-clients/
│   │   │   ├── credibank-client.js       # Cliente gRPC CrediBank
│   │   │   └── euromilregister-client.js # Cliente gRPC EuroMilRegister
│   │   └── server.js                     # Servidor Express
│   ├── proto/
│   │   ├── voter.proto                   # Definicao CrediBank
│   │   └── voting.proto                  # Definicao EuroMilRegister
│   ├── package.json
│   └── .env
├── frontend/
│   ├── index.html                        # Interface principal
│   ├── style.css                         # Estilos
│   └── app.js                            # Logica frontend
├── README.md
└── .gitignore
```

---

## Tecnologias Utilizadas

- **Backend:**
  - Node.js + Express
  - gRPC (@grpc/grpc-js)
  - Protocol Buffers

- **Frontend:**
  - HTML5
  - CSS3 (Grid, Flexbox, Gradients)
  - JavaScript Vanilla (Fetch API)

---

## Testar Manualmente com grpcurl

### Obter Cheque Digital (CrediBank):
```bash
echo '{"citizen_card_number":"123456789"}' | \
  grpcurl -insecure -proto backend/proto/voter.proto -d "@" \
  ken01.utad.pt:9091 \
  voting.VoterRegistrationService/IssueVotingCredential
```

### Registar Aposta (EuroMilRegister):
```bash
echo '{"voting_credential":"CRED-ABC-123","candidate_id":1}' | \
  grpcurl -insecure -proto backend/proto/voting.proto -d "@" \
  ken01.utad.pt:9091 \
  voting.VotingService/Vote
```

---

## Executar Servicos Localmente

Para testes locais sem depender do servidor do professor:

### Terminal 1 - Servico CrediBank (AR):
```bash
cd C:\Projetos\VotingSystem-master\VotingSystem.RegistrationService
dotnet run --urls http://localhost:9093
```

### Terminal 2 - Servico EuroMilRegister (AV):
```bash
cd C:\Projetos\VotingSystem-master\VotingSystem.VotingSevice
dotnet run --urls http://localhost:9091
```

Depois atualizar `backend/.env`:
```
GRPC_SERVER=localhost:9091
```

---

## Resolucao de Problemas

### Erro: "Cannot find module"
```bash
cd backend
npm install
```

### Erro: "ECONNREFUSED"
- Verificar se o endpoint `ken01.utad.pt:9091` esta acessivel
- Ou executar servicos localmente (ver secao acima)
- Confirmar firewall/rede

### Erro: "Port 3000 already in use"
- Mudar porta no `backend/.env`:
  ```
  PORT=3001
  ```

---

## Autor

**Pedro Pires**  
Integracao de Sistemas - 2025/2026

---

## Licenca

MIT License - Projeto Academico
