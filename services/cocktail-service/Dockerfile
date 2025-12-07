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

# Pousse le schéma Prisma (crée la table cocktail_history) puis démarre.
# En prod, remplacer par `prisma migrate deploy` si des migrations sont gérées.
CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
