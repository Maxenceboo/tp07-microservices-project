FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Prisma needs a valid DATABASE_URL at build time; override in runtime as needed
ARG DATABASE_URL="postgresql://user:password@localhost:5432/db"
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
