# Pulse

Gestão inteligente de pendências pessoais com dashboard adaptativo.

## Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Cloudflare Workers + Hono.js
- **Banco**: Cloudflare D1 (SQLite)
- **Auth**: Google OAuth 2.0
- **Integração**: Google Calendar API
- **Hospedagem**: Cloudflare Pages (pulse.inovacx.com)

## Setup

### 1. Instalar dependências

```bash
npm install
cd workers && npm install && cd ..
```

### 2. Criar recursos Cloudflare

```bash
# D1 database
npx wrangler d1 create pulse-db

# KV namespace (sessions)
npx wrangler kv:namespace create SESSIONS
```

Copie os IDs gerados para `workers/wrangler.toml`.

### 3. Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto → APIs & Services → Credentials
3. OAuth 2.0 Client ID → Web application
4. Redirect URI: `https://pulse.inovacx.com/api/auth/callback` (e `http://localhost:5173/api/auth/callback` para dev)
5. Copie Client ID e Secret para `workers/wrangler.toml` e `workers/.dev.vars`

### 4. Rodar o banco

```bash
npm run db:migrate
```

### 5. Desenvolvimento local

Terminal 1 (Worker):
```bash
npm run worker:dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 6. Deploy

```bash
npm run build
npm run worker:deploy
# Frontend: push para o repositório (Cloudflare Pages CI/CD automático)
```

## Funcionalidades

- **Formulário step-by-step**: Adicione tarefas em 6 passos guiados
- **Matriz Eisenhower**: Visualize urgência × importância interativamente
- **Linha do tempo**: Tarefas com prazo ordenadas por data
- **Alertas inteligentes**: Atrasadas, em risco, envelhecendo, sugestão de próxima
- **Score de prioridade**: urgência × importância, desempate por menor esforço
- **Google Calendar**: Leitura do tempo livre, bloqueio de horários
- **Dark/Light mode**: Alternância com preferência salva
- **Interface em PT-BR**: 100% em português
