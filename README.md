# 🏷️ API de Gerenciamento de Cupons Promocionais

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-20.x-blue?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Jest](https://img.shields.io/badge/Tests-Jest-red?logo=jest)
![Docker](https://img.shields.io/badge/Container-Docker-blue?logo=docker)

Este projeto é uma **API RESTful** para gerenciamento de cupons de desconto. Ela permite **criar**, **consultar**, **atualizar** e **deletar** cupons promocionais.

A arquitetura segue os princípios de **Domain-Driven Design (DDD)** e está preparada para rodar localmente ou em containers Docker, com suporte completo a testes e validações assíncronas.

---

## ⚙️ Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- Instância do MongoDB (pode ser local ou via Docker)

---

## 📦 Como Instalar Dependências

Para instalar todas as bibliotecas e pacotes necessários, navegue até a pasta raiz e execute:

```bash
yarn install
```

---

## 🚀 Como Rodar Localmente (Modo Desenvolvimento)

### 1. Configurar o Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
PORT=3000
DATABASE_URI="mongodb://localhost:27017/coupons_db"
NODE_ENV=development
```

### 2. Iniciar o Banco de Dados

Garanta que o MongoDB esteja rodando localmente e acessível através da `DATABASE_URI`.

### 3. Iniciar o Servidor

Execute o comando abaixo para iniciar a aplicação. O servidor reiniciará automaticamente a cada alteração.

```bash
yarn dev
```

Se tudo estiver correto, a aplicação estará disponível em: `http://localhost:3000`

---

## 🐳 Como Subir com Docker

Este método cria um ambiente completo e isolado com a aplicação e o banco de dados.

### 1. Dockerfile

Garanta que seu `Dockerfile` esteja configurado para produção:

```dockerfile
# Estágio 1: Builder
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Estágio 2: Runner
FROM node:18-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 3000
CMD [ "node", "dist/app.js" ]
```

### 2. docker-compose.yml

Este arquivo orquestra a subida dos contêineres:

```yaml
version: "3.8"

services:
  app:
    container_name: coupons_api
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      DATABASE_URI: mongodb://mongo:27017/coupons_db
    depends_on:
      - mongo
    networks:
      - app-network

  mongo:
    container_name: mongo_db
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

volumes:
  mongo-data:

networks:
  app-network:
    driver: bridge
```

### 3. Subir os Contêineres

Execute o comando abaixo na raiz do projeto:

```bash
docker compose up -d
```

Para parar os contêineres, utilize:

```bash
docker compose down
```

---

## 🧪 Como Rodar os Testes

Para executar a suíte completa de testes unitários e de integração, use o comando:

```bash
yarn test
```

Os testes são localizados em arquivos com sufixos `.spec.ts` ou `.test.ts` dentro da pasta `__tests__`.

---

## 🧱 Descrição da Estrutura DDD Aplicada

A aplicação segue uma arquitetura em camadas linear, onde as dependências fluem em uma única direção para garantir o desacoplamento.

```
src/
├── application/      # Interface com o mundo externo
│   └── controllers/    # Recebem e tratam as requisições HTTP
│
├── domain/           # Lógica de negócio e orquestração
│   ├── services/       # Casos de uso (criação, validação, regras de negócio)
│   ├── interfaces/     # Contratos de dados e repositórios
│   └── events/         # Eventos de domínio
│
└── infrastructure/   # Detalhes técnicos e integração externa
    ├── repository/     # Implementação dos repositórios (ex: Mongoose)
    └── db/             # Configuração do banco com models e schemas
```

---

## 🔁 Explicação da Lógica de Validação Simulada

A API aplica um mecanismo de validação assíncrona simulada para acelerar a criação de cupons e realizar validações mais pesadas posteriormente.

**Etapas:**

1.  **Criação imediata:** O endpoint `POST /api/coupons` realiza validações básicas e salva o cupom com o status `pending`.

2.  **Resposta instantânea:** O cliente recebe uma resposta `201 Created` sem esperar a validação completa. No documento criado, o status será `'pending'`.

3.  **Agendamento da validação:** A função `scheduleValidation()` é chamada com `setTimeout` (3 segundos), simulando um _worker_.

4.  **Validação secundária:** Após o delay, regras adicionais são aplicadas (ex: desconto acima de 50%).

5.  **Atualização do status:** O status do cupom é atualizado para `'valid'` ou `'invalid'` no banco de dados.
