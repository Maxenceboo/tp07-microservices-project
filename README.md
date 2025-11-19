# **TP07 – Microservices Project**

Projet final du module DevOps / Microservices.
L’objectif est de construire une architecture complète composée de :

- **Frontend (Next.js)**
- **Auth Service (FastAPI + SQLite)**
- **Order Service (NestJS + SQLite)**
- **Dockerisation complète**
- **Orchestration Kubernetes (Minikube / Orbstack)**
- **Ingress + communication entre services**

Ce repo est organisé sous forme de **monorepo** pour faciliter le rendu, la compréhension du prof et la gestion des différentes briques.

## 🗂️ Structure du projet

```
/
├── frontend/              # Next.js + API Gateway
├── services/
│   ├── auth-service/      # FastAPI + JWT + SQLite
│   └── order-service/     # NestJS + SQLite
├── infra/
│   ├── docker/            # Dockerfiles + docker-compose.yml
│   └── k8s/               # Manifests Kubernetes (Deployments, Services, Ingress)
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
- **SQLite**
- **Docker / Docker Compose**
- **Kubernetes (Minikube / Orbstack)**

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
docker build -t destyke/order-service:latest ./services/order-service
docker push destyke/order-service:latest
```

**Frontend**

```bash
docker build -t destyke/frontend:latest ./frontend
docker push destyke/frontend:latest
```

### 2. Démarrage de l'infrastructure Kubernetes

**Lancer Minikube**

```bash
minikube start
minikube addons enable ingress
```

**Déployer les services**

```bash
kubectl apply -f k8s/
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
