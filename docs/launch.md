# Lancer le projet de plusieurs manieres

Ce guide explique comment lancer le projet selon 4 approches differentes :

- en local avec les commandes de chaque service
- avec Docker Compose
- avec Docker conteneur par conteneur
- avec Kubernetes

## Vue d'ensemble

Le projet contient 4 briques :

- frontend Next.js sur le port `3000`
- auth-service FastAPI sur le port `8000`
- order-service NestJS sur le port `4000`
- cocktail-service NestJS sur le port `3001`

Le cocktail-service depend d'une base PostgreSQL sur le port `5432`.

## Prerequis communs

- Windows + PowerShell
- Docker Desktop si tu utilises Docker ou Kubernetes avec Minikube driver Docker
- Minikube si tu veux tester le mode Kubernetes localement
- Node.js 20+
- npm
- Python 3.12+ pour auth-service en local
- PostgreSQL si tu veux lancer cocktail-service sans Docker

## Variables importantes

La variable `JWT_SECRET` doit etre la meme dans :

- `services/auth-service/.env`
- `services/order-service/.env`
- `services/cocktail-service/.env`

Exemple :

```env
JWT_SECRET=super-secret-key
```

## 1. Lancement en local avec les commandes de chaque service

Cette methode lance chaque service directement sur ta machine, sans conteneur.

### 1.1 Auth Service en local

```powershell
cd .\services\auth-service
Copy-Item .env.example .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python init_db.py
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Le service sera disponible sur `http://localhost:8000/docs`.

Si `py` n'existe pas sur Windows, utilise `python` comme ci-dessus.
Si PowerShell bloque `Activate.ps1`, lance d'abord :

```powershell
Set-ExecutionPolicy -Scope Process Bypass
```

### 1.2 Order Service en local

```powershell
cd .\services\order-service
Copy-Item .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Le service sera disponible sur `http://localhost:4000`.

### 1.3 Cocktail Service en local

Avant de lancer le service, il faut un PostgreSQL local avec :

- utilisateur : `user`
- mot de passe : `password`
- base : `cocktail_db`

Commence par creer le fichier `.env` :

```powershell
cd .\services\cocktail-service
Copy-Item .env.example .env
```

Puis adapte `services/cocktail-service/.env` comme ceci :

```env
DATABASE_URL=postgresql://user:password@localhost:5432/cocktail_db
PORT=3001
JWT_SECRET=super-secret-key
```

Puis lance :

```powershell
cd .\services\cocktail-service
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

Le service sera disponible sur `http://localhost:3001/api`.

### 1.4 Frontend en local

Pour un lancement local, cree `frontend/.env.local` avec des URLs localhost :

```env
AUTH_SERVICE_URL=http://localhost:8000
ORDER_SERVICE_URL=http://localhost:4000/orders
COCKTAIL_SERVICE_URL=http://localhost:3001/cocktail
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
```

Puis lance :

```powershell
cd .\frontend
npm install
npm run dev
```

Le frontend sera disponible sur `http://localhost:3000`.

### 1.5 Ordre de lancement recommande en local

1. PostgreSQL
2. auth-service
3. order-service
4. cocktail-service
5. frontend

## 2. Lancement avec Docker Compose

C'est la methode la plus simple pour lancer toute la stack d'un coup.

### 2.1 Creer les fichiers `.env`

Backend :

```powershell
Copy-Item .\services\auth-service\.env.example .\services\auth-service\.env
Copy-Item .\services\order-service\.env.example .\services\order-service\.env
Copy-Item .\services\cocktail-service\.env.example .\services\cocktail-service\.env
```

Frontend :

```powershell
@"
AUTH_SERVICE_URL=http://auth-service:8000
ORDER_SERVICE_URL=http://order-service:4000/orders
COCKTAIL_SERVICE_URL=http://cocktail-service:3001/cocktail
"@ | Set-Content .\frontend\.env
```

### 2.2 Lancer toute la stack

```powershell
docker compose up --build
```

### 2.3 Arreter la stack

```powershell
docker compose down
```

Avec suppression des volumes :

```powershell
docker compose down -v
```

## 3. Lancement avec Docker, conteneur par conteneur

Cette methode est utile si tu veux lancer les services un par un sans utiliser Compose.

