# 🏷️ API de Gerenciamento de Cupons Promocionais

Este projeto é uma **API RESTful** para gerenciamento de cupons de desconto. Ela permite **criar**, **consultar**, **atualizar** e **deletar** cupons promocionais.

A arquitetura segue os princípios de **Domain-Driven Design (DDD)** e está preparada para rodar localmente ou em containers Docker, com suporte completo a testes e validações assíncronas.

---

## ⚙️ Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- Instância do MongoDB (pode ser local ou via Docker)

---

## 📦 Como instalar dependências com Yarn

```bash
yarn install
🚀 Como rodar localmente (modo desenvolvimento)
1. Configurar o ambiente
Crie um arquivo .env na raiz do projeto com o seguinte conteúdo:

env

PORT=3000
DATABASE_URI="mongodb://localhost:27017/coupons_db"
NODE_ENV=development
2. Iniciar o banco de dados
Garanta que o MongoDB esteja rodando localmente e acessível via DATABASE_URI.

3. Iniciar o servidor
bash

yarn dev
Se tudo estiver correto, a aplicação estará disponível em:

arduino

http://localhost:3000
🐳 Como subir com Docker (docker-compose up -d)
1. Dockerfile
dockerfile

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
CMD ["node", "dist/app.js"]
2. docker-compose.yml
yaml

version: '3.8'

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
3. Subir os containers
bash

docker-compose up -d
Para parar os containers:

bash

docker-compose down
🧪 Como rodar os testes (yarn test)
bash

yarn test
Os testes são localizados em arquivos com sufixos .spec.ts ou .test.ts dentro da pasta tests.

🧱 Descrição da estrutura DDD aplicada
txt

src/
├── application/        # Interface com o mundo externo
│   └── controllers/    # Recebem e tratam as requisições HTTP
│
├── domain/             # Lógica de negócio e orquestração
│   ├── services/       # Casos de uso (criação, validação, regras de negócio, etc.)
│   └── interfaces/     # Contratos
│   └── entities/       # Entidades
│
├── infrastructure/     # Detalhes técnicos e integração externa
    ├── repository/     # Implementação dos repositórios (ex: Mongoose)
    └── db/             # Configuração do banco com models e schemas
🔁 Explicação da lógica de validação simulada
A API aplica um mecanismo de validação assíncrona simulada para acelerar a criação de cupons e realizar validações mais pesadas posteriormente.

Etapas:
Criação imediata
O endpoint POST /api/coupons realiza validações básicas e salva o cupom com status pending.

Resposta instantânea
O cliente recebe uma resposta 201 Created sem esperar a validação completa. No documento criado, o status será 'pending'.

Agendamento da validação
A função scheduleValidation() é chamada com setTimeout (3 segundos), simulando um worker.

Validação secundária
Após o delay, regras adicionais são aplicadas (ex: desconto acima de 50%).

Atualização do status
O status do cupom é atualizado para valid ou invalid no banco.
```
