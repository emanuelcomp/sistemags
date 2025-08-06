# Etapa de build
FROM node:20-alpine as builder

WORKDIR /app

# Instala o pnpm globalmente para ser usado na proxima etapa
RUN npm install -g pnpm

# Copia os arquivos de dependência e instala
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copia o restante do código da aplicação
COPY . .

# Constrói a aplicação React
RUN pnpm run build

# Etapa final para servir com Nginx
FROM nginx:alpine

# Copia a configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos buildados da etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
