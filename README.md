# **TP07 – Microservices Project**

Projet final du module DevOps / Microservices.
L’objectif est de construire une architecture complète composée de :

- **Frontend (Next.js)**
- **Auth Service (FastAPI + SQLite, JWT)**
- **Order Service (NestJS + SQLite, JWT)**
- **Cocktail Service (NestJS + PostgreSQL, JWT)**
- **Dockerisation complète**
- **Orchestration Kubernetes (Minikube / Orbstack)**
- **Ingress + communication entre services**

Ce repo est organisé sous forme de **monorepo** pour faciliter le rendu, la compréhension du prof et la gestion des différentes briques.

## 🗂️ Structure du projet

```
/
├── frontend/              # Next.js + front web
├── services/
│   ├── auth-service/      # FastAPI + JWT + SQLite
│   ├── order-service/     # NestJS + SQLite
│   └── cocktail-service/  # NestJS + PostgreSQL + Swagger
├── docker/                # docker-compose.yml
├── k8s/                   # Manifests Kubernetes (Deployments, Services, Ingress)
└── docs/                  # Notes, schémas, captures
```

## 🚀 Objectifs du projet

- Développer et containeriser plusieurs microservices
- Mettre en place une architecture modulaire
- Déployer l’ensemble dans un cluster Kubernetes
- Configurer l’exposition externe via un Ingress
- Assurer la communication entre tous les services

## 📦 Technologies

- **Next.js**
- **FastAPI**
- **NestJS**
- **SQLite / PostgreSQL**
- **Docker / Docker Compose**
- **Kubernetes (Minikube / Orbstack)**

## 🧪 Lancer en local avec Docker Compose

Guide detaille pour tous les modes de lancement : [docs/launch.md](docs/launch.md)

```bash
docker compose up --build
```

Services exposés (Docker Compose) :

- Auth Service : `http://localhost:8000/docs` (OpenAPI `http://localhost:8000/openapi.json`)
- Order Service : `http://localhost:4000`
- Cocktail Service : `http://localhost:3001/api`
- Frontend : `http://localhost:3000`

Frontend : après connexion, accès aux commandes (`/dashboard`) et à la page cocktails (`/mix`) pour liker/disliker des suggestions (déduplication des cocktails déjà notés côté UI).

Flux d’auth (local) :
1. Créer un utilisateur via `POST /auth/register` sur `http://localhost:8000/docs`
2. Récupérer un `access_token` via `POST /auth/login`
3. Dans Swagger Cocktail (`/api`), **Authorize** puis coller le token (sans `Bearer `)

### Particularités Kubernetes (Ingress / prefix)

- L’Ingress expose les services sous :
  - Auth : `http://devops.local/auth/docs` (OpenAPI `http://devops.local/auth/openapi.json`)
  - Cocktail : `http://devops.local/cocktail/api`
  - Order : `http://devops.local/orders` (selon config)
- L’app auth est configurée avec `root_path=/auth` ; l’app cocktail a un préfixe global `/cocktail`. Les probes sont alignées sur ces chemins.
- Utiliser la même valeur `JWT_SECRET` pour auth-service et cocktail-service (ex. `super-secret-key`).

## 🔧 Commandes de déploiement

### 1. Build & Push des images Docker

Il est nécessaire de construire les images et de les pousser sur un registre (ici Docker Hub) pour que Kubernetes puisse les récupérer.

**Auth Service**

```bash
docker build -t destryke/auth-service:latest ./services/auth-service
docker push destryke/auth-service:latest
```

**Order Service**

```bash
docker build -t destryke/order-service:latest ./services/order-service
docker push destryke/order-service:latest
```

**Cocktail Service**

```bash
docker build -t destryke/cocktail-service:latest ./services/cocktail-service
docker push destryke/cocktail-service:latest
```

**Frontend**

```bash
docker build -t destryke/frontend:latest ./frontend
docker push destryke/frontend:latest
```

### 2. Démarrage de l'infrastructure Kubernetes

**Lancer Minikube**

```bash
minikube start --driver=docker
minikube addons enable ingress
```

**Déployer les services**

Par dossier (recommandé) :

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/auth
kubectl apply -f k8s/order
kubectl apply -f k8s/cocktail
kubectl apply -f k8s/frontend
kubectl apply -f k8s/ingress
```

**Vérifier le statut**

```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

**Accéder à l'application**
Récupérer l'IP de Minikube :

```bash
minikube ip
```

Ensuite, ajoutez cette IP dans votre `/etc/hosts` si vous utilisez un nom de domaine spécifique configuré dans l'Ingress.
