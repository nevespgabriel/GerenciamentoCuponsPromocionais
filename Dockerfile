FROM node:20.13.1-alpine3.18 AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de dependência primeiro para aproveitar o cache do Docker
COPY package.json yarn.lock ./

# Instala TODAS as dependências (incluindo devDependencies como typescript)
RUN yarn install --frozen-lockfile

# Copia o restante do código-fonte da aplicação
COPY . .

# Compila o código TypeScript para JavaScript, criando a pasta /dist
RUN yarn build


FROM node:20.13.1-alpine3.18

WORKDIR /usr/src/app

# Copia apenas o package.json para poder instalar somente as dependências de produção
COPY package.json yarn.lock ./

# Instala APENAS as dependências de produção
RUN yarn install --production --frozen-lockfile

# Copia o código JavaScript compilado do estágio 'builder'
COPY --from=builder /usr/src/app/dist ./dist

# Expõe a porta que a aplicação vai usar dentro do contêiner
EXPOSE 3000

# O comando para iniciar a aplicação em produção
CMD [ "node", "dist/app.js" ]