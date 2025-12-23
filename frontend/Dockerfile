FROM node:22-bookworm
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# O host 0.0.0.0 é obrigatório para o Docker expor a porta
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]