### 3.1 Creer un reseau Docker

```powershell
docker network create tp07-net
```

### 3.2 Lancer PostgreSQL

```powershell
docker run -d --name postgres --network tp07-net -p 5432:5432 -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=cocktail_db postgres:15-alpine
```

### 3.3 Construire les images depuis les Dockerfiles

```powershell
docker build -t tp07/auth-service:local .\services\auth-service
docker build -t tp07/order-service:local .\services\order-service
docker build -t tp07/cocktail-service:local .\services\cocktail-service
docker build -t tp07/frontend:local .\frontend
```

### 3.4 Lancer auth-service

```powershell
docker run -d --name auth-service --network tp07-net -p 8000:8000 --env-file .\services\auth-service\.env tp07/auth-service:local
```

### 3.5 Lancer order-service

```powershell
docker run -d --name order-service --network tp07-net -p 4000:4000 --env-file .\services\order-service\.env -v order_db_data:/app/prisma tp07/order-service:local
```

### 3.6 Lancer cocktail-service

Le `DATABASE_URL` doit viser le conteneur PostgreSQL du reseau Docker :

```powershell
docker run -d --name cocktail-service --network tp07-net -p 3001:3001 --env-file .\services\cocktail-service\.env -e DATABASE_URL=postgresql://user:password@postgres:5432/cocktail_db tp07/cocktail-service:local
```

### 3.7 Lancer frontend

Le frontend doit utiliser les noms de conteneurs comme hosts internes Docker. Cree d'abord `frontend/.env` :

```powershell
@"
AUTH_SERVICE_URL=http://auth-service:8000
ORDER_SERVICE_URL=http://order-service:4000/orders
COCKTAIL_SERVICE_URL=http://cocktail-service:3001/cocktail
"@ | Set-Content .\frontend\.env
```

Puis lance :

```powershell
docker run -d --name frontend --network tp07-net -p 3000:3000 --env-file .\frontend\.env tp07/frontend:local
```

### 3.8 Voir les logs et arreter les conteneurs

```powershell
docker logs -f auth-service
docker logs -f order-service
docker logs -f cocktail-service
docker logs -f frontend
```

```powershell
docker stop frontend cocktail-service order-service auth-service postgres
docker rm frontend cocktail-service order-service auth-service postgres
```

## 4. Lancement via les Dockerfiles seulement

Si tu veux seulement verifier que chaque Dockerfile fonctionne, sans tout brancher ensemble, tu peux construire et tester chaque image separement.

### 4.1 Auth Service

```powershell
docker build -t tp07/auth-service:test .\services\auth-service
docker run --rm -p 8000:8000 --env-file .\services\auth-service\.env tp07/auth-service:test
```

### 4.2 Order Service

```powershell
docker build -t tp07/order-service:test .\services\order-service
docker run --rm -p 4000:4000 --env-file .\services\order-service\.env tp07/order-service:test
```

### 4.3 Cocktail Service

Il faut un PostgreSQL accessible, sinon l'image demarre mais le service ne sera pas operationnel.

```powershell
docker build -t tp07/cocktail-service:test .\services\cocktail-service
docker run --rm -p 3001:3001 --env-file .\services\cocktail-service\.env -e DATABASE_URL=postgresql://user:password@host.docker.internal:5432/cocktail_db tp07/cocktail-service:test
```

### 4.4 Frontend

```powershell
docker build -t tp07/frontend:test .\frontend
docker run --rm -p 3000:3000 --env-file .\frontend\.env tp07/frontend:test
```

## 5. Lancement avec Kubernetes

Cette methode suppose que les images sont accessibles par ton cluster, par exemple via Docker Hub ou via le daemon Docker de Minikube.

### 5.0 Launcher Kubernetes (copier-coller)

Commande unique pour tout lancer en local (Minikube + build + deploy + verification) :

