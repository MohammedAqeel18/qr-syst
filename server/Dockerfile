FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
