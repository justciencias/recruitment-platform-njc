# Use a imagem oficial do Node.js (versão estável e leve)
FROM node:18-alpine

# Define a pasta de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os ficheiros de dependências primeiro (otimiza o cache do Docker)
COPY package*.json ./

# Instala as dependências (incluindo 'pg' para a base de dados e 'bcrypt' para senhas)
RUN npm install

# Copia todo o resto do código do seu projeto
COPY . .

# Expõe a porta que o seu server.js está a usar (definida no seu projeto como 5000)
EXPOSE 5000

# O comando para iniciar a aplicação
# Nota: Isto garante que o processo Node.js não feche imediatamente
CMD ["npm", "start"]    