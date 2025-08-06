FROM node:20-alpine as builder

WORKDIR /app

# Instalar pnpm globalmente na etapa de build
RUN npm install -g pnpm

# Copiar arquivos de dependências e instalar
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar o restante do código da aplicação
COPY . .

# Build da aplicação React
RUN pnpm run build

# Imagem final para servir os arquivos estáticos com nginx
FROM nginx:alpine

# Copiar configuração personalizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos buildados da etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