```powershell
Set-Location 'C:\Users\maxen\IdeaProjects\tp07-microservices-project'; `
& 'C:\Program Files\Kubernetes\Minikube\minikube.exe' start --driver=docker; `
& 'C:\Program Files\Kubernetes\Minikube\minikube.exe' addons enable ingress; `
docker build -t tp07-microservices-project-auth-service:latest .\services\auth-service; `
docker build -t tp07-microservices-project-order-service:latest .\services\order-service; `
docker build -t tp07-microservices-project-cocktail-service:latest .\services\cocktail-service; `
docker build -t tp07-microservices-project-frontend:latest .\frontend; `
docker tag tp07-microservices-project-auth-service:latest destryke/auth-service:latest; `
docker tag tp07-microservices-project-order-service:latest destryke/order-service:latest; `
docker tag tp07-microservices-project-cocktail-service:latest destryke/cocktail-service:latest; `
docker tag tp07-microservices-project-frontend:latest destryke/frontend:latest; `
& 'C:\Program Files\Kubernetes\Minikube\minikube.exe' image load destryke/auth-service:latest; `
& 'C:\Program Files\Kubernetes\Minikube\minikube.exe' image load destryke/order-service:latest; `
& 'C:\Program Files\Kubernetes\Minikube\minikube.exe' image load destryke/cocktail-service:latest; `
& 'C:\Program Files\Kubernetes\Minikube\minikube.exe' image load destryke/frontend:latest; `
kubectl apply -f k8s/namespace.yaml; `
kubectl apply -n microservices -f k8s/auth; `
kubectl apply -n microservices -f k8s/order; `
kubectl apply -n microservices -f k8s/cocktail; `
kubectl apply -n microservices -f k8s/frontend; `
kubectl apply -n microservices -f k8s/ingress; `
kubectl get pods -n microservices; `
kubectl get ingress -n microservices -o wide
```

Puis, dans un deuxieme terminal, lancer le tunnel :

```powershell
& 'C:\Program Files\Kubernetes\Minikube\minikube.exe' tunnel
```

Ensuite, ajouter dans le fichier hosts Windows :

```text
127.0.0.1 devops.local
```

URL locale finale : `http://devops.local`

### 5.1 Construire et pousser les images

```powershell
docker build -t destryke/auth-service:latest .\services\auth-service
docker push destryke/auth-service:latest

docker build -t destryke/order-service:latest .\services\order-service
docker push destryke/order-service:latest

docker build -t destryke/cocktail-service:latest .\services\cocktail-service
docker push destryke/cocktail-service:latest

docker build -t destryke/frontend:latest .\frontend
docker push destryke/frontend:latest
```

### 5.2 Demarrer Minikube

```powershell
minikube start --driver=docker
minikube addons enable ingress
```

### 5.3 Deployer les manifests

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -n microservices -f k8s/auth
kubectl apply -n microservices -f k8s/order
kubectl apply -n microservices -f k8s/cocktail
kubectl apply -n microservices -f k8s/frontend
kubectl apply -n microservices -f k8s/ingress
```

### 5.4 Verifier le statut

```powershell
kubectl get pods -n microservices
kubectl get services -n microservices
kubectl get ingress -n microservices
```

### 5.5 Recuperer l'IP et exposer le domaine local

```powershell
minikube ip
```

Ajoute ensuite une entree dans le fichier hosts de Windows pour `devops.local`.

Exemple :

```text
192.168.49.2 devops.local
```

### 5.6 Acces attendus

- Auth : `http://devops.local/auth/docs`
- Cocktail : `http://devops.local/cocktail/api`
- Order : `http://devops.local/orders`

## 6. Quelle methode choisir

- local par commandes : utile pour developper et debugger service par service
- Docker Compose : utile pour lancer toute la stack rapidement
- Docker conteneur par conteneur : utile pour comprendre le wiring reseau et les variables d'environnement
- Kubernetes : utile pour la soutenance, le deploiement et les tests d'orchestration

## 7. Depannage rapide

### Ports deja pris

Verifier les ports : `3000`, `3001`, `4000`, `5432`, `8000`.

### Frontend inaccessible en Docker

Verifier que `frontend/.env` existe et qu'il contient bien les noms de services Docker.

### Auth KO entre services

Verifier que `JWT_SECRET` est identique partout.

### Cocktail-service ne demarre pas

Verifier que PostgreSQL repond bien sur la bonne URL `DATABASE_URL`.

### Logs utiles

```powershell
docker compose logs -f
kubectl logs -n microservices deployment/auth-service
kubectl logs -n microservices deployment/order-service
kubectl logs -n microservices deployment/cocktail-service
kubectl logs -n microservices deployment/frontend
```